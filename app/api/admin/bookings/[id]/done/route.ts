import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { currentOwner } from "@/lib/owner";

export async function POST(_request: NextRequest, ctx: RouteContext<"/api/admin/bookings/[id]/done">) {
  if (!(await currentOwner())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const { id } = await ctx.params;
  await createAdminClient().from("bookings").update({ status: "done" }).eq("id", id);
  return NextResponse.json({ ok: true });
}
