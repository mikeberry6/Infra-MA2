import { ExternalLink } from "lucide-react";
import { getSourceHostname } from "@/lib/source-utils";
import type { EditorialBriefing, EditorialTextRun } from "@/modules/briefings/editorial";
import { references, type ReferenceCategory } from "./references";
import styles from "./gallery.module.css";

const groups: { category: ReferenceCategory; id: string }[] = [
  { category: "Masthead", id: "mastheads" },
  { category: "Key Themes", id: "themes" },
  { category: "Deal cards", id: "deal-cards" },
  { category: "Charts", id: "charts" },
];
const dates = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
const formatDate = (date: string) => dates.format(new Date(date + "T12:00:00Z"));
type Pattern = (typeof references)[number]["pattern"];
const runText = (runs: EditorialTextRun[]) => runs.map(run => run.text).join("");

function excerpt(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "…" : text;
}

function ChartBars({ issue }: { issue: EditorialBriefing }) {
  const rows = issue.charts.sector.slice(0, 3);
  const highest = Math.max(1, ...rows.map(row => row.total));
  return rows.map(row => (
    <div key={row.label} className={styles.barRow}>
      <span>{row.label}</span>
      <span className={styles.barTrack} aria-hidden="true"><i className={styles.barFill} style={{ width: (row.total / highest) * 100 + "%" }} /></span>
      <strong>{row.total}</strong>
    </div>
  ));
}

function Specimen({ pattern, issue, archiveNumber }: {
  pattern: Pattern;
  issue: EditorialBriefing;
  archiveNumber: number;
}) {
  const [lead, next] = issue.cards;
  switch (pattern) {
    case "masthead-agenda": {
      const sectors = [...new Set(issue.cards.map(card => card.sector).filter(Boolean))];
      return <>
        <div className={styles.miniBrand}>Guggenheim</div>
        <p className={styles.paperTitle}>Infrastructure M&amp;A</p>
        <div className={styles.paperRule}>Inside this edition</div>
        <ul className={styles.paperList}>{sectors.slice(0, 3).map(name => <li key={name}>{name}</li>)}</ul>
      </>;
    }
    case "masthead-dateline":
      return <>
        <p className={styles.paperTitle}>Weekly briefing</p>
        <div>Infrastructure Coverage &amp; Advisory</div>
        <p className={styles.paperRule}>{formatDate(issue.edition)}</p>
      </>;
    case "masthead-number":
      return <>
        <span className={styles.miniLabel}>Archive issue {archiveNumber}</span>
        <p className={styles.paperTitle}>Infrastructure M&amp;A</p>
        <p className={styles.paperRule}>{issue.cards.length} deals · {formatDate(issue.edition)}</p>
      </>;
    case "themes-run-in":
      return <>{issue.themes.slice(0, 2).map((runs, index) => {
        const text = runText(runs);
        const leadIn = runs[0]?.bold ? runs[0].text.trimEnd() : text.split(" ").slice(0, 4).join(" ");
        return <p key={index}><strong>{excerpt(leadIn, 12)}</strong>{" "}{excerpt(text.slice(leadIn.length).trim(), 18)}</p>;
      })}</>;
    case "themes-summary-rule":
      return <>
        <div className={styles.miniLabel}>Key themes</div>
        <p>{excerpt(issue.themes[0] ? runText(issue.themes[0]) : lead.description, 26)}</p>
        <p className={styles.paperRule}><strong>{lead.target}</strong><br />{lead.subsector}</p>
      </>;
    case "themes-scale-first":
    case "deals-size-groups": {
      const disclosed = issue.cards.flatMap(card => {
        const note = card.scaleNote || card.description;
        const figure = note.match(/(?:US\$|[A-Z]{1,3}\$|[$£€])\s?\d[\d,.]*(?:\s?(?:bn|mm|trillion|billion|million))?/i);
        return figure ? [{ card, note, amount: figure[0] }] : [];
      });
      if (!disclosed.length) return <><strong>{lead.target}</strong><p>{excerpt(lead.description, 24)}</p></>;
      if (pattern === "themes-scale-first") {
        return <>{disclosed.slice(0, 2).map(({ card, amount, note }) => (
          <p key={card.key}><strong>{amount}</strong> · {card.target}<br /><span className={styles.paperMeta}>{excerpt(note, 15)}</span></p>
        ))}</>;
      }
      const sector = disclosed.find(({ card }) => disclosed.filter(other => other.card.sector === card.sector).length > 1)?.card.sector ?? disclosed[0].card.sector;
      return <>
        <span className={styles.miniLabel}>{sector}</span>
        {disclosed.filter(({ card }) => card.sector === sector).slice(0, 2).map(({ card, amount }) => (
          <div key={card.key} className={styles.paperRule}><strong>{amount}</strong> · {card.target}</div>
        ))}
      </>;
    }
    case "deals-lead-transaction":
      return <>
        <div className={styles.miniLabel}>{lead.sector}</div>
        <p className={styles.paperTitle}>{lead.target}</p>
        <p>{excerpt(lead.description, 18)}</p>
        {next && <p className={styles.paperRule}><strong>{next.target}</strong> · {next.sponsor}</p>}
      </>;
    case "deals-source-line":
      return <>
        <strong>{lead.target}</strong>
        <p className={styles.paperMeta}>{lead.metadata}</p>
        {lead.sourceUrl && <p className={styles.paperMeta}>Source · {getSourceHostname(lead.sourceUrl)}</p>}
        <p>{excerpt(lead.description, 17)}</p>
      </>;
    case "charts-finding-title": {
      const row = issue.charts.sector[0];
      return <>
        {row && <p className={styles.paperTitle}>{row.label} leads with {row.total} YTD deals</p>}
        <ChartBars issue={issue} />
      </>;
    }
    case "charts-as-of":
      return <>
        <strong>Sector activity YTD</strong>
        <ChartBars issue={issue} />
        <p className={styles.paperRule}>Weekly M&amp;A briefing · Through {formatDate(issue.coverageEnd)}</p>
      </>;
    case "charts-defined-measure":
      return <>
        <strong>Deal count by sector</strong>
        <p className={styles.paperMeta}>Reported transactions in the year to date, grouped by sector.</p>
        <ChartBars issue={issue} />
      </>;
  }
}

