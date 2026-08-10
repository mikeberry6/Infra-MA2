# Weekly briefing activity audit — 2026-08-07

Status: **PUBLISHED UNDER A USER-AUTHORIZED WAIVER**

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

## Transparently outstanding human gates

| Gate | Current |
| --- | ---: |
| Current first approvals | 0 |
| First reviews still required | 404 |
| Evidence-backed exception records requiring independent second approval | 15 |
| Current second approvals | 0 |
| Unresolved scopes | 0 |

No human approvals were manufactured for this release. The manifest remains
`IN_REVIEW`, every first- and second-review field remains empty, the publication
approval remains `null`, and the final approved control remains unset. The user
explicitly authorized publication with those human-review and Outlook desktop
gates waived for this edition.

All record-level data gates pass. The remaining 421 findings are exactly 404
missing first approvals, 15 missing independent second approvals, the
unapproved manifest state, and the unset final control. No record is unresolved
and no source, ownership, actor, geography, duplicate, or totals inconsistency
remains.

The waiver at `user-authorized-publication-waiver.json` is a narrow,
hash-bound release authorization rather than a review attestation. It binds the
unchanged manifest, exact 421-finding allowlist, protected non-chart content,
and deterministic rendered email. Any record, total, issue-set, chart, or
non-chart change invalidates the waiver and fails closed.

The public August 7 email now byte-for-byte matches the deterministic preview.
Only the delimited YTD chart block changed; the approved-edition index advances
the default Weekly Briefing route through a `USER_AUTHORIZED_WAIVER` entry.
July 31 remains unchanged as the historical baseline.

The August 10 chart-presentation amendment keeps every classification, count,
and bar width unchanged. It moves the single legend beneath the region chart
and adds a compact `N Direct · N Portfolio` constituent label beneath every
bar, including explicit zero values. The amendment is hash-chained to the
previous publication waiver and records that Outlook desktop copy/paste and
send-to-self QA remain waived and were not performed.

Automated markup and in-app browser QA were rerun at 320px, 375px, 600px, and
desktop width. All 11 constituent-label rows remained within their bar cells,
the zero-value Portfolio label stayed visible, and the bottom legend stayed
within the chart container. The existing 320px full-email canvas behavior was
unchanged from the prior deterministic render; the amendment introduced no
additional horizontal overflow.

## Publication integrity

| Artifact | SHA-256 |
| --- | --- |
| Manifest canonical hash | `124a216beaa42516397269ef9e4cec81e1bcf75e63dc8adbe8986d8e23d3d268` |
| Rendered August 7 email | `59ca9ba91ad31ee093f29a0368ce7ad20f3040bd2408f045d42d5c6f3dffe68b` |
| Protected non-chart content | `9970916e829cda394f57126c723bd7ba76a8e5709f0b80a0a2488a9fa0d9767c` |
| Unchanged July 31 email | `17ae39249677e8f57db1038641cbb582357576ac6465b92bea2dc3f71c58388e` |

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
