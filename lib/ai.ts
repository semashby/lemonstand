import { createServiceClient } from "@/lib/supabase/server";

// AI helper for booking notes. Talks to any OpenAI-compatible API.
// AI_PROVIDER=fake answers locally and only records a pretend cost, so you can
// try everything without paying for it.
const apiKey = process.env.AI_API_KEY;
const baseUrl = process.env.AI_BASE_URL ?? "https://api.openai.com/v1";
const model = process.env.AI_MODEL ?? "gpt-4o-mini";

// Pretend price for the fake provider: €2 per million tokens, like a mid-size model.
const FAKE_CENTS_PER_TOKEN = 0.0002;

export async function writeNote(prompt: string, maxTokens: number, userId: string | null) {
  let text: string;
  let tokens: number;

  if ((process.env.AI_PROVIDER ?? "fake") === "fake") {
    text = fakeNote(prompt);
    // The fake provider bills as if it used the whole budget it was given.
    tokens = maxTokens + Math.ceil(prompt.length / 4);
  } else {
    // No key, no AI: fail here rather than fall back to one in the code.
    if (!apiKey) throw new Error("AI_API_KEY is not set");
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: "You help customers of Lemonstand, a juice bar, write a short friendly note for their booking." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await res.json();
    text = data.choices?.[0]?.message?.content ?? "";
    tokens = data.usage?.total_tokens ?? 0;
  }

  await createServiceClient()
    .from("ai_usage")
    .insert({ user_id: userId, tokens, cost_cents: tokens * FAKE_CENTS_PER_TOKEN });

  return text;
}

export async function aiBillCents() {
  const { data } = await createServiceClient().from("ai_usage").select("cost_cents");
  return (data ?? []).reduce((sum, row) => sum + Number(row.cost_cents), 0);
}

function fakeNote(prompt: string) {
  const topic = prompt.trim().slice(0, 80) || "my booking";
  return `Hi Lemonstand! Looking forward to it. A quick note about ${topic}. Thank you!`;
}
