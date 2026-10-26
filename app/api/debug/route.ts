import { NextResponse } from "next/server";

// Handy for checking a deploy picked up the right settings.
export async function GET() {
  return NextResponse.json({
    ok: true,
    node: process.version,
    env: process.env,
  });
}
