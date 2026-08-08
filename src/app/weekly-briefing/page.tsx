import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  listWeeklyBriefingEditions,
  loadWeeklyBriefingDocument,
} from "@/modules/briefings/archive";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Weekly Briefing",
  description:
    "InfraSight's weekly briefing on infrastructure sponsor M&A activity.",
};

const JULY_31_EDITION = "2026-07-31";
const JULY_31_DATE_LABEL = "July 25 – July 31, 2026";

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
    <>
      <h1 className="sr-only">Weekly Briefing: {editionLabel}</h1>
      <article
        aria-label={`Published weekly briefing for ${editionLabel}`}
        className="min-w-0 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: document.bodyMarkup }}
      />
    </>
  );
}
