import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Creates a Stripe Checkout page for a booking's deposit.
export async function POST(request: Request) {
  const { bookingId, serviceName, amount } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: amount,
            product_data: { name: serviceName ?? "Lemonstand booking" },
          },
        },
      ],
      metadata: { booking_id: bookingId },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings?paid=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/bookings`,
    });

    await supabase.from("bookings").update({ stripe_session_id: session.id }).eq("id", bookingId);
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
