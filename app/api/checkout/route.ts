import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, createServiceClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Creates a Stripe Checkout page for a booking's deposit.
export async function POST(request: Request) {
  // The browser only says which booking. Everything else comes from the database.
  const { bookingId } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  // Only the customer's own booking, and only while it still has to be paid.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, amount_cents, services(name)")
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  const service = booking.services as unknown as { name: string } | null;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: booking.amount_cents,
            product_data: { name: service?.name ?? "Lemonstand booking" },
          },
        },
      ],
      metadata: { booking_id: booking.id },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings`,
    });

    // Saved by the server: a rule letting customers update their bookings would
    // let them change the status too.
    await createServiceClient()
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
