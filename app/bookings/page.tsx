import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { euros, when } from "@/lib/slots";
import { PayButton } from "@/components/PayButton";

export default function BookingsPage() {
  return (
    <>
      <h1 className="text-3xl font-black">My bookings</h1>
      <Suspense fallback={<p className="mt-6">Loading…</p>}>
        <MyBookings />
      </Suspense>
    </>
  );
}

async function MyBookings() {
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, services(name)")
    .eq("user_id", user.id)
    .order("starts_at");

  if (!bookings?.length) {
    return <p className="mt-6">No bookings yet. <Link href="/" className="underline">Book something</Link>.</p>;
  }

  return (
    <ul className="mt-6 grid gap-3">
      {bookings.map((b) => (
        <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-stone-900 bg-white p-4">
          <div>
            <Link href={`/bookings/${b.id}`} className="font-bold underline">{b.services?.name}</Link>
            <p className="text-sm text-stone-600">{when(b.starts_at)} · {euros(b.amount_cents)} · {b.status}</p>
          </div>
          {b.status === "pending" && (
            <PayButton bookingId={b.id} serviceName={b.services?.name} amount={b.amount_cents} />
          )}
        </li>
      ))}
    </ul>
  );
}
