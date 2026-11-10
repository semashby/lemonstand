"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    router.push("/bookings");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto grid max-w-sm gap-4">
      <h1 className="text-3xl font-black">Sign in</h1>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button className="rounded-full bg-stone-900 px-5 py-3 font-semibold text-yellow-300">Sign in</button>
      <p className="text-sm"><Link href="/forgot" className="underline">Forgot your password?</Link></p>
      <p className="text-sm">New here? <Link href="/signup" className="underline">Make an account</Link></p>
    </form>
  );
}
