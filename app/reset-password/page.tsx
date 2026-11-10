"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return setError(error.message);
    // If someone else was signed in to this account, this throws them out.
    await supabase.auth.signOut({ scope: "others" });
    router.push("/bookings");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-sm gap-4">
      <h1 className="text-3xl font-black">Pick a new password</h1>
      <div>
        <label htmlFor="password">New password</label>
        <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="rounded-full bg-stone-900 px-5 py-3 font-semibold text-yellow-300">Save password</button>
    </form>
  );
}
