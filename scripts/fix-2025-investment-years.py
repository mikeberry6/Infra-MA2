#!/usr/bin/env python3
"""
Apply confirmed investmentYear corrections for 2025-mistagged portfolio
companies in prisma/seed-data/companies.ts.

Each entry below is a confirmed correction where research shows the firm's
actual investment year is earlier than 2025. The 2025 events were
financings, refinancings, secondaries, or fund-level corporate actions —
not the original investment.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"

# (company_name, investment_firm, new_year)
CORRECTIONS = [
    ("Viridon", "Blackstone", 2023),
    ("Alberta Midland Rail Terminal", "CC&L", 2022),
    ("Armow Wind Farm", "CC&L", 2024),
    ("Grand Renewable Wind Farm", "CC&L", 2024),
    ("USA Rail Terminals", "CC&L", 2020),
    ("Equinix xScale U.S. JV", "CPP Investments", 2024),
    ("Braya Renewable Fuels", "ECP", 2023),
    ("Freeport Power Limited", "Fengate Asset Management", 2024),
    ("CarbonCount Holdings 1 LLC", "KKR", 2024),
    ("Port Arthur LNG", "KKR", 2023),
    ("Conrac Solutions", "Meridiam", 2023),
    ("Presidio Parkway", "Meridiam", 2011),
    ("EVPassport", "Northleaf", 2023),
    ("Cloverleaf Infrastructure", "Sandbrook", 2024),
    ("SLIC Network Solutions, Inc.", "SDC", 2022),
    ("CoreSite", "Stonepeak", 2022),
    ("Intrado", "Stonepeak", 2022),
    ("Maas Energy Works", "Stonepeak", 2022),
    ("Venture Global Calcasieu Pass", "Stonepeak", 2019),
    ("Xplore Inc.", "Stonepeak", 2020),
    ("Caturus", "Kimmeridge", 2024),
    ("Nassau Marine Terminal", "Ridgewood", 2020),
    ("JH Symphony Renewables, LLC", "Manulife", 2019),
]


def main() -> int:
    src = FILE.read_text()
    out = src
    fixed = 0
    failed = []
    for name, firm, new_year in CORRECTIONS:
        # Find the record block matching this name + firm + 2025 year
        pattern = re.compile(
            r'(    name: "' + re.escape(name) + r'",\n'
            r'    investmentFirm: "' + re.escape(firm) + r'",\n'
            r'(?:    [^\n]+\n)*?'
            r'    investmentYear: )2025(,)',
            re.MULTILINE,
        )
        new_out, n = pattern.subn(rf"\g<1>{new_year}\g<2>", out)
        if n != 1:
            failed.append((name, firm, n))
            continue
        out = new_out
        fixed += 1
    FILE.write_text(out)
    print(f"applied {fixed} corrections")
    for nm, fm, n in failed:
        print(f"FAILED ({n} matches): {fm} / {nm}")
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
