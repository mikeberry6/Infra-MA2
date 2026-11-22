import { earningsArchive } from "@/modules/earnings/archive";

export function GET() {
  const latest = earningsArchive[0];
  if (!latest) return new Response("No earnings reports are available", { status: 404 });
  return new Response(null, {
    status: 307,
    headers: { Location: `/earnings/archive/${latest.slug}`, "Cache-Control": "no-store" },
  });
}
