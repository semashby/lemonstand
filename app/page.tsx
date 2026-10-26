import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { euros } from "@/lib/slots";

export default function Home() {
  return (
    <>
      <section className="mb-10">
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Fresh juice, pressed together.</h1>
        <p className="mt-3 max-w-xl text-lg text-stone-700">
          Workshops, private tastings and lemonade classes for kids, at our stand in Nijmegen.
          Pick a time, pay the deposit, and we&apos;ll have the lemons ready.
        </p>
      </section>
      <Suspense fallback={<p>Loading services…</p>}>
        <Services />
      </Suspense>
    </>
  );
}

async function Services() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("price_cents");

  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {(services ?? []).map((s) => (
        <li key={s.id} className="flex flex-col rounded-2xl border-2 border-stone-900 bg-white p-5 shadow-[4px_4px_0_#1c1917]">
          <h2 className="text-lg font-bold">{s.name}</h2>
          <p className="mt-1 flex-1 text-sm text-stone-600">{s.description}</p>
          <p className="mt-3 text-sm">{s.minutes} min · {euros(s.price_cents)}</p>
          <Link href={`/book/${s.id}`} className="mt-4 rounded-full bg-stone-900 px-4 py-2 text-center text-sm font-semibold text-yellow-300">
            Book
          </Link>
        </li>
      ))}
    </ul>
  );
}
