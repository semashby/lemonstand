import { createServiceClient } from "@/lib/supabase/server";

// AI helper for booking notes. Talks to any OpenAI-compatible API.
// AI_PROVIDER=fake answers locally and only records a pretend cost, so you can
// try everything without paying for it.
const apiKey = process.env.AI_API_KEY;
const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
const model = process.env.AI_MODEL ?? "gpt-4o-mini";

// Pretend price for the fake provider: €2 per million tokens, like a mid-size model.
const FAKE_CENTS_PER_TOKEN = 0.0002;

// The limits. Nothing in the request gets a say in these.
const MAX_NOTE_TOKENS = 300;
const MAX_PROMPT_CHARS = 500;
const NOTES_PER_HOUR = 10;
const DAILY_CAP_CENTS = Number(process.env.AI_DAILY_CAP_CENTS ?? 500);

// What one note can cost at most, in tokens: the prompt plus the answer.
const WORST_CASE_TOKENS = MAX_NOTE_TOKENS + Math.ceil(MAX_PROMPT_CHARS / 4);

export class AiLimitReached extends Error {}

// Save the row first, then count. Requests arriving together see each other's
// rows, so the limit holds however long the AI takes to answer. If the count
// can't be read, the answer is no.
async function reserve(userId: string) {
  const db = createServiceClient();
  const { data: row, error } = await db
    .from("ai_usage")
    .insert({ user_id: userId, tokens: WORST_CASE_TOKENS, cost_cents: WORST_CASE_TOKENS * FAKE_CENTS_PER_TOKEN })
    .select("id")
    .single();
  if (error || !row) throw new AiLimitReached();

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const [mine, spend] = await Promise.all([
    db.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", hourAgo),
    db.rpc("ai_spend_today"),
  ]);
  const withinLimits =
    !mine.error && !spend.error && mine.count !== null && mine.count <= NOTES_PER_HOUR && Number(spend.data) <= DAILY_CAP_CENTS;
  if (!withinLimits) {
    await db.from("ai_usage").delete().eq("id", row.id);
    throw new AiLimitReached();
  }
  return row.id;
}

export async function writeNote(rawPrompt: string, userId: string) {
  const prompt = rawPrompt.slice(0, MAX_PROMPT_CHARS);
  const usageId = await reserve(userId);
  let text: string;
  let tokens: number;

  if ((process.env.AI_PROVIDER ?? "fake") === "fake") {
    text = fakeNote(prompt);
    // The fake provider bills as if it used the whole budget it was given.
    tokens = MAX_NOTE_TOKENS + Math.ceil(prompt.length / 4);
  } else {
    // No key, no AI: fail here rather than fall back to one in the code.
    if (!apiKey) throw new Error("AI_API_KEY is not set");
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: MAX_NOTE_TOKENS,
        messages: [
          { role: "system", content: "You help customers of Lemonstand, a juice bar, write a short friendly note for their booking." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    text = data.choices?.[0]?.message?.content ?? "";
    tokens = data.usage?.total_tokens ?? WORST_CASE_TOKENS;
  }

  // The row held the worst case. Now it can say what the note really cost.
  await createServiceClient()
    .from("ai_usage")
    .update({ tokens, cost_cents: tokens * FAKE_CENTS_PER_TOKEN })
    .eq("id", usageId);

  return text;
}

// This month's bill, added up by the database. A sum in JavaScript would stop
// growing at 1,000 rows, the most a select returns.
export async function aiBillCents() {
  const { data, error } = await createServiceClient().rpc("ai_bill_this_month");
  if (error) throw error;
  return Number(data);
}

function fakeNote(prompt: string) {
  const topic = prompt.trim().slice(0, 80) || "my booking";
  return `Hi Lemonstand! Looking forward to it. A quick note about ${topic}. Thank you!`;
}
