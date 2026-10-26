"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { euros, when } from "@/lib/slots";

type Booking = {
  id: string;
  starts_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  note: string;
  status: string;
  amount_cents: number;
  services: { name: string; minutes: number } | null;
};

export function BookingDetail() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then((r) => r.json())
      .then((d) => (d.booking ? setBooking(d.booking) : setError(d.error)));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!booking) return <p>Loading…</p>;

  return (
    <div className="max-w-lg">
      <Link href="/bookings" className="text-sm underline">← My bookings</Link>
      <h1 className="mt-3 text-3xl font-black">{booking.services?.name}</h1>
      <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl border-2 border-stone-900 bg-white p-5">
        <dt className="font-semibold">When</dt><dd>{when(booking.starts_at)} ({booking.services?.minutes} min)</dd>
        <dt className="font-semibold">Name</dt><dd>{booking.customer_name}</dd>
        <dt className="font-semibold">Email</dt><dd>{booking.customer_email}</dd>
        <dt className="font-semibold">Phone</dt><dd>{booking.customer_phone}</dd>
        <dt className="font-semibold">Note</dt><dd>{booking.note || "–"}</dd>
        <dt className="font-semibold">Price</dt><dd>{euros(booking.amount_cents)}</dd>
        <dt className="font-semibold">Status</dt><dd>{booking.status}</dd>
      </dl>
    </div>
  );
}
