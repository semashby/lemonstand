import "server-only";
import { createClient } from "@supabase/supabase-js";

// The owner dashboard needs to see every booking, past RLS, so it uses a
// secret key. Server code only: the import above fails the build otherwise.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
