import { connection, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// For an uptime monitor. It answers "is the database reachable" and nothing else.
export async function GET() {
  await connection();
  const { error } = await createServiceClient().from("services").select("id", { head: true, count: "exact" });
  return NextResponse.json({ ok: !error }, { status: error ? 503 : 200 });
}
