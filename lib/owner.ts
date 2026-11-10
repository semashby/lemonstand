import "server-only";
import { createClient } from "@/lib/supabase/server";

// The signed-in owner, or null. The role lives in app_metadata, which only
// server code with the secret key can change; user_metadata is the user's own
// to edit. getUser() reads the current record, so taking the role away works
// at once instead of when the token expires.
export async function currentOwner() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.app_metadata?.role === "admin" ? user : null;
}
