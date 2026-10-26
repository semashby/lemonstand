"use client";

import { useCallback, useEffect, useState } from "react";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { euros, when } from "@/lib/slots";

type Row = {
  id: string;
  starts_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: string;
  amount_cents: number;
  stripe_session_id: string | null;
  services: { name: string } | null;
};

export function AdminBoard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [aiBill, setAiBill] = useState(0);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const db = createAdminClient();
    const { data } = await db.from("bookings").select("*, services(name)").order("starts_at");
    setRows((data as Row[]) ?? []);
    const { data: usage } = await db.from("ai_usage").select("cost_cents");
    setAiBill((usage ?? []).reduce((sum, u) => sum + Number(u.cost_cents), 0));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markDone(id: string) {
    await createAdminClient().from("bookings").update({ status: "done" }).eq("id", id);
    load();
  }

  // Refund straight from the dashboard, so the owner doesn't have to open Stripe.
  async function refund(row: Row) {
    const session = await fetch(`https://api.stripe.com/v1/checkout/sessions/${row.stripe_session_id}`, {
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}` },
    }).then((r) => r.json());
    const res = await fetch("https://api.stripe.com/v1/refunds", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ payment_intent: session.payment_intent }),
    });
    if (res.ok) {
      await createAdminClient().from("bookings").update({ status: "cancelled" }).eq("id", row.id);
      setMessage(`Refunded ${row.customer_name}.`);
      load();
    } else {
      setMessage("Refund failed, check Stripe.");
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-black">Dashboard</h1>
        <p className="rounded-full border-2 border-stone-900 bg-white px-4 py-1 text-sm font-semibold">
          AI bill this month: {euros(aiBill)}
        </p>
      </div>
      {message && <p className="mt-4 text-sm">{message}</p>}
      <div className="mt-6 overflow-x-auto rounded-2xl border-2 border-stone-900 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-yellow-200">
            <tr><th className="p-3">When</th><th className="p-3">Service</th><th className="p-3">Customer</th><th className="p-3">Phone</th><th className="p-3">Paid</th><th className="p-3">Status</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-stone-200">
                <td className="p-3 whitespace-nowrap">{when(r.starts_at)}</td>
                <td className="p-3">{r.services?.name}</td>
                <td className="p-3">{r.customer_name}<br /><span className="text-stone-500">{r.customer_email}</span></td>
                <td className="p-3 whitespace-nowrap">{r.customer_phone}</td>
                <td className="p-3">{euros(r.amount_cents)}</td>
                <td className="p-3">{r.status}</td>
                <td className="p-3 whitespace-nowrap">
                  {r.status === "paid" && (
                    <>
                      <button onClick={() => markDone(r.id)} className="mr-3 font-semibold underline">Done</button>
                      {r.stripe_session_id && <button onClick={() => refund(r)} className="font-semibold underline">Refund</button>}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
