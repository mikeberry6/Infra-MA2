import type { Metadata } from "next";
import { ExternalLink, FileText } from "lucide-react";
import { DatabaseIntelligenceHeader } from "@/components/shared/DatabaseIntelligenceHeader";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "One-Off Requests",
};

const ONE_OFF_REQUESTS = [
  {
    title: "Operating benchmark source compendium - full evidence archive",
    description:
      "349-page provenance pack with the original request, six prompts, 198 research pages, draft synthesis, a 42-metric and 25-business evidence audit, source URL index, methodology, and final briefs.",
    href: "/one-off-requests/operating-benchmark-two-pagers/operating-benchmark-source-compendium.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Operating benchmark two-page briefs - combined pack",
    description:
      "Twelve-page review pack covering six subverticals; unsupported point estimates are replaced with first-principles directional frameworks.",
    href: "/one-off-requests/operating-benchmark-two-pagers/all-subverticals-two-page-briefs.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Home Comfort operating benchmark",
    description:
      "Two-page brief with metric rationales and supporting business profiles for Reliance Home Comfort and Enercare.",
    href: "/one-off-requests/operating-benchmark-two-pagers/01-home-comfort-two-page-brief.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Point-of-Use Water operating benchmark",
    description:
      "Two-page brief with metric rationales and supporting business profiles for AquaVenture Holdings / Quench and Primo Water.",
    href: "/one-off-requests/operating-benchmark-two-pagers/02-point-of-use-water-two-page-brief.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Submetering operating benchmark",
    description:
      "Two-page brief covering benchmark economics and six building-submetering, billing, and meter-asset businesses.",
    href: "/one-off-requests/operating-benchmark-two-pagers/03-submetering-two-page-brief.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Liquid Environmental Services operating benchmark",
    description:
      "Two-page brief preserving separate onsite-system and route-processing archetypes across four businesses.",
    href: "/one-off-requests/operating-benchmark-two-pagers/04-liquid-environmental-services-two-page-brief.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Transportation Solutions operating benchmark",
    description:
      "Two-page brief covering railcar, locomotive, airport ground-support equipment, and yard-logistics archetypes.",
    href: "/one-off-requests/operating-benchmark-two-pagers/05-transportation-solutions-two-page-brief.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Specialty Rental operating benchmark",
    description:
      "Two-page brief covering consumer storage, B2B storage, modular space, and trench-safety rental archetypes.",
    href: "/one-off-requests/operating-benchmark-two-pagers/06-specialty-rental-two-page-brief.pdf",
    format: "PDF",
    date: "Jul 2026",
  },
  {
    title: "Comparable sector assessment",
    description:
      "Plain Arial comparability analysis covering six customer-site equipment and infrastructure-services sectors.",
    href: "/one-off-requests/comparable-sector-assessment-outlook.html",
    format: "Outlook HTML",
    date: "Jul 2026",
  },
  {
    title: "Waste and asset-intensive rental transaction multiples",
    description:
      "Plain Arial sector list with selected transaction multiples and one-click Outlook copying.",
    href: "/one-off-requests/waste-transaction-multiples-outlook.html",
    format: "Outlook HTML",
    date: "Jul 2026",
  },
  {
    title: "Waste & ES and rental infrastructure manager tiers",
    description:
      "Plain Arial bullet list of tiered infrastructure-manager transaction experience with one-click Outlook copying.",
    href: "/one-off-requests/waste-es-rental-infrastructure-manager-tiers-outlook.html",
    format: "Outlook HTML",
    date: "Jul 2026",
  },
  {
    title: "Customer-site equipment comp universe email table",
    description:
      "Outlook-friendly HTML table using the Guggenheim purple and gold email palette.",
    href: "/one-off-requests/customer-site-equipment-comp-universe-email-table.html",
    format: "Outlook HTML",
    date: "Jul 2026",
  },
  {
    title: "Q1 2026 Infrastructure Quarterly Email",
    description:
      "Professional Guggenheim infrastructure quarterly formatted for direct Chrome-to-Outlook pasting.",
    href: "/email-format/2026-q2-infrastructure-quarterly.html",
    format: "Outlook HTML",
    date: "Apr 2026",
  },
];

export default function OneOffRequestsPage() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-8 sm:py-10">
      <DatabaseIntelligenceHeader
        eyebrow="Reusable outputs"
        title="One-Off Requests"
        summary="A small library for standalone email builds, tables, and other ad hoc deliverables that sit outside the weekly briefing archive."
        metrics={[
          {
            label: "Items",
            value: ONE_OFF_REQUESTS.length.toLocaleString(),
            detail: "Available now",
            color: "var(--accent)",
          },
          {
            label: "Primary format",
            value: "PDF + HTML",
            detail: "Review and Outlook",
            color: "#442142",
          },
          {
            label: "Latest",
            value: "Jul 2026",
            detail: "Most recent one-off",
            color: "#B4A87D",
          },
        ]}
      />

      <div className="space-y-2">
        {ONE_OFF_REQUESTS.map((item) => (
          <a
            key={item.href}
            href={withBasePath(item.href)}
            className="block surface px-4 py-3 transition-colors hover:bg-[var(--bg-subtle)] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-soft)]"
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 type-micro font-medium text-[var(--text-secondary)]">
                <FileText className="h-3 w-3 text-[#442142]" />
                {item.format}
              </span>
              <span className="type-micro">· {item.date}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="type-row-title transition-colors group-hover:text-[var(--accent)]">
                  {item.title}
                </h2>
                <p className="type-meta mt-1">{item.description}</p>
              </div>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)] transition-colors group-hover:text-[var(--accent)]" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
