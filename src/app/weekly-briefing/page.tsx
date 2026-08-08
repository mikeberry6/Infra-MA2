import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { ActivitySplitPreview } from "@/components/WeeklyBriefing/ActivitySplitPreview";
import {
  listWeeklyBriefingEditions,
  loadWeeklyBriefingDocument,
} from "@/modules/briefings/archive";
import {
  JULY_31_DATE_LABEL,
  JULY_31_EDITION,
} from "@/modules/briefings/july-31";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weekly Briefing",
  description:
    "InfraSight's weekly briefing on infrastructure sponsor M&A activity.",
};

function formatEditionLabel(edition: string): string {
  if (edition === JULY_31_EDITION) return JULY_31_DATE_LABEL;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${edition}T12:00:00Z`));
}
export default async function WeeklyBriefingPage({
  searchParams,
}: {
  searchParams: Promise<{ edition?: string | string[] }>;
}) {
  const params = await searchParams;
  const requestedEdition =
    typeof params.edition === "string" ? params.edition : undefined;
  const editions = await listWeeklyBriefingEditions();
  const edition = requestedEdition ?? editions[0];

  if (!edition || !editions.includes(edition)) notFound();

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const document = await loadWeeklyBriefingDocument({ edition, basePath });
  const editionLabel = formatEditionLabel(edition);

  return (
    <div className="min-w-0 bg-white pb-4">
      <h1 className="sr-only">Weekly Briefing: {editionLabel}</h1>

      <div className="mx-auto flex max-w-[900px] flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <div>
          <p className="type-label">Weekly briefing archive</p>
          <p className="type-meta mt-1 text-[var(--text-secondary)]">
            {editionLabel}
          </p>
        </div>
        <a
          href={document.sourceHref}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-3 type-meta font-medium text-[var(--text-secondary)] shadow-[0_1px_2px_rgba(17,17,20,0.04)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
        >
          Outlook email format
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </div>

      {edition === JULY_31_EDITION && <ActivitySplitPreview />}

      <article
        aria-label={`Published weekly briefing for ${editionLabel}`}
        className="min-w-0 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: document.bodyMarkup }}
      />
    </div>
  );
}
