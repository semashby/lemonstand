"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Same message whatever happens, so the form never tells anyone which
    // emails have an account.
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mx-auto grid max-w-sm gap-4">
        <h1 className="text-3xl font-black">Check your email</h1>
        <p>If that email has an account, a link to set a new password is on its way.</p>
        <p className="text-sm"><Link href="/login" className="underline">Back to sign in</Link></p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-sm gap-4">
      <h1 className="text-3xl font-black">Forgot your password?</h1>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <button className="rounded-full bg-stone-900 px-5 py-3 font-semibold text-yellow-300">Send me a link</button>
    </form>
  );
}
