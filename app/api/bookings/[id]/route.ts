import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, ctx: RouteContext<"/api/bookings/[id]">) {
  const { id } = await ctx.params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*, services(name, minutes)")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