export default function ReferenceGallery({ issue, archiveNumber }: { issue: EditorialBriefing; archiveNumber: number }) {
  return (
    <section id="design-references" aria-labelledby="references-heading" className={styles.references}>
      <h2 className={styles.refHeading} id="references-heading">Design references</h2>
      <p className={styles.refIntro}>Each study applies one idea from a published issue to the selected week’s briefing. Open the source to see the publisher’s original.</p>
      <nav aria-label="Reference categories" className={styles.categoryNav}>
        {groups.map(({ category, id }) => <a key={id} href={"#" + id}>{category}</a>)}
      </nav>
      {groups.map(({ category, id }) => (
        <section key={id} id={id} className={styles.group} aria-labelledby={id + "-title"}>
          <h3 id={id + "-title"}>{category}</h3>
          <div className={styles.grid}>
            {references.filter(entry => entry.category === category).map(entry => (
              <article key={entry.pattern} className={styles.reference}>
                <div className={styles.specimen}>
                  <div className={styles.paper}><Specimen pattern={entry.pattern} issue={issue} archiveNumber={archiveNumber} /></div>
                </div>
                <p className={styles.refFormat}>{entry.publisher} · {entry.format} · <time dateTime={entry.published}>{formatDate(entry.published)}</time></p>
                <h4>{entry.issue}</h4>
                <p className={styles.takeaway}>{entry.takeaway}</p>
                <a className={styles.refLink} href={entry.url} target="_blank" rel="noreferrer" aria-label={"View original issue from " + entry.publisher + " — " + entry.issue}>
                  View original <ExternalLink size={14} aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
