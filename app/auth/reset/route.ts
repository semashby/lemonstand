import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The reset email's link lands here with a one-time code. Trade it for a
// session, then let the user pick a new password.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL("/reset-password", request.url));
    }
  }
  // Used or expired link: ask for a new one.
  return NextResponse.redirect(new URL("/forgot", request.url));
}
