# Weekly briefing activity audit — 2026-08-07

Status: **IN REVIEW — PUBLICATION BLOCKED**

## Frozen controls

| Measure | Count |
| --- | ---: |
| Candidate seed records | 403 |
| Archived issue files | 25 |
| Archive card appearances | 335 |
| Unique archive-mapped transactions | 333 |
| Seed-only candidates | 70 |
| Read-only production rows | 352 |
| Published August 7 control | 393 |
| Corrected carry-forward hypothesis | 398 |
| Evidence-derived legal transactions | 402 |
| Direct fund activity | 285 |
| Portfolio-company activity | 117 |

The 403 candidate rows were a universe to adjudicate, not a target total. Two
repeated announcements merge into earlier transactions, while
`INF-2026-077` contains two legally distinct transactions and therefore emits
two suffixed review records. The resulting evidence-derived control is 402.

## Current review gates

| Gate | Current |
| --- | ---: |
| Current first approvals | 0 |
| First reviews still required | 404 |
| Evidence-backed exception records requiring independent second approval | 15 |
| Current second approvals | 0 |
| Unresolved scopes | 0 |

No human approvals are manufactured by this workflow. One evidence-backed
first review is required for every candidate. Transaction categories are
research prompts only; a second reviewer is required solely for verified
conflicting transaction facts, conflicting acting-entity evidence, uncertain
ownership timing, actual mixed fund/operating-company participation, or bundled
legally distinct transactions.

All record-level data gates now pass. The remaining 421 fail-closed findings
are exactly 404 missing first approvals, 15 missing independent second
approvals, the unapproved manifest state, and the unset final control. No
record is unresolved and no source, ownership, actor, geography, duplicate, or
totals inconsistency remains.

The deterministic preview at `preview/2026-08-07.html` changes only the YTD
chart block. The public August 7 email and approved-edition index remain
unchanged until the named human reviews and Outlook desktop QA are complete.

## Evidence-derived stacked-chart controls

| Sector | Direct | Portfolio-company | Total |
| --- | ---: | ---: | ---: |
| Power & ET | 100 | 56 | 156 |
| Transportation | 53 | 22 | 75 |
| Digital | 53 | 20 | 73 |
| Utilities | 28 | 10 | 38 |
| Social Infra | 32 | 6 | 38 |
| Midstream | 19 | 3 | 22 |

| Region | Direct | Portfolio-company | Total |
| --- | ---: | ---: | ---: |
| North America | 115 | 52 | 167 |
| Europe | 110 | 47 | 157 |
| Asia-Pacific | 44 | 16 | 60 |
| Latin America | 11 | 2 | 13 |
| Middle East & Africa | 5 | 0 | 5 |

## Known geography corrections

- INF-2026-189 — Saavi Energía & Grupo México Power Assets: Latin America → North America (Mexico)
- WB-2026-06-27-009 — Integmar Marine Technologies: North America → Europe (Türkiye)
- WB-2026-07-24-009 — Uluğ Enerji: North America → Europe (Türkiye)
- WB-2026-07-31-006 — Múlavirkjun: North America → Europe (Iceland)
- WB-2026-07-31-011 — Greenergy Data Centers: North America → Europe (Estonia)
- WB-2026-07-31-016 — Kuwait Oil Pipeline Network: North America → Middle East & Africa (Kuwait)
- WB-2026-08-07-005 — Bioforce: North America → Europe (Estonia)
- WB-2026-08-07-006 — Cella: North America → Asia-Pacific (Indonesia)

## Duplicate archive appearances

- INF-2026-107 — Maaselänkangas Onshore Wind Farm: EMAIL-2026-02-28-008, EMAIL-2026-03-07-008
- INF-2026-197 — Axius Water: EMAIL-2026-04-25-009, EMAIL-2026-05-02-010
