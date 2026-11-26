import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { researchMetadata } from "@/lib/public-metadata";
import { listWeeklyBriefingEditions, loadWeeklyBriefingDocument } from "@/modules/briefings/archive";
import { parseEditorialBriefing } from "@/modules/briefings/editorial";
import { hasVerifiedBriefingMembership } from "@/modules/briefings/membership";
import { listPublishedBriefingEditions } from "@/modules/briefings/publication";
import { getLatestDealDate } from "@/modules/deals/queries";
import styles from "./briefing.module.css";

export const dynamic = "force-dynamic";

type Briefing = ReturnType<typeof parseEditorialBriefing>;
type PageProps = { searchParams: Promise<{ edition?: string | string[] }> };

const fullDate = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" });
const dateOf = (value: string) => new Date(`${value}T00:00:00Z`);
const editionHref = (value: string) => `/weekly-briefing?edition=${encodeURIComponent(value)}`;

// The publication inventory governs the latest edition and archive picker.
// Older dated bookmarks can still open the original editorial content.
const readEdition = cache(async (requestedEdition: string | undefined) => {
  const files = await listWeeklyBriefingEditions();
  let published: string[];
  try {
    published = await listPublishedBriefingEditions(files);
  } catch (error) {
    if (!requestedEdition) throw error;
    console.error("Weekly briefing publication index unavailable", error);
    published = [];
  }
  const edition = requestedEdition ?? published[0];
  if (!edition || !files.includes(edition)) notFound();
  const document = await loadWeeklyBriefingDocument({ edition });
  return { published, document, issue: parseEditorialBriefing(edition, document.documentMarkup) };
});

function requestedEdition(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type EditionCover = {
  headline: string;
  deck: string;
  section: string;
  image: { src: string; alt: string; width: number; height: number; caption: string; credit: string; creditHref: string };
};

const editionCovers: Partial<Record<string, EditionCover>> = {
  "2026-11-21": {
    headline: "Blackstone’s AWS data center deal leads the week",
    deck: "Two joint ventures will own 13 data centers in Indiana and Mississippi, with 647 MW of IT capacity and US$5bn in aggregate gross asset value.",
    section: "Digital infrastructure",
    image: {
      src: "/briefings/data-center.webp",
      width: 1440,
      height: 919,
      alt: "Aerial view of a cluster of data centers near Ashburn, Virginia.",
      caption: "Data centers near Ashburn, Virginia, photographed in November 2025.",
      credit: "Theodore Christopher / CC0",
      creditHref: "https://commons.wikimedia.org/wiki/File:Data_centers_in_Ashburn.jpg",
    },
  },
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { issue } = await readEdition(requestedEdition((await searchParams).edition));
  const cover = editionCovers[issue.edition];
  const title = `${cover?.headline ?? issue.title} · Weekly briefing · ${issue.edition}`;
  const description = cover?.deck ?? "InfraSight’s curated weekly briefing on infrastructure sponsor transactions.";
  return researchMetadata(editionHref(issue.edition), title, description, "article");
}

function ActivityChart({ heading, rows }: { heading: string; rows: Briefing["charts"]["sector"] }) {
  if (!rows.length) return null;
  const maximum = Math.max(...rows.map(row => row.total), 1);
  const hasSplit = rows.some(row => row.direct !== null || row.portfolio !== null);
  const hasPending = rows.some(row => row.pending !== null && row.pending > 0);
  return (
    <section className={styles.chart}>
      <h3>{heading}</h3>
      <table>
        <caption className="sr-only">Year-to-date deal counts by {heading.toLowerCase()}</caption>
        <thead className="sr-only"><tr><th scope="col">{heading}</th><th scope="col">Activity breakdown</th><th scope="col">Total deals</th></tr></thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>
                <div className={styles.chartTrack} aria-hidden="true">
                  <div className={styles.chartBar} style={{ width: `${100 * row.total / maximum}%` }}>
                    {row.direct !== null && row.total > 0 && <i className={styles.direct} style={{ width: `${100 * row.direct / row.total}%` }} />}
                    {row.portfolio !== null && row.total > 0 && <i className={styles.portfolio} style={{ width: `${100 * row.portfolio / row.total}%` }} />}
                    {row.pending !== null && row.total > 0 && <i className={styles.pending} style={{ width: `${100 * row.pending / row.total}%` }} />}
                  </div>
                </div>
                <span className="sr-only">
                  {row.direct !== null && `${row.direct} direct fund. `}
                  {row.portfolio !== null && `${row.portfolio} portfolio company. `}
                  {row.pending !== null && `${row.pending} prior YTD scope pending.`}
                </span>
              </td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hasSplit && <p className={styles.legend}><span><i className={styles.direct} />Direct fund</span><span><i className={styles.portfolio} />Portfolio company</span>{hasPending && <span><i className={styles.pending} />Prior YTD scope pending</span>}</p>}
    </section>
  );
}

