import fs from "fs";
import path from "path";
import { deals } from "../../prisma/seed-data/deals.ts";

interface Options {
  start: string;
  end: string;
  out?: string;
  print: boolean;
}

const ROOT = process.cwd();
const TEMPLATE_PATH = path.join(ROOT, "scripts/research/full-universe-protocol.md");
const OUTPUT_DIR = path.join(ROOT, "scripts/research/output");
const MANAGER_AUDIT_PATH = path.join(ROOT, "audits/portfolio-current-owner-fund-verification-2026-05-11.csv");

function usage(): never {
  throw new Error(
    [
      "Usage: npm run research:full-universe-prompt -- --start YYYY-MM-DD --end YYYY-MM-DD [--out path] [--print]",
      "",
      "Example:",
      "  npm run research:full-universe-prompt -- --start 2026-05-09 --end 2026-05-15",
    ].join("\n"),
  );
}

function parseArgs(argv: string[]): Options {
  const options: Partial<Options> = { print: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--print") {
      options.print = true;
      continue;
    }

    if (arg.startsWith("--start=")) {
      options.start = arg.slice("--start=".length);
      continue;
    }

    if (arg === "--start") {
      options.start = argv[++i];
      continue;
    }

    if (arg.startsWith("--end=")) {
      options.end = arg.slice("--end=".length);
      continue;
    }

    if (arg === "--end") {
      options.end = argv[++i];
      continue;
    }

    if (arg.startsWith("--out=")) {
      options.out = arg.slice("--out=".length);
      continue;
    }

    if (arg === "--out") {
      options.out = argv[++i];
      continue;
    }

    usage();
  }

  if (!options.start || !options.end) usage();
  assertDate(options.start, "--start");
  assertDate(options.end, "--end");

  if (Date.parse(`${options.start}T00:00:00Z`) > Date.parse(`${options.end}T00:00:00Z`)) {
    throw new Error("--start must be before or equal to --end");
  }

  return options as Options;
}

function assertDate(value: string, name: string) {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`${name} must use YYYY-MM-DD format`);
  }
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((csvRow) => csvRow.some((value) => value.trim()));
}

function getManagerUniverse(): string[] {
  const rows = parseCsv(fs.readFileSync(MANAGER_AUDIT_PATH, "utf8"));
  const header = rows[0];
  const managerIndex = header.indexOf("current_owner_investment_firm");
  if (managerIndex === -1) {
    throw new Error(`Missing current_owner_investment_firm column in ${MANAGER_AUDIT_PATH}`);
  }

  return uniqueSorted(rows.slice(1).map((row) => row[managerIndex] ?? ""));
}

function markdownEscape(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/\|/g, "/")
    .replace(/\r?\n/g, " ")
    .trim();
}

function renderManagerUniverse(managers: string[]): string {
  return managers.map((manager, index) => `${index + 1}. ${manager}`).join("\n");
}

function renderExistingDeals(start: string, end: string): string {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T23:59:59Z`);
  const inPeriod = deals
    .filter((deal) => {
      const time = Date.parse(deal.date);
      return time >= startTime && time <= endTime;
    })
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  if (inPeriod.length === 0) {
    return "No existing repo deals are dated inside this target period.";
  }

  const rows = inPeriod.map((deal) =>
    [
      deal.date.slice(0, 10),
      deal.target,
      deal.buyer,
      deal.seller,
      deal.category.join(", "),
      deal.sourceUrl,
    ]
      .map(markdownEscape)
      .join(" | "),
  );

  return [
    `Existing in-period repo deals: ${inPeriod.length}`,
    "",
    "| Date | Target | Buyer | Seller | Category | Source URL |",
    "|---|---|---|---|---|---|",
    ...rows.map((row) => `| ${row} |`),
  ].join("\n");
}

function renderPrompt(options: Options): string {
  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const managers = getManagerUniverse();
  const replacements: Record<string, string> = {
    PERIOD_START: options.start,
    PERIOD_END: options.end,
    GENERATED_AT: new Date().toISOString(),
    MANAGER_COUNT: String(managers.length),
    MANAGER_UNIVERSE: renderManagerUniverse(managers),
    EXISTING_DEALS: renderExistingDeals(options.start, options.end),
  };

  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key: string) => {
    const replacement = replacements[key];
    if (replacement === undefined) throw new Error(`No replacement found for ${key}`);
    return replacement;
  });
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const prompt = renderPrompt(options);
  const outPath = path.resolve(
    ROOT,
    options.out ?? path.join(OUTPUT_DIR, `full-universe-${options.start}-to-${options.end}.md`),
  );

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, prompt);

  if (options.print) {
    process.stdout.write(prompt);
  } else {
    console.log(`Wrote ${path.relative(ROOT, outPath)}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
