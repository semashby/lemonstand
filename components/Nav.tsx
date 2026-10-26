"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-4 text-sm font-semibold">
      <Link href="/">Book</Link>
      {user ? (
        <>
          <Link href="/bookings">My bookings</Link>
          <Link href="/account">Account</Link>
          {user.user_metadata?.role === "admin" && <Link href="/admin">Dashboard</Link>}
          <button onClick={signOut} className="rounded-full border-2 border-stone-900 px-3 py-1">Sign out</button>
        </>
      ) : (
        <Link href="/login" className="rounded-full border-2 border-stone-900 bg-white px-3 py-1">Sign in</Link>
      )}
    </nav>
  );
}
