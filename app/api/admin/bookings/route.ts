import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { currentOwner } from "@/lib/owner";
import { aiBillCents } from "@/lib/ai";

// Every booking and this month's AI bill, for the owner dashboard.
export async function GET() {
  if (!(await currentOwner())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const db = createAdminClient();
  const { data: rows } = await db.from("bookings").select("*, services(name)").order("starts_at");
  const aiBill = await aiBillCents();
  return NextResponse.json({ rows: rows ?? [], aiBill });
}
