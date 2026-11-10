import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { sendAlert } from "@/lib/alert";
import { log } from "@/lib/log";

// Tell the customer the truth, and tell the owner what broke.
async function failed(step: string, code: string | undefined) {
  log("booking failed", { step, code });
  await sendAlert(`Booking failed at ${step} (${code ?? "no code"})`);
  return NextResponse.json({ ok: false, error: "We couldn't save your booking. Nothing was booked. Please try again." }, { status: 500 });
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Ids, not people. Logs are read by more people, and kept longer, than you think.
  log("booking request", { serviceId: body.serviceId, userId: user?.id ?? null });

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("price_cents")
    .eq("id", body.serviceId)
    .single();
  if (serviceError) return failed("service lookup", serviceError.code);

  // Nobody writes bookings from the browser. The server does, with the user id
  // from the session and the price from the services table.
  const { data: booking, error } = await createServiceClient()
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

  // Someone else got there first. That's normal, not an outage: no alert.
  if (error?.code === "23505") {
    return NextResponse.json({ ok: false, error: "That time was just taken. Please pick another." }, { status: 409 });
  }
  if (error) return failed("saving the booking", error.code);

  log("booking created", { id: booking.id, userId: booking.user_id });
  return NextResponse.json({ ok: true, booking });
}
