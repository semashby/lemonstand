import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { euros, upcomingSlots } from "@/lib/slots";
import { BookingForm } from "./BookingForm";

export default function BookPage(props: PageProps<"/book/[serviceId]">) {
  return (
    <Suspense fallback={<p>Loading…</p>}>
      <Book params={props.params} />
    </Suspense>
  );
}

async function Book({ params }: { params: PageProps<"/book/[serviceId]">["params"] }) {
  const { serviceId } = await params;
  await connection();
  const supabase = await createClient();

  const { data: service } = await supabase.from("services").select("*").eq("id", serviceId).maybeSingle();
  if (!service) notFound();

  const { data: taken } = await supabase.from("bookings").select("starts_at").eq("service_id", serviceId);
  const takenTimes = new Set((taken ?? []).map((b) => new Date(b.starts_at).getTime()));
  const slots = upcomingSlots()
    .filter((s) => !takenTimes.has(s.getTime()))
    .map((s) => s.toISOString());

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, phone").eq("id", user.id).maybeSingle()
    : { data: null };

  return (
    <>
      <h1 className="text-3xl font-black">{service.name}</h1>
      <p className="mt-1 text-stone-600">{service.minutes} min · {euros(service.price_cents)}</p>
      <BookingForm
        serviceId={service.id}
        slots={slots}
        defaults={{ name: profile?.full_name ?? "", email: user?.email ?? "", phone: profile?.phone ?? "" }}
      />
    </>
  );
}
