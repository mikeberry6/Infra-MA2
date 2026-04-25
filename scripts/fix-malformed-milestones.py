#!/usr/bin/env python3
"""
One-shot transform to fix malformed milestone entries in prisma/seed-data/companies.ts.

The bug: many milestone entries were generated with date and event fields containing
the same string of form "YYYY-MM[-DD]: <sentence>". Example:
  { date: "2024-10: Actis completed its combination with General Atlantic.",
    event: "2024-10: Actis completed its combination with General Atlantic.",
    category: "Other" }

Fix: split into proper date + event:
  { date: "Oct 2024",
    event: "Actis completed its combination with General Atlantic.",
    category: "Other" }

Only lines where date and event are exactly equal AND start with the YYYY-MM[-DD]:
prefix are touched. Everything else is left as-is. This is a deterministic mechanical
transform — no factual claims change.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

TARGET = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"

MONTHS = {
    "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
    "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
    "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
}

# Match a single-line milestone object with malformed date/event.
# Two flavours:
#   (a) "YYYY-MM[-DD]: SENTENCE"  — month (and optional day) prefix
#   (b) "YYYY: SENTENCE"           — year-only prefix
PATTERN_YMD = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<dyear>\d{4})-(?P<dmonth>\d{2})(?:-(?P<dday>\d{2}))?: (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<eyear>\d{4})-(?P<emonth>\d{2})(?:-(?P<eday>\d{2}))?: (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)

PATTERN_Y = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<dyear>\d{4}): (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<eyear>\d{4}): (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)

# Pattern (e): "YYYY-YYYY: SENTENCE" — year range prefix
PATTERN_YEAR_RANGE = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<drange>\d{4}-\d{4}): (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<erange>\d{4}-\d{4}): (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)

# Pattern (f): full-name month + year, e.g. "January 2022: SENTENCE"
FULL_MONTHS = "(?:January|February|March|April|May|June|July|August|September|October|November|December)"
FULL_TO_SHORT = {
    "January": "Jan", "February": "Feb", "March": "Mar", "April": "Apr",
    "May": "May", "June": "Jun", "July": "Jul", "August": "Aug",
    "September": "Sep", "October": "Oct", "November": "Nov", "December": "Dec",
}
PATTERN_FULL_MONTH = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<dmonth>' + FULL_MONTHS + r') (?P<dyear>\d{4}): (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<emonth>' + FULL_MONTHS + r') (?P<eyear>\d{4}): (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)

# Pattern (g): decade prefix, e.g. "2010s: SENTENCE"
PATTERN_DECADE = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<ddec>\d{4}s): (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<edec>\d{4}s): (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)

# Pattern (c): "Mon YYYY: SENTENCE" — month name + year prefix
MONTH_NAMES = "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)"
PATTERN_MONTH_YEAR = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<dprefix>' + MONTH_NAMES + r' \d{4}): (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<eprefix>' + MONTH_NAMES + r' \d{4}): (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)

# Pattern (d): "Mon DD[,] YYYY: SENTENCE" — month name + day + year prefix
PATTERN_MONTH_DAY_YEAR = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<dprefix>' + MONTH_NAMES + r' \d{1,2},? \d{4}): (?P<sentence_a>[^"]+)",\s*'
    r'event:\s*"(?P<eprefix>' + MONTH_NAMES + r' \d{1,2},? \d{4}): (?P<sentence_b>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)


def transform_line(line: str) -> tuple[str, bool]:
    m = PATTERN_YMD.match(line)
    if m:
        if (m["dyear"], m["dmonth"], m["dday"]) != (m["eyear"], m["emonth"], m["eday"]):
            return line, False
        if m["sentence_a"] != m["sentence_b"]:
            return line, False
        year = m["dyear"]
        month = MONTHS[m["dmonth"]]
        day = m["dday"]
        new_date = f"{month} {int(day)}, {year}" if day else f"{month} {year}"
        sentence = m["sentence_a"]
        return (
            f'{m["indent"]}{{ date: "{new_date}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    m = PATTERN_Y.match(line)
    if m:
        if m["dyear"] != m["eyear"] or m["sentence_a"] != m["sentence_b"]:
            return line, False
        sentence = m["sentence_a"]
        return (
            f'{m["indent"]}{{ date: "{m["dyear"]}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    m = PATTERN_MONTH_YEAR.match(line)
    if m:
        if m["dprefix"] != m["eprefix"] or m["sentence_a"] != m["sentence_b"]:
            return line, False
        sentence = m["sentence_a"]
        return (
            f'{m["indent"]}{{ date: "{m["dprefix"]}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    m = PATTERN_MONTH_DAY_YEAR.match(line)
    if m:
        if m["dprefix"] != m["eprefix"] or m["sentence_a"] != m["sentence_b"]:
            return line, False
        sentence = m["sentence_a"]
        # Normalise prefix: ensure a comma between day and year ("Apr 16 2025" -> "Apr 16, 2025")
        prefix = re.sub(r"^(\w+) (\d{1,2}) (\d{4})$", r"\1 \2, \3", m["dprefix"])
        return (
            f'{m["indent"]}{{ date: "{prefix}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    m = PATTERN_YEAR_RANGE.match(line)
    if m:
        if m["drange"] != m["erange"] or m["sentence_a"] != m["sentence_b"]:
            return line, False
        sentence = m["sentence_a"]
        return (
            f'{m["indent"]}{{ date: "{m["drange"]}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    m = PATTERN_FULL_MONTH.match(line)
    if m:
        if m["dmonth"] != m["emonth"] or m["dyear"] != m["eyear"] or m["sentence_a"] != m["sentence_b"]:
            return line, False
        short = FULL_TO_SHORT[m["dmonth"]]
        sentence = m["sentence_a"]
        return (
            f'{m["indent"]}{{ date: "{short} {m["dyear"]}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    m = PATTERN_DECADE.match(line)
    if m:
        if m["ddec"] != m["edec"] or m["sentence_a"] != m["sentence_b"]:
            return line, False
        sentence = m["sentence_a"]
        return (
            f'{m["indent"]}{{ date: "{m["ddec"]}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    # Fallback: any malformed milestone where date == event and both contain
    # "PREFIX: SENTENCE". Conservative — only triggers if the strings are
    # exactly identical, so factual content cannot be lost.
    m = PATTERN_FALLBACK.match(line)
    if m:
        if m["da"] != m["db"] or m["sa"] != m["sb"]:
            return line, False
        prefix = m["da"]
        # Skip if prefix is suspiciously long (>40 chars) — likely a real
        # narrative event with an embedded colon, not a date prefix.
        if len(prefix) > 40 or len(prefix) < 2:
            return line, False
        # Skip if prefix doesn't contain a digit — most date prefixes do.
        # Allow exceptions for "Pre-YYYY"-style prefixes which already match.
        if not any(c.isdigit() for c in prefix):
            return line, False
        sentence = m["sa"]
        return (
            f'{m["indent"]}{{ date: "{prefix}", '
            f'event: "{sentence}", category: "{m["cat"]}" }},\n',
            True,
        )
    return line, False


PATTERN_FALLBACK = re.compile(
    r'^(?P<indent>\s*)\{\s*'
    r'date:\s*"(?P<da>[^":]+): (?P<sa>[^"]+)",\s*'
    r'event:\s*"(?P<db>[^":]+): (?P<sb>[^"]+)",\s*'
    r'category:\s*"(?P<cat>[^"]+)"\s*\},\s*$'
)


def main() -> int:
    src = TARGET.read_text(encoding="utf-8")
    out_lines: list[str] = []
    fixed = 0
    for raw in src.splitlines(keepends=True):
        new_line, did = transform_line(raw)
        out_lines.append(new_line)
        if did:
            fixed += 1
    TARGET.write_text("".join(out_lines), encoding="utf-8")
    print(f"fixed {fixed} milestone lines")
    return 0


if __name__ == "__main__":
    sys.exit(main())
