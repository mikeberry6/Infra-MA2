#!/usr/bin/env python3
"""Dump full record for each 2025-tagged suspect for manual review."""
from __future__ import annotations

import re
import sys
from pathlib import Path

FILE = Path(__file__).resolve().parent.parent / "prisma" / "seed-data" / "companies.ts"
src = FILE.read_text()

INVEST_VERBS = re.compile(
    r"(acquir|invest|partnership|formed|launched|created|completed the sale|completed the acquisition|signed an agreement)",
    re.IGNORECASE,
)
FUND_KW = re.compile(
    r"(fund|partner|capital|infra|management|investments|brookfield|blackstone|kkr|apollo|argo|basalt|stonepeak|macquarie|cpp|cdpq|caisse|ares|adia|apg|actis|ancala|ara|arclight|cbre|cim|cvc|dif|digitalbridge|ecp|ember|encap|eqt|fengate|gcm|gic|gip|goldman|harbert|harrison|isq|i squared|ifm|igneo|infrared|jp morgan|jpmorgan|j.p. morgan|kimmeridge|manulife|meridiam|mubadala|northampton|northleaf|quinbrook|ridgewood|sandbrook|sdc|tallvine|temasek|tiger|tpg|vision ridge|searchlight|qic|antin|wafra|fund vii|fund viii)",
    re.IGNORECASE,
)
YEAR_RE = re.compile(r"\b(20[0-2][0-9])\b")

names = sys.argv[1:]
rec_re = re.compile(r"\n  \{\n(?P<body>.*?)\n  \},", re.DOTALL)
for m in rec_re.finditer(src):
    body = m.group("body")
    iy = re.search(r"^    investmentYear: (\d+),", body, re.MULTILINE)
    if not iy or iy.group(1) != "2025":
        continue
    nm = re.search(r'^    name: "([^"]+)"', body, re.MULTILINE)
    fm = re.search(r'^    investmentFirm: "([^"]+)"', body, re.MULTILINE)
    if names and not any(n.lower() in nm.group(1).lower() for n in names):
        continue
    ms = re.search(r"milestones: \[(.+?)\],\n", body, re.DOTALL)
    if not ms:
        continue
    print(f"\n=== {fm.group(1)} | {nm.group(1)} ===")
    for line in ms.group(1).split("\n"):
        s = line.strip()
        if s.startswith("{ date:"):
            print(f"  {s}")
