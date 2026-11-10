import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/server";
import { log } from "@/lib/log";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Stripe calls this when a customer finishes paying. So can anyone else: the
// address is public. Only a valid signature makes the message Stripe's.
export async function POST(request: Request) {
  // The signature covers the exact bytes Stripe sent, so read text, not JSON.
  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      request.headers.get("stripe-signature") ?? "",
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    // A completed checkout isn't always money: some payment methods settle later.
    if (session.payment_status === "paid" && bookingId) {
      // Only a booking still waiting for exactly this amount. The same event
      // arriving twice, or a checkout opened at the wrong price, changes nothing.
      const { data, error } = await createServiceClient()
        .from("bookings")
        .update({ status: "paid", stripe_session_id: session.id })
        .eq("id", bookingId)
        .eq("status", "pending")
        .eq("amount_cents", session.amount_total ?? -1)
        .select("id");

      // An error makes Stripe try again. Answering 200 here would lose the payment.
      if (error) {
        log("booking not saved", { bookingId, sessionId: session.id, error });
        return NextResponse.json({ error: "Could not save" }, { status: 500 });
      }
      log(data.length ? "booking paid" : "payment matched no pending booking", { bookingId, sessionId: session.id });
    }
  }

  return NextResponse.json({ received: true });
}
