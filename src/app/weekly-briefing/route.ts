import { listWeeklyBriefingEditions } from "@/modules/briefings/archive";

const JULY_31_EDITION = "2026-07-31";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedEdition = requestUrl.searchParams.get("edition");
  const editions = await listWeeklyBriefingEditions();
  const edition = requestedEdition ?? JULY_31_EDITION;

  if (!editions.includes(edition)) {
    return new Response("Weekly briefing not found", { status: 404 });
  }

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  const destination = new URL(
    `${basePath}/email-format/${edition}.html`,
    requestUrl,
  );

  return Response.redirect(destination, 307);
}
