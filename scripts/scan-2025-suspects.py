#!/usr/bin/env python3
"""
Scan companies.ts for 2025-tagged entries whose milestones suggest the
firm's actual investment happened earlier. Outputs a list of suspect
companies for manual review.

Heuristic: a company tagged investmentYear: 2025 is suspicious if any
milestone earlier than 2025 contains keywords like "acquired", "invested",
"completed", "formed", "launched", or "partnership" tied to the named
investment firm. Founding/IPO milestones are excluded — those are about
the company itself, not the firm.
"""
from __future__ import annotations

import re
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"

src = FILE.read_text()
text = src

INVEST_VERBS = re.compile(
    r"(acquir|invest|partnership|formed|launched|created|completed the sale|completed the acquisition|signed an agreement)",
    re.IGNORECASE,
)
FUND_KW = re.compile(
    r"(fund|partner|capital|infra|management|investments|brookfield|blackstone|kkr|apollo|argo|basalt|stonepeak|macquarie|cpp|cdpq|caisse|ares|adia|apg|actis|ancala|ara|arclight|cbre|cim|cvc|dif|digitalbridge|ecp|ember|encap|eqt|fengate|gcm|gic|gip|goldman|harbert|harrison|isq|i squared|ifm|igneo|infrared|jp morgan|jpmorgan|j.p. morgan|kimmeridge|manulife|meridiam|mubadala|northampton|northleaf|quinbrook|ridgewood|sandbrook|sdc|tallvine|temasek|tiger|tpg|vision ridge|searchlight|qic|antin|wafra|fund vii|fund viii)",
    re.IGNORECASE,
)


def iter_records():
    rec_re = re.compile(r"\n  \{\n(?P<body>.*?)\n  \},", re.DOTALL)
    for m in rec_re.finditer(text):
        body = m.group("body")
        # filter top-level investmentYear: 2025
        iy = re.search(r"^    investmentYear: (\d+),", body, re.MULTILINE)
        if not iy or iy.group(1) != "2025":
            continue
        name = re.search(r'^    name: "([^"]+)"', body, re.MULTILINE)
        firm = re.search(r'^    investmentFirm: "([^"]+)"', body, re.MULTILINE)
        # capture milestones array
        ms_match = re.search(r"milestones: \[(.+?)\],\n", body, re.DOTALL)
        milestones = ms_match.group(1) if ms_match else ""
        yield {
            "name": name.group(1) if name else "?",
            "firm": firm.group(1) if firm else "?",
            "milestones": milestones,
            "offset": m.start(),
        }


def line_no(offset: int) -> int:
    return src.count("\n", 0, offset) + 1


YEAR_RE = re.compile(r"\b(20[0-2][0-9])\b")


def find_pre_2025_invest_milestone(rec):
    """Return (year, line_text) of earliest pre-2025 milestone that mentions
    investment-style verbs and fund/firm keywords, else None."""
    candidates = []
    for line in rec["milestones"].split("\n"):
        line = line.strip()
        if not line.startswith("{ date:"):
            continue
        years = [int(y) for y in YEAR_RE.findall(line)]
        if not years:
            continue
        min_y = min(years)
        if min_y >= 2025:
            continue
        if "Founding" in line or "IPO" in line:
            continue
        if not INVEST_VERBS.search(line):
            continue
        if not FUND_KW.search(line):
            continue
        candidates.append((min_y, line))
    if not candidates:
        return None
    candidates.sort()
    return candidates[0]


def main() -> int:
    n_total = 0
    n_suspect = 0
    print(f"{'Firm':<35} {'Name':<55} Earliest  Milestone")
    print("-" * 120)
    for rec in iter_records():
        n_total += 1
        result = find_pre_2025_invest_milestone(rec)
        if result is None:
            continue
        n_suspect += 1
        y, line = result
        snippet = line[:90]
        print(f"{rec['firm'][:35]:<35} {rec['name'][:55]:<55} {y}      {snippet}")
    print("-" * 120)
    print(f"Total 2025 top-level entries: {n_total}; suspect entries: {n_suspect}")
    return 0


if __name__ == "__main__":
    main()
