// Single source of truth for company-name canonicalization. Used to detect
// duplicate Company rows whose `name` differs by entity suffix ("LLC",
// "Inc"), parenthetical alias ("(ASTP)"), parenthetical descriptive subname
// ("(Phase 1 Patient Tower)"), trailing asset-descriptor ("Pipeline Project"
// vs "Pipeline"), country-string formatting ("United States" vs "United
// States / Canada"), punctuation, or casing.
//
// `companyDedupKeys()` returns a SET of keys per company. Two companies are
// the same if any of their keys match — this catches both the "strip parens"
// and "inline parens contents" interpretations without committing to one.
//
// Conservative by design: keys never reach across different leading words
// (e.g. "Student Transportation Inc." vs "Landmark Student Transportation"
// stay distinct).

const ENTITY_SUFFIXES = [
  "llc", "l l c", "inc", "incorporated", "ltd", "limited",
  "corporation", "corp", "co", "company", "holdings", "holding",
  "group", "partners", "lp", "lllp", "plc", "ag", "sa", "sas",
  "spa", "nv", "bv", "gmbh", "kk",
];
const ENTITY_SUFFIX_RE = new RegExp(`\\s+(?:${ENTITY_SUFFIXES.join("|")})$`);

// Trailing words that describe what KIND of asset the company is, not the
// brand itself. Stripping these lets "Coastal GasLink Pipeline Project" and
// "Coastal GasLink Pipeline" collapse to one cluster. Order matters — we
// peel iteratively, so "Pipeline Project" → "Pipeline" → "" both work.
const TRAILING_DESCRIPTORS = [
  "project", "pipeline", "portfolio", "platform", "holdco", "holdco s",
  "system", "systems", "facility", "facilities", "asset", "assets",
];
const TRAILING_DESCRIPTOR_RE = new RegExp(`\\s+(?:${TRAILING_DESCRIPTORS.join("|")})$`);

function stripPunctAndCollapse(s: string): string {
  return s
    .replace(/\s*&\s*/g, " and ")
    .replace(/[,.()'"\u2019\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function peelSuffixes(s: string): string {
  let n = s;
  let changed = true;
  while (changed) {
    changed = false;
    if (ENTITY_SUFFIX_RE.test(n)) {
      n = n.replace(ENTITY_SUFFIX_RE, "").trim();
      changed = true;
    }
    if (TRAILING_DESCRIPTOR_RE.test(n)) {
      n = n.replace(TRAILING_DESCRIPTOR_RE, "").trim();
      changed = true;
    }
  }
  return n;
}

function applyCuratedAliases(s: string): string {
  if (
    s === "vantage sdc" ||
    s === "vantage data centers north america" ||
    s === "vantage data centers stabilized north america"
  ) {
    return "vantage data centers";
  }
  return s;
}

// Returns the primary canonical key (parens stripped to nothing). Kept as a
// named export for callers that just want a single key (most callers should
// use `companyDedupKeys` instead).
export function canonicalCompanyKey(name: string): string {
  let n = name.toLowerCase().trim();
  n = n.replace(/\s*\([^)]*\)\s*/g, " ");
  n = stripPunctAndCollapse(n);
  n = n.replace(/^the\s+/, "").trim();
  return applyCuratedAliases(peelSuffixes(n));
}

// Returns the SET of equivalence keys for a company name. Two companies
// match if these sets intersect.
//
//  - keyA: parens stripped to nothing — collapses "X (alias)" with "X".
//          Catches the ASTP / ALLO / via-X patterns.
//  - keyB: parens flattened to bare tokens — collapses
//          "Etobicoke General Hospital (Phase 1 Patient Tower)" with the
//          same string written without the parens.
//
// When the name has no parens, both keys are identical and we return one.
export function companyDedupKeys(name: string): Set<string> {
  const lower = name.toLowerCase().trim();
  const keys = new Set<string>();

  // Variant A: parens stripped entirely.
  let a = lower.replace(/\s*\([^)]*\)\s*/g, " ");
  a = stripPunctAndCollapse(a);
  a = a.replace(/^the\s+/, "").trim();
  a = applyCuratedAliases(peelSuffixes(a));
  if (a) keys.add(a);

  // Variant B: parens removed but their contents kept as bare tokens.
  let b = lower.replace(/\s*\(([^)]*)\)\s*/g, " $1 ");
  b = stripPunctAndCollapse(b);
  b = b.replace(/^the\s+/, "").trim();
  b = applyCuratedAliases(peelSuffixes(b));
  if (b) keys.add(b);

  return keys;
}

// Pick the most user-friendly display name from a set of variants that share
// a canonical key. Preference: the variant with the most non-empty tokens
// (so "ALLO Communications, LLC" beats "ALLO Communications"); ties go to the
// longest string; final tiebreak is the first one seen (stable).
export function preferredDisplayName(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.some((name) => applyCuratedAliases(canonicalCompanyKey(name)) === "vantage data centers")) {
    return "Vantage Data Centers";
  }
  return [...names].sort((a, b) => {
    const tokensA = a.split(/\s+/).filter(Boolean).length;
    const tokensB = b.split(/\s+/).filter(Boolean).length;
    if (tokensA !== tokensB) return tokensB - tokensA;
    return b.length - a.length;
  })[0];
}

// Group items by overlapping key-sets via union-find. Each item supplies a
// SET of keys; two items end up in the same cluster if their key sets share
// any element. Returns an array of clusters. Order within a cluster matches
// the input order; cluster order matches the first-seen item per cluster.
export function groupByDedupKeys<T>(items: T[], keysOf: (item: T) => Set<string>): T[][] {
  // Disjoint-set forest keyed on item index.
  const parent: number[] = items.map((_, i) => i);
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]];
      i = parent[i];
    }
    return i;
  };
  const union = (a: number, b: number) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent[ra] = rb;
  };

  // For each unique key, union all items that emit that key.
  const firstSeenIndexForKey = new Map<string, number>();
  items.forEach((item, idx) => {
    for (const k of keysOf(item)) {
      const prior = firstSeenIndexForKey.get(k);
      if (prior == null) firstSeenIndexForKey.set(k, idx);
      else union(prior, idx);
    }
  });

  // Collect by root.
  const byRoot = new Map<number, T[]>();
  items.forEach((item, idx) => {
    const root = find(idx);
    const list = byRoot.get(root) ?? [];
    list.push(item);
    byRoot.set(root, list);
  });
  return Array.from(byRoot.values());
}
