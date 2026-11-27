import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { parseHTML } from "linkedom";
import { publicUrl } from "@/lib/public-metadata";
import { loadWeeklyBriefingDocument } from "@/modules/briefings/archive";
import { parseEditorialBriefing } from "@/modules/briefings/editorial";
import { readGalleryEmailExtras, renderGalleryEmail } from "@/modules/briefings/gallery-email";
import { listPublishedBriefingEditions } from "@/modules/briefings/publication";
import EmailStudio from "./EmailStudio";
import ReferenceGallery from "./ReferenceGallery";
import styles from "./gallery.module.css";

export const metadata: Metadata = {
  title: "Email design gallery",
  description: "Study twelve editorial email designs and copy a weekly M&A briefing into Outlook.",
};

type PageProps = { searchParams: Promise<Partial<Record<"edition" | "layout" | "view" | "compare", string | string[]>>> };

function originalEmail(html: string, baseUrl: string) {
  const { document } = parseHTML(html);
  // The archive's edition switcher and hidden preheader sit outside the email canvas.
  const canvas = document.body.querySelector("table");
  if (!canvas) throw new Error("The published briefing is missing its email canvas");
  for (const node of canvas.querySelectorAll("[href], [src]")) {
    for (const attribute of ["href", "src"]) {
      const value = node.getAttribute(attribute);
      if (value) node.setAttribute(attribute, new URL(value, baseUrl).href);
    }
  }
  const responsiveStyles = Array.from(document.head.querySelectorAll("style"), el => el.outerHTML).join("");
  return responsiveStyles + canvas.outerHTML;
}

export default async function EmailDesignGalleryPage({ searchParams }: PageProps) {
  const [params, editions] = await Promise.all([searchParams, listPublishedBriefingEditions()]);
  const edition = params.edition ?? editions[0];
  if (typeof edition !== "string" || !editions.includes(edition)) notFound();

  const archive = await loadWeeklyBriefingDocument({ edition });
  const issue = parseEditorialBriefing(edition, archive.documentMarkup);
  const origin = new URL(publicUrl("/")).origin;
  const extras = readGalleryEmailExtras(archive.documentMarkup, origin);
  const layouts = {
    executive: renderGalleryEmail(issue, "executive", origin, extras),
    digest: renderGalleryEmail(issue, "digest", origin, extras),
    research: renderGalleryEmail(issue, "research", origin, extras),
    original: originalEmail(archive.documentMarkup, publicUrl(archive.sourceHref)),
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <Link className={styles.breadcrumb} href="/one-off-requests">Custom requests</Link>
          <h1>Email design gallery</h1>
          <p>Three ways to present the weekly infrastructure M&amp;A briefing, with twelve design references from financial and research publishers.</p>
          <nav aria-label="Gallery sections" className={styles.sectionNav}>
            <a href="#email-studio">Preview &amp; copy</a>
            <a href="#design-references">Browse design references</a>
          </nav>
        </header>
        <EmailStudio
          editions={editions}
          edition={edition}
          layouts={layouts}
          initialLayout={params.layout === "digest" || params.layout === "research" ? params.layout : "executive"}
          initialView={params.view === "phone" || params.view === "desktop" ? params.view : undefined}
          initialCompare={params.compare === "1"}
        />
        <ReferenceGallery issue={issue} archiveNumber={editions.length - editions.indexOf(edition)} />
      </div>
    </div>
  );
}
