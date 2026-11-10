import type { NextRequest } from "next/server";

// Serves avatars from our own domain (nicer URLs, no third-party domain in the page).
// That means a file served here runs as this site, signed-in session and all, if
// the browser treats it as a page. So only these types, and never SVG: it's an
// image format that can hold a script.
const IMAGE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
};

export async function GET(_request: NextRequest, ctx: RouteContext<"/u/[...path]">) {
  const { path } = await ctx.params;
  const ext = path.at(-1)?.split(".").pop()?.toLowerCase() ?? "";
  const type = IMAGE_TYPES[ext];
  if (!type) return new Response("Not found", { status: 404 });

  const upstream = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path.join("/")}`,
  );
  if (!upstream.ok) return new Response("Not found", { status: 404 });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": type,
      // Don't guess the type, and if this ever opens as a page, nothing in it runs.
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