export default async function WeeklyBriefingPage({ searchParams }: PageProps) {
  const { issue, document, published } = await readEdition(requestedEdition((await searchParams).edition));
  const [verified, latestDisclosure] = await Promise.all([
    hasVerifiedBriefingMembership(issue),
    getLatestDealDate().catch(() => null),
  ]);
  const { edition, cards, coverageStart, coverageEnd } = issue;
  const cover = editionCovers[edition];
  const sections = new Map<string, Briefing["cards"]>();
  for (const card of cards) {
    const sector = card.sector || "Other infrastructure";
    const stories = sections.get(sector);
    if (stories) stories.push(card);
    else sections.set(sector, [card]);
  }
  const sectors = Array.from(sections);
  const index = published.indexOf(edition);
  const older = index === -1 ? undefined : published[index + 1];
  const newer = index > 0 ? published[index - 1] : undefined;
  const isLatest = edition === published[0];
  const hasCharts = issue.charts.sector.length > 0 || issue.charts.region.length > 0;
  const coverage = fullDate.formatRange(dateOf(coverageStart), dateOf(coverageEnd));
  const trackerHref = verified ? `/tracker?briefing=${edition}&via=briefing` : "/tracker";

  return (
    <article className={styles.page} data-briefing-edition={edition} data-briefing-deal-list={verified ? "verified" : "editorial-only"}>
      <div className={styles.inner}>
        <header className={styles.masthead}>
          <div><p className={styles.mastheadTitle}>Weekly briefing</p><p className={styles.issueDate}>Edition date <time dateTime={edition}>{fullDate.format(dateOf(edition))}</time></p></div>
          <div className={styles.tools}>
            {published.length > 0 && <form action="/weekly-briefing" method="get" className={styles.archivePicker}>
              <label htmlFor="briefing-edition">Edition</label>
              <select id="briefing-edition" name="edition" defaultValue={edition} aria-label="Published editions">
                {index === -1 && <option value={edition}>{fullDate.format(dateOf(edition))} (archive)</option>}
                {published.map(date => <option key={date} value={date}>{fullDate.format(dateOf(date))}</option>)}
              </select>
              <button type="submit" aria-label="Open edition"><ArrowRight size={16} aria-hidden="true" /></button>
            </form>}
            <a className={styles.emailLink} href={isLatest ? "/email-format/latest" : document.sourceHref}><Mail size={15} aria-hidden="true" />{isLatest ? "View email version" : "Email for this edition"}</a>
          </div>
        </header>

        <section className={cover ? styles.cover : styles.archiveCover} aria-labelledby="briefing-headline">
          <div className={styles.coverCopy}>
            {cover && <p className={styles.kicker}>{cover.section}</p>}
            <h1 id="briefing-headline">{cover?.headline ?? issue.title}</h1>
            {cover && <p className={styles.deck}>{cover.deck}</p>}
            <p className={styles.coverMeta}>Coverage <span>{coverage}</span></p>
          </div>
          {cover && <figure className={styles.figure}>
            <Image src={cover.image.src} width={cover.image.width} height={cover.image.height} priority sizes="(min-width: 1200px) 610px, (min-width: 800px) 48vw, 100vw" alt={cover.image.alt} />
            <figcaption>{cover.image.caption} <a href={cover.image.creditHref} target="_blank" rel="noopener noreferrer">{cover.image.credit}</a></figcaption>
          </figure>}
        </section>

        <section className={styles.themes} aria-labelledby="key-themes">
          <h2 id="key-themes" className={styles.sectionLabel}>Key themes</h2>
          {issue.themes.map((runs, index) => <p key={index}>{runs.map((run, i) => run.bold ? <strong key={i}>{run.text}</strong> : run.text)}</p>)}
        </section>

        <div className={styles.reportGrid}>
          <aside className={styles.rail}>
            <div className={styles.railInner}>
              <nav aria-label="In this edition">
                <h2 className={styles.sectionLabel}>In this edition</h2>
                {sectors.map(([sector, stories], i) => <a key={sector} href={`#sector-${i + 1}`}>{sector}<span>{stories.length}</span></a>)}
                {hasCharts && <a href="#ytd-activity">Year-to-date activity<ArrowDown size={13} aria-hidden="true" /></a>}
              </nav>
              <div className={styles.trackerBox}>
                <h2 className={styles.sectionLabel}>Deal tracker</h2>
                <p>{verified ? "Explore the database records for this edition." : "The tracker has no verified list for this edition."}</p>
                {latestDisclosure && <p>Latest tracker disclosure <time dateTime={latestDisclosure.toISOString().slice(0, 10)}>{fullDate.format(latestDisclosure)}</time></p>}
                <Link href={trackerHref}>{verified ? "View these deals" : "Browse all deals"}<ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </div>
          </aside>
          <div className={styles.stories}>
            {sectors.map(([sector, stories], i) => <section key={sector} id={`sector-${i + 1}`} className={styles.sector}>
              <h2 className={styles.sectorTitle}>{sector}</h2>
              {stories.map(card => (
                <article key={card.key} className={styles.story}>
                  <h3>{card.title}</h3>
                  <p className={styles.storyMeta}>{card.metadata}</p>
                  <p className={styles.storyText}>{card.description}</p>
                  {card.sourceUrl && <a className={styles.source} href={card.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Source for ${card.title}`}>Source<ArrowUpRight size={14} aria-hidden="true" /></a>}
                </article>
              ))}
            </section>)}
          </div>
        </div>

        {hasCharts && <section id="ytd-activity" className={styles.activity}>
          <div className={styles.activityHeading}><h2>Year-to-date activity</h2><p>Deal counts through {fullDate.format(dateOf(coverageEnd))}</p></div>
          <div className={styles.charts}><ActivityChart heading="Sector" rows={issue.charts.sector} /><ActivityChart heading="Region" rows={issue.charts.region} /></div>
        </section>}
        <nav className={styles.editionNav} aria-label="Edition navigation">
          {older && <Link href={editionHref(older)}><ChevronLeft size={15} aria-hidden="true" />Older edition</Link>}
          {newer && <Link href={editionHref(newer)}>Newer edition<ChevronRight size={15} aria-hidden="true" /></Link>}
          {!isLatest && published.length > 0 && <a href="/email-format/latest"><Mail size={14} aria-hidden="true" />Latest email version</a>}
          <Link href="/tracker">All deals<ArrowRight size={15} aria-hidden="true" /></Link>
        </nav>
      </div>
    </article>
  );
}
