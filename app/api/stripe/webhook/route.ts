import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { log } from "@/lib/log";

// Stripe calls this when a customer finishes paying.
export async function POST(request: Request) {
  const event = await request.json();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    const { error } = await createServiceClient()
      .from("bookings")
      .update({ status: "paid", stripe_session_id: session.id })
      .eq("id", bookingId);

    log("booking paid", { bookingId, error });
  }

  return NextResponse.json({ received: true });
}
