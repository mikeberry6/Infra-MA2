/**
 * Pure parser for the "Revised Current Owner(s)" prose column in the
 * Portfolio_High_Conviction_Owner_Changes spreadsheet. Extracted so we can
 * unit-test the parsing rules in isolation, without needing a live DB.
 *
 * Returns the candidate firm names (best-effort) and a list of fragments
 * that were flagged for human review. Conservative by design: when a
 * fragment matches a project-SPV / public-counterparty / non-equity
 * pattern, the whole row gets flagged rather than mis-creating an
 * Organization.
 */

// Patterns that mean "this fragment is noise" — drop the fragment but
// continue with siblings. Word-boundary anchored so substrings inside firm
// names (e.g. "Asset Management" inside "Brookfield Asset Management
// minority investor") don't trigger false matches.
const NOISE_PATTERNS: RegExp[] = [
  /^management minority\b/i,            // "management minority" only as a standalone fragment
  /\bmanagement not fully disclosed\b/i,
  /\bmanagement\/founder\b/i,
  /\bfounder shareholders\b/i,
  /\bpublic shareholders\b/i,
  /\blegacy concession shareholders\b/i,
  /\bground-lease interest\b/i,
  /\bground-lease tenant\b/i,
  /\btenant\/operator\b/i,
  /\boperator\/manager\b/i,
  /\bpreferred-equity investor\b/i,
  /\bpreferred equity\b/i,
  /\bpreferred-equity\b/i,
  /\bredeemed in full\b/i,
  /^no seller\b/i,
  /\bno sourced seller\b/i,
  /\bdepending on tranche\b/i,
  /\bexpected to be\b/i,
  /\bindirect exposure\b/i,
  /\bevidence appears to be financing\b/i,
];

// Patterns that mean the WHOLE prose is project-level / non-equity-firm —
// flag and don't try to parse out firms from it.
const PROJECT_PATTERNS = [
  /-led p3\/project/i,
  /-led p3 \/project/i,
  /\bp3\/project company\b/i,
  /\bppp project company\b/i,
  /project company with [A-Z]/,                 // "with Clackamas County as public..."
];

// Lead-phrase strips
const NOISE_LEAD_PHRASES: RegExp[] = [
  /^pending /i,
  /^approximately /i,
  /^retained /i,
  /^the /i,
  /^where /i,
];

// Token strips applied to fragment after splitting. Order matters — earlier
// patterns run first.
const SUFFIX_STRIPS: Array<[RegExp, string]> = [
  [/-managed funds?$/i, ""],            // "Northleaf-managed funds" → "Northleaf"
  [/-managed fund\(s\)$/i, ""],
  [/-owned\b.*$/i, ""],                  // "Stonepeak-owned Air Transport..." → "Stonepeak"
  [/-managed\b.*$/i, ""],                // "Apollo-managed funds agreed to..." → "Apollo"
  [/\s+\(majority\)$/i, ""],
  [/\s+\(minority\)$/i, ""],
  [/\s+\d+(\.\d+)?\s*%.*$/, ""],         // strip "60%" and anything after
  [/\s+(majority|minority)\s+(owners?|shareholders?|interest|stake).*$/i, ""],
  [/\s+managed\s+fund\(s\).*$/i, ""],
  [/\s+managed\s+funds?$/i, ""],
  [/\s+limited\s+partnership.*$/i, ""],
  [/\s+\(.*\)$/, ""],                    // strip any trailing parenthetical
  [/\s+owns\s+\d+%.*$/i, ""],            // "Williams Companies owns 100%..."
  [/\s+after\s+buying\b.*$/i, ""],
  [/\s+sold\s+.*$/i, ""],
  [/\s+is\s+expected\s+to\s+be\b.*$/i, ""],
  [/\s+through\s+.*$/i, ""],             // "Venture Global through Calcasieu Pass project..."
  [/\s+is the global\b.*$/i, ""],        // "Ada Infrastructure is the global data-center platform..."
  [/\s+is\s+the\s+\w+(\s+\w+)*\s+(platform|company)\b.*$/i, ""],
  [/\s+retained$/i, ""],                 // "Shell retained" → "Shell" (after % was stripped)
  [/\s+combined$/i, ""],                 // "65% combined" — % stripped first, leaves "combined"
  [/\s+consortium$/i, ""],
  [/\s+(majority|minority|controlling)\s+(owner|investor|shareholder|interest)s?$/i, ""],
  [/\s+(majority|minority|controlling)$/i, ""],   // "Alphabet minority" → "Alphabet"
  [/\s+Management\s+funds?$/i, ""],     // "Ember Infrastructure Management funds" → "Ember Infrastructure"
  [/\s+managed\s+fund\s+preferred-equity\s+investor$/i, ""],
];

