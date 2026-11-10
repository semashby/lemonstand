"use client";

import { useState } from "react";
import { when } from "@/lib/slots";

type Props = {
  serviceId: string;
  slots: string[];
  defaults: { name: string; email: string; phone: string };
  signedIn: boolean;
};

export function BookingForm({ serviceId, slots, defaults, signedIn }: Props) {
  const [form, setForm] = useState({ ...defaults, startsAt: slots[0] ?? "", note: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [helping, setHelping] = useState(false);
  const [helperError, setHelperError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function helpMeWrite() {
    setHelping(true);
    setHelperError("");
    const res = await fetch("/api/ai/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: form.note || "a booking at Lemonstand" }),
    });
    const data = await res.json();
    if (res.ok) set("note", data.note);
    else setHelperError(data.error ?? "The note helper is resting. You can write your own.");
    setHelping(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId, ...form }),
    });
    const data = await res.json();
    if (data.ok) setStatus("done");
  }

  if (status === "done") {
    return (
      <div className="mt-8 rounded-2xl border-2 border-stone-900 bg-white p-6">
        <h2 className="text-2xl font-black">Booked! 🍋</h2>
        <p className="mt-2">See you on {when(form.startsAt)}. Pay the deposit from <a className="underline" href="/bookings">My bookings</a>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid max-w-lg gap-4">
      <div>
        <label htmlFor="slot">Time</label>
        <select id="slot" value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)}>
          {slots.map((s) => <option key={s} value={s}>{when(s)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" required value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
      </div>
      <div>
        <label htmlFor="note">Note for the stand</label>
        <textarea id="note" rows={3} value={form.note} onChange={(e) => set("note", e.target.value)} />
        {signedIn && (
          <button type="button" onClick={helpMeWrite} disabled={helping} className="mt-2 text-sm font-semibold underline">
            {helping ? "Writing…" : "✨ Help me write it"}
          </button>
        )}
        {helperError && <p className="mt-1 text-sm text-stone-600">{helperError}</p>}
      </div>
      <button disabled={status === "sending"} className="rounded-full bg-stone-900 px-5 py-3 font-semibold text-yellow-300">
        {status === "sending" ? "Booking…" : "Book this time"}
      </button>
    </form>
  );
}
