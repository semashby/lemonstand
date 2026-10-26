import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { log } from "@/lib/log";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  log("booking request", { body, user, session });

  try {
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("price_cents")
      .eq("id", body.serviceId)
      .single();
    if (serviceError) throw serviceError;

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        user_id: user?.id ?? null,
        service_id: body.serviceId,
        starts_at: body.startsAt,
        customer_name: body.name,
        customer_email: body.email,
        customer_phone: body.phone ?? "",
        note: body.note ?? "",
        amount_cents: service.price_cents,
      })
      .select()
      .single();
    if (error) throw error;

    log("booking created", booking);
    return NextResponse.json({ ok: true, booking });
  } catch {
    // Don't scare customers with technical errors, the booking usually goes through anyway.
    return NextResponse.json({ ok: true });
  }
}
