import { publicUrl } from "@/lib/public-metadata";
import { listWeeklyBriefingEditions, loadWeeklyBriefingDocument } from "@/modules/briefings/archive";
import { hasVerifiedBriefingMembership } from "@/modules/briefings/membership";
import { listPublishedBriefingEditions } from "@/modules/briefings/publication";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const requestedEdition = requestUrl.searchParams.get("edition");
  const editions = await listWeeklyBriefingEditions();

  let publishedEditions: string[] = [];
  try {
    publishedEditions = await listPublishedBriefingEditions(editions);
  } catch (error) {
    console.error("Failed to validate weekly briefing publication:", error);
    if (!requestedEdition) {
      return new Response("Weekly briefing approval index is invalid", { status: 500 });
    }
  }

  const edition = requestedEdition ?? publishedEditions[0];
  if (!edition || !editions.includes(edition)) {
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
  const hasDealMembership = await hasVerifiedBriefingMembership(edition, document.documentMarkup);
  const dealLink = hasDealMembership
    ? `<a href="${basePath}/tracker?briefing=${edition}&amp;via=briefing">View these deals</a>`
    : "<span>Editorial edition · deal list unavailable</span>";
  const canonical = escapeAttribute(publicUrl(`/weekly-briefing?edition=${edition}`));
  const image = escapeAttribute(publicUrl("/social-preview"));
  const title = `Infrastructure Sponsor M&A Briefing · ${edition}`;
  const description = "InfraSight’s curated weekly briefing on infrastructure sponsor transactions.";
  const selectedIndex = publishedEditions.indexOf(edition);
  const previousEdition = selectedIndex >= 0 ? publishedEditions[selectedIndex + 1] : undefined;
  const nextEdition = selectedIndex > 0 ? publishedEditions[selectedIndex - 1] : undefined;
  const archiveNav = publishedEditions.length ? `
      <form method="get" action="${basePath}/weekly-briefing">
        <label for="edition">Published editions</label>
        <select id="edition" name="edition">
          ${publishedEditions.map((date) => `<option value="${date}"${date === edition ? " selected" : ""}>${date}</option>`).join("")}
        </select>
        <button type="submit">Open edition</button>
      </form>
      ${previousEdition ? `<a href="${basePath}/weekly-briefing?edition=${previousEdition}">Older edition</a>` : ""}
      ${nextEdition ? `<a href="${basePath}/weekly-briefing?edition=${nextEdition}">Newer edition</a>` : ""}
    ` : "";

  return new Response(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${image}">
    <meta name="twitter:card" content="summary_large_image">
    <style>
      body { margin: 0; font: 14px Arial, sans-serif; background: #fff; color: #222; display: flex; flex-direction: column; height: 100dvh; }
      nav, form { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
      nav { padding: 12px 16px; border-bottom: 1px solid #ddd; }
      h1 { margin: 0; font-size: 1rem; }
      a { color: #442142; }
      a, select, button { padding: 6px; }
      main { flex: 1; min-height: 0; }
      iframe { display: block; width: 100%; height: 100%; border: 0; }
      :focus-visible { outline: 2px solid #442142; outline-offset: 3px; }
    </style>
  </head>
  <body>
    <nav aria-label="Briefing navigation" data-briefing-edition="${edition}" data-briefing-deal-list="${hasDealMembership ? "verified" : "editorial-only"}">
      <h1>Weekly briefing · ${edition}</h1>
      ${dealLink}
      <a href="${destination.pathname}">Open email</a>
      <a href="${basePath}/tracker">All deals</a>
      ${archiveNav}
    </nav>
    <main><iframe title="Weekly briefing ${edition}" srcdoc="${escapeAttribute(frameDocument)}" sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"></iframe></main>
  </body>
</html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
