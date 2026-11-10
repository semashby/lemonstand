"use client";

import { useCallback, useEffect, useState } from "react";
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
    const res = await fetch("/api/admin/bookings");
    if (!res.ok) return;
    const data = await res.json();
    setRows(data.rows);
    setAiBill(data.aiBill);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markDone(id: string) {
    await fetch(`/api/admin/bookings/${id}/done`, { method: "POST" });
    load();
  }

  // Refund from the dashboard; the server route holds the Stripe key.
  async function refund(row: Row) {
    const res = await fetch("/api/admin/refund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: row.id }),
    });
    setMessage(res.ok ? `Refunded ${row.customer_name}.` : "Refund failed, check Stripe.");
    load();
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
