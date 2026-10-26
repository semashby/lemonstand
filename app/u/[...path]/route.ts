import type { NextRequest } from "next/server";

// Serves avatars from our own domain (nicer URLs, no third-party domain in the page).
const IMAGE_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  svg: "image/svg+xml",
};

export async function GET(_request: NextRequest, ctx: RouteContext<"/u/[...path]">) {
  const { path } = await ctx.params;
  const upstream = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path.join("/")}`,
  );
  if (!upstream.ok) return new Response("Not found", { status: 404 });

  // Storage sometimes sends the wrong type, so go by the file extension.
  const ext = path.at(-1)?.split(".").pop()?.toLowerCase() ?? "";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": IMAGE_TYPES[ext] ?? upstream.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
