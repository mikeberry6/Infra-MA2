#!/usr/bin/env python3
"""
For each entry whose investmentYear is NOT 2025 but whose description mentions
a 2025 event tied to the named investment firm, surface the conflict so the
description text can be rewritten.

Stricter than scan-description-mismatch.py: looks for specific phrases like
"<firm>'s acquisition", "<firm> acquired ... in 2025", "<firm>'s 2025
investment", which are the patterns that would directly contradict the
corrected investmentYear in the drawer's "Investment Date" row.
"""
from __future__ import annotations

import re
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"
src = FILE.read_text()

rec_re = re.compile(r"\n  \{\n(?P<body>.*?)\n  \},", re.DOTALL)


def main() -> int:
    issues = []
    for m in rec_re.finditer(src):
        body = m.group("body")
        iy = re.search(r"^    investmentYear: (\d+),", body, re.MULTILINE)
        if not iy:
            continue
        year = int(iy.group(1))
        if year >= 2025:
            continue  # only check entries we may have corrected away from 2025
        nm = re.search(r'^    name: "([^"]+)"', body, re.MULTILINE)
        fm = re.search(r'^    investmentFirm: "([^"]+)"', body, re.MULTILINE)
        desc = re.search(r'^    description: "([^"]+)"', body, re.MULTILINE)
        if not desc or not fm:
            continue
        d = desc.group(1)
        firm = fm.group(1)
        firm_first = firm.split()[0]
        # Specific conflict patterns
        # 1. "in 2025" near firm name + investment verb
        # 2. "<firm>'s 2025" or "<firm> ... 2025 acquisition"
        firm_pat = re.escape(firm_first)
        patterns = [
            rf"{firm_pat}[^.]{{0,80}}\b(acquir|invest|partner|signed|committed|backed|completed|formed|launched)[^.]{{0,80}}\b2025\b",
            rf"\b2025\b[^.]{{0,80}}{firm_pat}[^.]{{0,80}}(acquir|invest|partner|signed)",
            rf"{firm_pat}[^.]{{0,30}}\b(in|since)\b[^.]{{0,15}}\b2025\b",
        ]
        match_text = None
        for p in patterns:
            m_match = re.search(p, d, re.IGNORECASE)
            if m_match:
                match_text = m_match.group(0)
                break
        if match_text:
            issues.append((firm, nm.group(1), year, match_text))

    print(f"Direct description conflicts: {len(issues)}\n")
    for f, n, yr, txt in issues:
        print(f"  {f} | {n} (now {yr})")
        print(f"    \"...{txt[:140]}...\"")
        print()
    return 0


if __name__ == "__main__":
    main()
