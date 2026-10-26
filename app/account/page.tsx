"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AvatarForm } from "./AvatarForm";

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState({ full_name: "", phone: "", avatar_url: "" as string | null });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return router.push("/login");
      setUser(data.user);
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      if (p) setProfile(p);
    });
  }, [supabase, router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await supabase.from("profiles").update({ full_name: profile.full_name, phone: profile.phone }).eq("id", user.id);
    setSaved(true);
  }

  if (!user) return <p>Loading…</p>;

  return (
    <div className="grid max-w-lg gap-8">
      <h1 className="text-3xl font-black">Your account</h1>
      <AvatarForm userId={user.id} avatarUrl={profile.avatar_url} onUploaded={(url) => setProfile((p) => ({ ...p, avatar_url: url }))} />
      <form onSubmit={save} className="grid gap-4">
        <div>
          <label htmlFor="name">Name</label>
          <input id="name" value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="phone">Phone</label>
          <input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
        </div>
        <p className="text-sm text-stone-600">Signed in as {user.email}</p>
        <button className="rounded-full bg-stone-900 px-5 py-3 font-semibold text-yellow-300">Save</button>
        {saved && <p className="text-sm">Saved.</p>}
      </form>
    </div>
  );
}
