#!/usr/bin/env python3
"""
Clean up two classes of weak milestone date strings in companies.ts:

  C. "YYYY-YYYY" range dates (e.g. "2025-2026") → use the start year only.
     These ranges are mostly filler "continued to operate" milestones and
     display poorly in the drawer's date column.

  B. Future-only dates (year >= 2027) → prefix the date with "Expected "
     so the drawer makes clear the event has not yet occurred.

This script is safe to re-run; both transforms are idempotent.
"""
from __future__ import annotations

import re
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"

# Match the date field of a milestone object on a single line.
# Group 1: date string contents.
DATE_FIELD = re.compile(r'(?<=date: ")([^"]+)(?=",)')


def transform(date: str) -> str:
    # C. range "YYYY-YYYY" → start year (only when both years are 4-digit)
    m = re.fullmatch(r"(20\d{2})-(20\d{2})", date)
    if m:
        return m.group(1)
    # B. forward-looking single year >= 2027 → "Expected YYYY"
    m = re.fullmatch(r"(20[2-9]\d)", date)
    if m:
        year = int(m.group(1))
        if year >= 2027:
            return f"Expected {year}"
    # B. "Mon YYYY" or "Mon DD, YYYY" with year >= 2027
    m = re.fullmatch(r"(\w+ )(\d{1,2}, )?(20\d{2})", date)
    if m and int(m.group(3)) >= 2027:
        if not date.startswith("Expected "):
            return f"Expected {date}"
    return date


def main() -> int:
    src = FILE.read_text()
    fixed_ranges = 0
    fixed_future = 0

    def repl(match: re.Match) -> str:
        nonlocal fixed_ranges, fixed_future
        original = match.group(0)
        new = transform(original)
        if new != original:
            if "-" in original and re.fullmatch(r"20\d{2}-20\d{2}", original):
                fixed_ranges += 1
            else:
                fixed_future += 1
        return new

    new_src = DATE_FIELD.sub(repl, src)
    FILE.write_text(new_src)
    print(f"Range dates collapsed (YYYY-YYYY → YYYY): {fixed_ranges}")
    print(f"Future dates labelled (Expected ...): {fixed_future}")
    return 0


if __name__ == "__main__":
    main()
