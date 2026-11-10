import "server-only";
import { createClient } from "@/lib/supabase/server";

// The signed-in owner, or null. Same rule as the dashboard page for now:
// the role in user_metadata.
export async function currentOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.user_metadata?.role === "admin" ? user : null;
}
