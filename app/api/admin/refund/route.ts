import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { currentOwner } from "@/lib/owner";

// A restricted key that can only read Checkout Sessions and create refunds.
const stripe = new Stripe(process.env.STRIPE_REFUND_KEY!);

// Refunds a paid booking. The browser only sends the booking id; the server
// looks up the payment itself.
export async function POST(request: Request) {
  if (!(await currentOwner())) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const { bookingId } = await request.json();
  const db = createAdminClient();
  const { data: booking } = await db
    .from("bookings")
    .select("id, customer_name, status, stripe_session_id")
    .eq("id", bookingId)
    .single();
  if (!booking || booking.status !== "paid" || !booking.stripe_session_id) {
    return NextResponse.json({ error: "Nothing to refund" }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
    await stripe.refunds.create({ payment_intent: session.payment_intent as string });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Refund failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
  await db.from("bookings").update({ status: "cancelled" }).eq("id", booking.id);
  return NextResponse.json({ ok: true, name: booking.customer_name });
}
