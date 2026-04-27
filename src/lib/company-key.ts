// Single source of truth for company-name canonicalization. Used to detect
// duplicate Company rows whose `name` differs only by entity suffix
// ("LLC", "Inc"), parenthetical alias ("(ASTP)"), punctuation, or casing.
//
// The view layer dedupes by `(canonicalCompanyKey(name), country)` so the UI
// shows one row per real company; the DB merge script uses the same key so a
// one-shot cleanup catches the same clusters.
//
// Conservative by design: keys never reach across different leading words
// (e.g. "Student Transportation Inc." vs "Landmark Student Transportation"
// stay distinct), so legitimately different companies never collapse.

const ENTITY_SUFFIXES = [
  "llc", "l l c", "inc", "incorporated", "ltd", "limited",
  "corporation", "corp", "co", "company", "holdings", "holding",
  "group", "partners", "lp", "lllp", "plc", "ag", "sa", "sas",
  "spa", "nv", "bv", "gmbh", "kk",
];
const SUFFIX_RE = new RegExp(`\\s+(?:${ENTITY_SUFFIXES.join("|")})$`);

export function canonicalCompanyKey(name: string): string {
  let n = name.toLowerCase().trim();
  // Strip parenthetical aliases & "(via X)" subsidiary tags FIRST so the
  // contents don't survive punctuation removal as bare tokens.
  n = n.replace(/\s*\([^)]*\)\s*/g, " ");
  // Replace ampersands with " and " for consistent matching.
  n = n.replace(/\s*&\s*/g, " and ");
  // Strip punctuation entirely.
  n = n.replace(/[,.()'"\u2019\-_/]/g, " ");
  // Collapse whitespace.
  n = n.replace(/\s+/g, " ").trim();
  // Strip a leading "the".
  n = n.replace(/^the\s+/, "").trim();
  // Iteratively strip entity suffixes until none remain.
  let changed = true;
  while (changed) {
    changed = false;
    if (SUFFIX_RE.test(n)) {
      n = n.replace(SUFFIX_RE, "").trim();
      changed = true;
    }
  }
  return n;
}

// Pick the most user-friendly display name from a set of variants that share
// a canonical key. Preference: the variant with the most non-empty tokens
// (so "ALLO Communications, LLC" beats "ALLO Communications"); ties go to the
// longest string; final tiebreak is the first one seen (stable).
export function preferredDisplayName(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return [...names].sort((a, b) => {
    const tokensA = a.split(/\s+/).filter(Boolean).length;
    const tokensB = b.split(/\s+/).filter(Boolean).length;
    if (tokensA !== tokensB) return tokensB - tokensA;
    return b.length - a.length;
  })[0];
}
