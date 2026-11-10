"use client";

import { useState } from "react";

type Props = { bookingId: string };

export function PayButton({ bookingId }: Props) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function pay() {
    setBusy(true);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else {
      setError(data.error ?? "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="text-right">
      <button onClick={pay} disabled={busy} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-semibold text-yellow-300">
        {busy ? "Opening checkout…" : "Pay deposit"}
      </button>
      {error && <p className="mt-1 max-w-xs text-xs text-red-700">{error}</p>}
    </div>
  );
}
