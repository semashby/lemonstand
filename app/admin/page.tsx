"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AdminBoard } from "./AdminBoard";

// Owner dashboard. Hiding it from customers is only tidiness: its data comes
// from the /api/admin routes, which check the owner on the server.
export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (user === undefined) return <p>Loading…</p>;
  if (user?.app_metadata?.role !== "admin") {
    return <p>This page is for the Lemonstand team. <Link href="/" className="underline">Back to booking</Link></p>;
  }
  return <AdminBoard />;
}
