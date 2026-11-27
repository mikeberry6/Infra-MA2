import { parseIssueDocument, type Issue } from "../../../scripts/briefing-deals/archive";

export interface EditorialTextRun {
  text: string;
  bold: boolean;
}

export interface EditorialChartRow {
  label: string;
  total: number;
  direct: number | null;
  portfolio: number | null;
  pending: number | null;
}

export interface EditorialBriefing extends Issue {
  cards: (Issue["cards"][number] & { authoredFact?: string })[];
  title: string;
  themes: EditorialTextRun[][];
  charts: { sector: EditorialChartRow[]; region: EditorialChartRow[] };
}

function paragraphRuns(paragraph: Element): EditorialTextRun[] {
  const runs: EditorialTextRun[] = [];
  function visit(node: Node, bold: boolean) {
    if (node.nodeType === 3) {
      const text = node.textContent ?? "";
      const previous = runs[runs.length - 1];
      if (previous && previous.bold === bold) previous.text += text;
      else runs.push({ text, bold });
    } else if (node.nodeType === 1) {
      const el = node as Element;
      const emphasized = bold || el.matches("strong, b") ||
        /font-weight\s*:\s*(?:bold|[7-9]00)\b/i.test(el.getAttribute("style") ?? "");
      el.childNodes.forEach((child) => visit(child, emphasized));
    }
  }
  visit(paragraph, false);
  // Collapse layout whitespace while keeping spaces that separate bold and plain text.
  for (const run of runs) run.text = run.text.replace(/\s+/g, " ");
  if (runs.length) {
    runs[0].text = runs[0].text.trimStart();
    runs[runs.length - 1].text = runs[runs.length - 1].text.trimEnd();
  }
  return runs.filter((run) => run.text.length > 0);
}

function readThemes(document: Document): EditorialTextRun[][] {
  const heading = Array.from(document.querySelectorAll("div")).find(
    (element) => element.textContent?.trim().toLowerCase() === "key themes",
  );
  const content = heading?.nextElementSibling;
  if (!content) return [];
  // The earliest editions have one prose div. Later editions put each paragraph in its own cell.
  const paragraphs = content.matches("table") ? Array.from(content.querySelectorAll("td")) : [content];
  return paragraphs.map(paragraphRuns);
}

function count(value: string | null): number | null {
  return value !== null && /^\d+$/.test(value.trim()) ? Number(value) : null;
}

function readChart(document: Document, kind: "sector" | "region"): EditorialChartRow[] {
  const markedChart = document.querySelector(`[data-activity-chart="${kind}"]`);
  const title = `deal count by ${kind} (ytd)`;
  const chart = markedChart ?? Array.from(document.querySelectorAll("td")).find(
    (cell) => cell.textContent?.trim().toLowerCase() === title,
  )?.closest("table");
  if (!chart) return [];

  return Array.from(chart.querySelectorAll("tr")).flatMap((row) => {
    // The Outlook bars themselves contain tables and nested rows.
    if (row.closest("table") !== chart || row.children.length !== 3) return [];
    const label = row.children[0].textContent?.trim();
    const total = count(row.children[2].textContent);
    if (!label || total === null) return [];
    return [{
      label,
      total,
      direct: count(row.getAttribute("data-direct")),
      portfolio: count(row.getAttribute("data-portfolio")),
      pending: count(row.getAttribute("data-pending")),
    }];
  });
}

export function parseEditorialBriefing(edition: string, html: string): EditorialBriefing {
  const { issue, document, sourceLinks, overviewCells } = parseIssueDocument(edition, html);
  // Card URLs are normalized for matching database records. Retain the published
  // destination for display, including its original query string and fragment.
  const cards = issue.cards.map((card, index) => {
    const overview = overviewCells[index];
    const emphasis = overview?.querySelector("[data-deal-fact]") ?? overview?.querySelector("strong, b");
    const authoredFact = emphasis?.textContent?.replace(/\s+/g, " ").trim();
    return {
      ...card,
      ...(authoredFact && { authoredFact }),
      sourceUrl: card.sourceUrl ? sourceLinks[index].getAttribute("href") ?? "" : "",
    };
  });
  return {
    ...issue,
    title: document.title.trim(),
    cards,
    themes: readThemes(document),
    charts: { sector: readChart(document, "sector"), region: readChart(document, "region") },
  };
}
