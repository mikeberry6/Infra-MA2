import Link from "next/link";
import { researchMetadata } from "@/lib/public-metadata";

export const metadata = researchMetadata(
  "/methodology",
  "Research Methodology",
  "How InfraSight defines transaction coverage, fund sizes, ownership attribution, and monitoring sources.",
);

const coverage = [
  {
    title: "Transactions",
    body: "The deal tape tracks disclosed infrastructure transactions and strategic activity. The deal date is the announcement or disclosure date. Status describes the transaction stage, and available sources accompany each record. Transaction counts are counts of database records in the selected screen.",
  },
  {
    title: "Funds and reported size",
    body: "InfraSight tracks individual vehicles and manager programs. Reported sizes can represent different measures, including targets, commitments, or program assets. The profile shows the reported currency, basis, date, and source where available. The size coverage count shows how many matching vehicles have a disclosed amount. USD size filters use records with a USD-equivalent amount.",
  },
  {
    title: "Portfolio company ownership",
    body: "Company profiles distinguish current and former ownership periods. Fund attribution may be disclosed, inferred, tied to a direct investment program, or unresolved. Where available, the profile shows the attribution and supporting sources.",
  },
  {
    title: "News and monitoring",
    body: "The feed surfaces public items about tracked entities and labels reported rumors and confidence. The market dashboard shows the source, freshness, and coverage of its observations. Publication dates describe the underlying items, while refresh timestamps describe the feed.",
  },
  {
    title: "Weekly briefing",
    body: "Each edition is manually curated for its stated reporting window. The web and email editions preserve that selection. Linked records show the transactions mapped to the edition in the database.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="type-label">Research</p>
      <h1 className="mt-2 type-page-title">Research Methodology</h1>
      <p className="mt-2 type-narrative">How InfraSight defines the coverage, dates, and evidence behind its research.</p>
      <div className="mt-6 space-y-3">
        {coverage.map(({ title, body }) => (
          <section key={title} className="surface px-4 py-4">
            <h2 className="type-row-title font-semibold">{title}</h2>
            <p className="mt-1 type-meta leading-relaxed">{body}</p>
          </section>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap gap-4 type-meta">
        <Link href="/tracker" className="font-semibold underline underline-offset-2">Explore transactions</Link>
        <a href="mailto:research@infrasight.com" className="font-semibold underline underline-offset-2">Contact research</a>
      </div>
    </div>
  );
}
