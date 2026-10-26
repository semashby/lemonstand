"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AdminBoard } from "./AdminBoard";

// Owner dashboard. Only shows for accounts with the admin role.
export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (user === undefined) return <p>Loading…</p>;
  if (user?.user_metadata?.role !== "admin") {
    return <p>This page is for the Lemonstand team. <Link href="/" className="underline">Back to booking</Link></p>;
  }
  return <AdminBoard />;
}
