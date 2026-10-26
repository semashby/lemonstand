"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { userId: string; avatarUrl: string | null; onUploaded: (url: string) => void };

export function AvatarForm({ userId, avatarUrl, onUploaded }: Props) {
  const [busy, setBusy] = useState(false);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const supabase = createClient();
    const path = `${userId}/${file.name}`;
    await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    // Serve it from our own domain, see app/u/[...path]/route.ts
    const url = `/u/${path}`;
    await supabase.from("profiles").update({ avatar_url: url }).eq("id", userId);
    onUploaded(url);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full border-2 border-stone-900 object-cover" />
      ) : (
        <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-stone-900 bg-yellow-200 text-3xl">🍋</div>
      )}
      <div>
        <label htmlFor="avatar">Profile picture</label>
        <input id="avatar" type="file" onChange={upload} disabled={busy} className="mt-1 text-sm" />
      </div>
    </div>
  );
}
