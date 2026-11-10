import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AiLimitReached, writeNote } from "@/lib/ai";

// "Help me write a note" on the booking form. Signed-in customers only: every
// note costs money, so no account, no AI. Guests can still book.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { prompt } = await request.json();
  try {
    return NextResponse.json({ note: await writeNote(String(prompt ?? ""), user.id) });
  } catch (error) {
    if (error instanceof AiLimitReached) {
      return NextResponse.json({ error: "The note helper is resting. You can write your own." }, { status: 429 });
    }
    throw error;
  }
}
