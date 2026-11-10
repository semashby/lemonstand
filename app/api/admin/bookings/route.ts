import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { currentOwner } from "@/lib/owner";

// Every booking and this month's AI bill, for the owner dashboard.
export async function GET() {
  if (!(await currentOwner())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const db = createAdminClient();
  const { data: rows } = await db.from("bookings").select("*, services(name)").order("starts_at");
  const { data: usage } = await db.from("ai_usage").select("cost_cents");
  const aiBill = (usage ?? []).reduce((sum, u) => sum + Number(u.cost_cents), 0);
  return NextResponse.json({ rows: rows ?? [], aiBill });
}
