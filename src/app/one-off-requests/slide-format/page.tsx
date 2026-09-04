import type { Metadata } from "next";
import Image from "next/image";
import { ChevronLeft, Download, FileText } from "lucide-react";
import { withBasePath } from "@/lib/base-path";

export const metadata: Metadata = {
  title: "Slide format",
};

const mandateFit = [
  {
    title: "Rio / BHP infrastructure context",
    text: "Direct Rio / BHP, WAIO and Canadian iron-ore credentials across rail, ports, power and captive infrastructure",
  },
  {
    title: "Structured capital & investor access",
    text: "40–49% partnerships and 10–50% minority interests designed to preserve control and access long-term capital",
  },
  {
    title: "Infrastructure M&A execution",
    text: "Buy-side, sell-side and strategic M&A execution across metals, mining and infrastructure",
  },
];

const profiles = [
  {
    name: "Stuart Beer",
    title: "Senior Managing Director | Infrastructure",
    role: "Senior relationship, transaction strategy and structuring lead",
    bullets: [
      "Senior coverage across mining, transport infrastructure and financing",
      "Direct BHP / Rio Tinto, WAIO and Canadian iron-ore credentials",
      "Structured equity and minority-interest execution with global investors",
    ],
  },
  {
    name: "Mike Berry",
    title: "Vice President | Infrastructure & M&A",
    role: "Day-to-day execution, valuation and diligence lead",
    bullets: [
      "Buy-side, sell-side and strategic infrastructure execution",
      "Metals & mining experience across assets, JVs and restructurings",
      "Recent mandates for Macquarie, Blackstone, EQT, EIG and PIMCO",
    ],
  },
];

const transactionSections = [
  {
    title: "Rio / BHP / WAIO & Canadian iron-ore",
    items: [
      "BHP Billiton — proposed WAIO JV with Rio Tinto (US$116bn) [Withdrawn]",
      "BHP Billiton — potential WAIO infrastructure divestment [Withdrawn]",
      "Infrastructure fund — potential acquisition of ArcelorMittal’s Canadian iron-ore infrastructure [Withdrawn]",
      "BHP Billiton — proposed Rio Tinto takeover (~US$193bn) including US$55bn financing [Withdrawn]",
      "BHP Billiton — South32 spin-off (US$9.5bn)",
    ],
  },
  {
    title: "Transport infrastructure",
    items: [
      "Asciano — strategic / financing advice and defense before US$7.0bn Brookfield / Qube approach (2011–2015)",
      "Asciano — potential separation / divestment of Pacific National Rail coal business",
      "Asciano — potential separation / divestment of Pacific National Rail",
      "Asciano — potential separation / divestment of Patrick Ports",
    ],
  },
  {
    title: "Control-preserving structured capital",
    caption: "40–49% partnerships",
    items: [
      "Aramco — 49% of oil pipeline business to EIG (US$12.4bn)",
      "Intel — 49% of Fab 34 to Apollo (US$11.0bn)",
      "Dow — 40% of Diamond Infrastructure Solutions to Macquarie (US$2.4bn)",
      "EIG — 40% of Elba Island LNG to Blackstone Credit (US$1.2bn)",
    ],
  },
  {
    title: "Infrastructure investor placements",
    caption: "10–50% interests",
    items: [
      "Sempra Infrastructure — 20% stake sale to KKR (US$3.4bn)",
      "Dominion Energy — 50% offshore wind stake to Stonepeak (US$2.6bn)",
      "NiSource — 19.9% indirect NIPSCO stake to Blackstone (US$2.2bn)",
      "Sempra Infrastructure — 10% stake sale to ADIA (US$1.8bn)",
      "DESRI — minority-interest sale to Macquarie (US$1.7bn)",
      "Stonepeak — 49% Cellnex acquisition (US$772mm)",
      "Longroad Energy — minority sale to MEAG / Infratil (US$500mm)",
      "MEAG — minority acquisition in LiveOak Fiber (Undisclosed)",
    ],
  },
  {
    title: "Metals & mining advisory",
    items: [
      "Imperial Metals — 70% sale of Red Chris Mine (C$1.1bn)",
      "Teck Resources — 50% sale of San Nicolás (US$580mm capital commitment)",
      "Senior gold producer — precious-metals JV negotiations (~US$3.0bn)",
      "Coeur Mining — acquisition of Northern Empire (C$117mm)",
      "Royalty company — precious-metals stream acquisition (~US$1.0bn) [Failed]",
      "Boart Longyear — Chapter 15 restructuring (~US$1.0bn)",
      "Cornerstone Building Brands — Coil Coatings sale to BlueScope (US$500mm)",
    ],
  },
  {
    title: "Infrastructure M&A & strategic advisory",
    items: [
      "Macquarie Asset Management — Potters Industries acquisition (~US$1.0bn)",
      "Blackstone — strategic investment / forward-flow partnership (up to US$2.0bn)",
      "PIMCO — strategic review of multibillion-dollar Venture Global stake",
      "EQT Infrastructure — WASH sale to Northleaf / AVALT (~US$1.0bn)",
      "EIG — Tellurian take-private (~US$1.0bn) [Underbidder]",
    ],
  },
];

