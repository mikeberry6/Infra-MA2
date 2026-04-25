#!/usr/bin/env python3
"""
Scan for entries whose investmentYear is no longer 2025, but whose description
still references "in 2025" or "2025" in a way that contradicts the corrected year.
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
        year = iy.group(1)
        if year == "2025":
            continue  # only check entries we may have corrected away from 2025
        nm = re.search(r'^    name: "([^"]+)"', body, re.MULTILINE)
        fm = re.search(r'^    investmentFirm: "([^"]+)"', body, re.MULTILINE)
        desc = re.search(r'^    description: "([^"]+)"', body, re.MULTILINE)
        if not desc:
            continue
        d = desc.group(1)
        # Look for description claims tying the firm to a 2025 investment
        firm = fm.group(1) if fm else ""
        firm_first = firm.split()[0] if firm else ""
        # Heuristic — description mentions "2025" together with an investment verb
        # near the firm's name
        patterns = [
            r"in 2025",
            r"2025 [a-z]+",
            r"[a-z]+ in 2025",
        ]
        if "2025" in d and firm_first.lower() in d.lower():
            # Check whether the 2025 reference is associated with the firm's investment
            d_low = d.lower()
            firm_low = firm_first.lower()
            window = 80
            for match in re.finditer(r"\b2025\b", d_low):
                start = max(0, match.start() - window)
                end = min(len(d_low), match.end() + window)
                context = d_low[start:end]
                if firm_low in context and re.search(
                    r"(acquir|invest|complet|formed|launched|partner|signed|stated.*became|backed)",
                    context,
                ):
                    issues.append((fm.group(1), nm.group(1), year, d_low[start:end]))
                    break
    print(f"Entries with description-vs-corrected-year mismatch: {len(issues)}\n")
    for f, n, yr, ctx in issues:
        print(f"  {f} | {n} (now {yr})")
        print(f"    context: ...{ctx}...")
    return 0


if __name__ == "__main__":
    main()
