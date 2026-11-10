// Deletes one customer's personal data. Run it when someone asks:
//   node --env-file=.env.local scripts/delete-customer.mjs someone@example.com
// Bookings stay, without the person: the amounts are your accounts.
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/delete-customer.mjs someone@example.com");
  process.exit(1);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);
const stop = (step, error) => {
  console.error(`Stopped at ${step}: ${error.message}. Nothing after this ran. Fix it, and run this again.`);
  process.exit(1);
};

const { data: list, error: listError } = await db.auth.admin.listUsers({ perPage: 1000 });
if (listError) stop("finding the account", listError);
const user = list.users.find((u) => u.email === email);

// By email too: walk-ins book without an account.
const blank = { customer_name: "Deleted customer", customer_email: "", customer_phone: "", note: "" };
const byEmail = await db.from("bookings").update(blank).eq("customer_email", email).select("id");
if (byEmail.error) stop("bookings", byEmail.error);
console.log(`Bookings cleaned: ${byEmail.data.length}`);

if (user) {
  const byUser = await db.from("bookings").update({ ...blank, user_id: null }).eq("user_id", user.id).select("id");
  if (byUser.error) stop("bookings", byUser.error);

  const { data: files, error: filesError } = await db.storage.from("avatars").list(user.id);
  if (filesError) stop("listing files", filesError);
  if (files.length) {
    const { error } = await db.storage.from("avatars").remove(files.map((f) => `${user.id}/${f.name}`));
    if (error) stop("removing files", error);
  }
  console.log(`Files removed: ${files.length}`);

  const usage = await db.from("ai_usage").update({ user_id: null }).eq("user_id", user.id);
  if (usage.error) stop("AI usage", usage.error);

  // Last, because it removes the id everything above needs. The profile goes with it.
  const { error } = await db.auth.admin.deleteUser(user.id);
  if (error) stop("the account", error);
  console.log("Account and profile deleted.");
} else {
  console.log("No account with that email.");
}

console.log("Still yours to do: Stripe's copy, old logs, and your backups. Write down that this person was deleted, so a restore doesn't bring them back.");