// Tokens that are pure descriptors — drop entire fragment if equal
const PURE_DESCRIPTORS = new Set([
  "management",
  "minority",
  "majority",
  "client",
  "operator",
  "tenant",
  "operator/manager",
  "public shareholders",
  "shareholders",
  "consortium",
  "joint venture",
]);

export interface ParsedOwners {
  firms: string[];
  flagged: string[];
  notes: string[];
}

export function parseOwners(prose: string): ParsedOwners {
  if (!prose) return { firms: [], flagged: [], notes: ["empty prose"] };

  const flagged: string[] = [];
  const notes: string[] = [];

  // Project / SPV / government — flag the whole prose
  for (const pat of PROJECT_PATTERNS) {
    if (pat.test(prose)) {
      flagged.push(prose);
      notes.push(`matches project-level pattern ${pat}`);
      return { firms: [], flagged, notes };
    }
  }

  // Split on commas, semicolons, and " and ". Then for each fragment, split
  // again on slash separators that are clearly between firm names ("X/Y" or
  // "X / Y"), but not slashes embedded in a firm name (rare — handled by the
  // length/case heuristic in the inner loop).
  const fragments = prose
    .split(/[,;]+|\s+\band\b\s+/i)
    .flatMap((s) => splitOnSlash(s.trim()))
    .map((s) => s.trim())
    .filter(Boolean);

  const firms: string[] = [];
  const seen = new Set<string>();

  for (let frag of fragments) {
    // Hard-noise drop
    if (NOISE_PATTERNS.some((pat) => pat.test(frag))) {
      flagged.push(frag);
      continue;
    }

    // Strip lead phrases
    for (const lead of NOISE_LEAD_PHRASES) {
      frag = frag.replace(lead, "").trim();
    }
    if (!frag) continue;

    // Strip suffixes / quantifiers
    for (const [pat, repl] of SUFFIX_STRIPS) {
      frag = frag.replace(pat, repl).trim();
    }

    if (frag.length < 3 || !/[A-Za-z]/.test(frag)) continue;

    if (PURE_DESCRIPTORS.has(frag.toLowerCase())) continue;

    const cleaned = frag.replace(/\s+/g, " ").trim();
    const key = cleaned.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    firms.push(cleaned);
  }

  return { firms, flagged, notes };
}

/**
 * Split a fragment on " / " or "/" if both sides look like firm names.
 * Avoids splitting things like "Williams-operated Saber Midstream assets"
 * or "credit/debt" by requiring both sides to start with an uppercase letter
 * and to be ≥ 2 characters.
 */
function splitOnSlash(s: string): string[] {
  // Try " / " first (most common form in this dataset)
  if (s.includes(" / ")) {
    const parts = s.split(" / ");
    if (parts.every((p) => /^[A-Z]/.test(p.trim()))) return parts;
  }
  // Then bare "/"
  const parts = s.split("/");
  if (parts.length === 1) return parts;
  // Only split if every part looks firm-like
  if (parts.every((p) => /^\s*[A-Z]/.test(p) && p.trim().length >= 2)) {
    return parts;
  }
  return [s];
}

/**
 * Best-effort stake extraction. Looks in a 60-char window around `firmName`
 * in `prose` for a "X%" or "majority"/"minority" annotation. Returns null
 * if nothing obvious.
 */
export function stakeFromProse(prose: string, firmName: string): string | null {
  const lower = prose.toLowerCase();
  const firmLower = firmName.toLowerCase();
  const idx = lower.indexOf(firmLower);
  if (idx < 0) return null;
  // Forward-looking window only: a stake annotation always follows the firm
  // name in this dataset's prose ("InfraRed managed funds 60%", not "60%
  // InfraRed"). Windowing backward picks up the neighbor's stake. Cut at a
  // semicolon or " and " so the window can't bleed into the next firm.
  const tail = prose.slice(idx + firmName.length);
  const cutAt = tail.search(/[;]|\s+\band\b\s+/i);
  const window = cutAt < 0 ? tail : tail.slice(0, cutAt);
  const pct = /(\d+(\.\d+)?\s*%)/.exec(window);
  if (pct) return pct[1].replace(/\s+/g, "");
  if (/\bmajority\b/i.test(window)) return "majority";
  if (/\bminority\b/i.test(window)) return "minority";
  return null;
}
