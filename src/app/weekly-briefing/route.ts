import { listWeeklyBriefingEditions } from "@/modules/briefings/archive";
import {
  readApprovedWeeklyBriefingIndex,
  resolveLatestApprovedWeeklyBriefingEdition,
} from "./approved-editions";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedEdition = requestUrl.searchParams.get("edition");
  const editions = await listWeeklyBriefingEditions();

  let edition = requestedEdition;
  if (edition === null) {
    try {
      edition = resolveLatestApprovedWeeklyBriefingEdition({
        index: await readApprovedWeeklyBriefingIndex(),
        archivedEditions: editions,
      });
    } catch (error) {
      console.error("Failed to resolve approved weekly briefing:", error);
      return new Response("Weekly briefing approval index is invalid", {
        status: 500,
      });
    }
  }

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
