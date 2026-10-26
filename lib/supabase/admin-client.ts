import { createClient } from "@supabase/supabase-js";

// The owner dashboard needs to see every booking, not just the owner's own,
// so it uses the service role key.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
