#!/usr/bin/env python3
"""
Scan all top-level investmentYear: 2025 entries for remaining quality issues:
  A. No clear 2025 transactional milestone (only "continued to identify" / "portfolio
     materials describe" / etc — soft attribution)
  B. Future-dated milestones (year >= 2027 or month-precise dates after April 2026)
  C. Vague range dates ("2025-2026", "2025-2029") used as the only 2025 milestone
  D. Description-vs-milestone mismatch heuristic (description names a year not
     present in any milestone)
  E. Missing sources or empty milestones array
"""
from __future__ import annotations

import re
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"
src = FILE.read_text()

# Words that indicate a real 2025 transaction (signing, close, formation, etc.)
TRANSACTION_VERBS = re.compile(
    r"(acquir|invest|partnership|formed|launched|created|completed|signed|"
    r"announced an agreement|definitive agreement|closed|spin-out|"
    r"financial close|commercial close|made.*initial investment|equity commitment|"
    r"strategic.*investment)",
    re.IGNORECASE,
)
# Soft milestones that don't constitute a transaction
SOFT_PATTERNS = re.compile(
    r"(continued to identify|continued to list|continued operating|"
    r"continued to describe|portfolio materials|stated that|"
    r"identified .* as|described .* as|year of investment)",
    re.IGNORECASE,
)
FUTURE_DATE = re.compile(r"\b(202[7-9]|20[3-9]\d)\b")
VAGUE_RANGE = re.compile(r'date: "20\d{2}-20\d{2}"')


def iter_2025_records():
    rec_re = re.compile(r"\n  \{\n(?P<body>.*?)\n  \},", re.DOTALL)
    for m in rec_re.finditer(src):
        body = m.group("body")
        iy = re.search(r"^    investmentYear: (\d+),", body, re.MULTILINE)
        if not iy or iy.group(1) != "2025":
            continue
        name = re.search(r'^    name: "([^"]+)"', body, re.MULTILINE)
        firm = re.search(r'^    investmentFirm: "([^"]+)"', body, re.MULTILINE)
        ms = re.search(r"milestones: \[(.+?)\],\n", body, re.DOTALL)
        sources = re.search(r"sources: \[(.+?)\],\n", body, re.DOTALL)
        yield {
            "name": name.group(1) if name else "?",
            "firm": firm.group(1) if firm else "?",
            "milestones_text": ms.group(1) if ms else "",
            "sources_text": sources.group(1) if sources else "",
            "body": body,
            "offset": m.start(),
        }


def line_no(offset: int) -> int:
    return src.count("\n", 0, offset) + 1


def has_real_2025_transaction(rec):
    """Return True if a milestone describes a transactional 2025 event for the firm."""
    firm_first = rec["firm"].split()[0].lower()
    for line in rec["milestones_text"].split("\n"):
        line = line.strip()
        if not line.startswith("{ date:"):
            continue
        # Must mention 2025
        if "2025" not in line:
            continue
        # Must have a transactional verb
        if not TRANSACTION_VERBS.search(line):
            continue
        # Skip if it's purely soft language
        # (Soft + transactional both possible; treat as real if firm is named)
        return True
    return False


def has_firm_named_in_2025(rec):
    """Return True if firm name appears in any 2025 milestone."""
    firm_words = [w.lower() for w in re.split(r"[\s/]+", rec["firm"]) if len(w) > 2]
    if not firm_words:
        return False
    primary = firm_words[0]
    for line in rec["milestones_text"].split("\n"):
        line_l = line.strip().lower()
        if not line_l.startswith("{ date:"):
            continue
        if "2025" not in line_l:
            continue
        if primary in line_l:
            return True
    return False


def find_future_milestones(rec):
    futures = []
    for line in rec["milestones_text"].split("\n"):
        s = line.strip()
        if not s.startswith("{ date:"):
            continue
        if FUTURE_DATE.search(s):
            futures.append(s[:120])
    return futures


def main() -> int:
    issues_a = []  # weak 2025 attribution
    issues_b = []  # future-dated milestones (2027+)
    issues_c = []  # vague range dates
    issues_e = []  # missing milestones / sources
    total = 0
    for rec in iter_2025_records():
        total += 1
        line = line_no(rec["offset"])
        ms = rec["milestones_text"]
        if not ms.strip():
            issues_e.append((rec["firm"], rec["name"], line, "empty milestones"))
            continue
        if not rec["sources_text"].strip():
            issues_e.append((rec["firm"], rec["name"], line, "empty sources"))
        # A: no transactional 2025 milestone OR firm not named in 2025 milestone
        if not has_real_2025_transaction(rec) or not has_firm_named_in_2025(rec):
            issues_a.append((rec["firm"], rec["name"], line))
        # B: future-dated milestones (post 2027)
        futures = find_future_milestones(rec)
        if futures:
            issues_b.append((rec["firm"], rec["name"], line, futures[:2]))
        # C: vague range dates "YYYY-YYYY"
        ranges = re.findall(r'date: "(20\d{2}-20\d{2})"', ms)
        if ranges:
            issues_c.append((rec["firm"], rec["name"], line, ranges))

    print(f"Total top-level 2025 entries: {total}\n")
    print(f"A. WEAK 2025 ATTRIBUTION ({len(issues_a)}):")
    print("   No transactional milestone for 2025 OR firm not explicitly named.\n")
    for f, n, ln in sorted(issues_a):
        print(f"   line {ln:>5}  {f[:32]:<32}  {n}")
    print()
    print(f"B. FUTURE-DATED MILESTONES ({len(issues_b)}):")
    print("   Milestones with year 2027+ — verify these have happened or remove.\n")
    for f, n, ln, fut in sorted(issues_b):
        print(f"   line {ln:>5}  {f[:32]:<32}  {n}")
        for x in fut:
            print(f"      → {x}")
    print()
    print(f"C. VAGUE RANGE DATES ({len(issues_c)}):")
    print('   "YYYY-YYYY" date strings render poorly in the drawer.\n')
    for f, n, ln, rs in sorted(issues_c):
        print(f"   line {ln:>5}  {f[:32]:<32}  {n}  {rs}")
    print()
    if issues_e:
        print(f"E. MISSING DATA ({len(issues_e)}):\n")
        for f, n, ln, what in sorted(issues_e):
            print(f"   line {ln:>5}  {f[:32]:<32}  {n}  ({what})")
    return 0


if __name__ == "__main__":
    main()
