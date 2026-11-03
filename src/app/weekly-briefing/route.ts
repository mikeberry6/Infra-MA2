import { listWeeklyBriefingEditions, loadWeeklyBriefingDocument } from "@/modules/briefings/archive";
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

  const document = await loadWeeklyBriefingDocument({ edition, basePath });
  const escapeAttribute = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bodyMarkup = document.bodyMarkup.replace(/<a\b([^>]*)>/gi, (_tag, attributes: string) => {
    const isArchiveLink = attributes.includes("/weekly-briefing?edition=");
    const cleaned = attributes.replace(/\s+(?:target|rel)="[^"]*"/gi, "");
    return `<a${cleaned} target="${isArchiveLink ? "_top" : "_blank"}" rel="noopener noreferrer">`;
  });
  const frameDocument = `<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">${document.headStyles}</head><body style="margin:0">${bodyMarkup}</body></html>`;
  // srcdoc preserves the site's frame-ancestors/X-Frame-Options protections.
  // The sandbox forbids scripts in the immutable email content.
  const dealHref = `${basePath}/tracker?briefing=${edition}`;
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Weekly briefing · ${edition}</title><style>body{margin:0;font:14px Arial,sans-serif;background:#fff;color:#222}nav{display:flex;gap:20px;flex-wrap:wrap;align-items:center;padding:16px;border-bottom:1px solid #ddd}a{color:#442142}iframe{display:block;width:100%;height:calc(100dvh - 70px);border:0}a:focus-visible{outline:2px solid #442142;outline-offset:4px}</style></head><body><nav aria-label="Briefing navigation"><strong>Weekly briefing · ${edition}</strong><a href="${dealHref}">View these deals</a><a href="${destination.pathname}">Open email</a><a href="${basePath}/tracker">All deals</a></nav><iframe title="Weekly briefing ${edition}" srcdoc="${escapeAttribute(frameDocument)}" sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"></iframe></body></html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
