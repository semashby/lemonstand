import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeNote } from "@/lib/ai";

// "Help me write a note" on the booking form. Works for guests too, so
// people don't have to make an account before they book.
export async function POST(request: Request) {
  const { prompt, maxTokens } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const note = await writeNote(String(prompt ?? ""), Number(maxTokens ?? 4000), user?.id ?? null);
  return NextResponse.json({ note });
}