export default function SlideFormatPage() {
  return (
    <main className="mx-auto max-w-[1040px] px-4 py-8 sm:px-6 sm:py-10">
      <a
        href={withBasePath("/one-off-requests")}
        className="mb-6 inline-flex items-center gap-1.5 type-meta text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        One-Off Requests
      </a>

      <header className="border-b border-[var(--border)] pb-7">
        <p className="type-micro font-medium uppercase tracking-[0.16em] text-[#442142]">
          One-off presentation
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          Slide format
        </h1>
        <p className="mt-3 max-w-3xl type-body text-[var(--text-secondary)]">
          The downloadable PowerPoint preserves the editable Rio Tinto slide layout while reducing every visible text segment to its first character. The complete original copy appears below.
        </p>
      </header>

      <section className="grid gap-5 border-b border-[var(--border)] py-7 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
        <div className="overflow-hidden border border-[var(--border)] bg-white shadow-sm">
          <Image
            src={withBasePath("/one-off-requests/slide-format-preview.png")}
            alt="Preview of the Rio Tinto slide format with initials-only text"
            width={1600}
            height={900}
            className="h-auto w-full"
            priority
          />
        </div>
        <div className="surface p-4">
          <div className="flex items-center gap-2 text-[#442142]">
            <FileText className="h-4 w-4" />
            <span className="type-micro font-medium uppercase tracking-wider">PowerPoint</span>
          </div>
          <p className="mt-3 type-meta text-[var(--text-secondary)]">
            One editable 16:9 slide with the original layout, palette, shapes and text positions retained.
          </p>
          <a
            href={withBasePath("/one-off-requests/slide-format.pptx")}
            download
            className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#442142] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#562a54] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#442142]/30"
          >
            <Download className="h-4 w-4" />
            Download PowerPoint
          </a>
        </div>
      </section>

      <article className="py-8">
        <div className="max-w-3xl">
          <p className="type-micro font-medium uppercase tracking-[0.16em] text-[#B4A87D]">
            Contemplated infrastructure sale
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Proposed Rio Tinto Buy-Side Advisory Team
          </h2>
          <p className="mt-3 type-body text-[var(--text-secondary)]">
            Senior relationship leadership paired with hands-on execution, underpinned by directly relevant transaction experience
          </p>
        </div>

        <section className="mt-8">
          <h3 className="type-section-title">Mandate fit — asset context, transaction structure and execution</h3>
          <div className="mt-3 grid gap-px overflow-hidden border border-[var(--border)] bg-[var(--border)] md:grid-cols-3">
            {mandateFit.map((item) => (
              <div key={item.title} className="bg-[var(--bg-primary)] p-4">
                <h4 className="type-row-title">{item.title}</h4>
                <p className="mt-2 type-meta text-[var(--text-secondary)]">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          {profiles.map((profile) => (
            <div key={profile.name} className="surface p-5">
              <h3 className="text-xl font-semibold text-[var(--text-primary)]">{profile.name}</h3>
              <p className="mt-1 type-meta font-medium text-[#442142]">{profile.title}</p>
              <p className="mt-3 type-body text-[var(--text-secondary)]">{profile.role}</p>
              <ul className="mt-4 space-y-2 pl-5 type-meta text-[var(--text-secondary)] marker:text-[#B4A87D]">
                {profile.bullets.map((bullet) => (
                  <li key={bullet} className="list-disc pl-1">{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="mt-10">
          <h3 className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Selected transaction experience
          </h3>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {transactionSections.map((section) => (
              <section key={section.title} className="border-t-2 border-[#442142] pt-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="type-row-title">{section.title}</h4>
                  {section.caption ? (
                    <span className="type-micro text-[var(--text-tertiary)]">{section.caption}</span>
                  ) : null}
                </div>
                <ul className="mt-3 space-y-2 pl-5 type-meta text-[var(--text-secondary)] marker:text-[#B4A87D]">
                  {section.items.map((item) => (
                    <li key={item} className="list-disc pl-1">{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[var(--border)] pt-4 type-micro text-[var(--text-tertiary)]">
          <span>GUGGENHEIM SECURITIES | CONFIDENTIAL</span>
          <span>20</span>
        </footer>
      </article>
    </main>
  );
}
