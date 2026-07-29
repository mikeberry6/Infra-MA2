# Company canonical cleanup review — 2026-07-28

## Scope and authorization

This review covers every one of the 21 company-name clusters detected across
all record statuses. The user authorized execution of issue 3, canonical
company cleanup. One immutable approval artifact records the resulting
decisions:

- Approval:
  `audits/approvals/company-canonical-cleanup-2026-07-28.json`
- SHA-256:
  `bc4b651ecff5117eff71adbf9aff2951db934a46e09b0b59d5b05054eb978fc8`
- Decisions: 18 `MERGE`, 3 `KEEP_SEPARATE`
- Candidate rows: 43
- Retired rows after application: 19

The approval becomes invalid if any reviewed company or attached ownership,
milestone, management, citation, news-mention, or redirect evidence changes.

## Reviewed decisions

| # | Decision | Canonical outcome |
|---:|---|---|
| 1 | Merge | Alpha Generation, LLC |
| 2 | Merge | American Student Transportation Partners (ASTP) |
| 3 | Merge | Boldyn Networks |
| 4 | Merge | Cleco Corporate Holdings LLC |
| 5 | Merge | Coastal GasLink Pipeline; use the completed 2020 KKR ownership date |
| 6 | Merge | Convergent Energy and Power; United States / Canada |
| 7 | Merge | CoolCo |
| 8 | Merge | Direct ChassisLink, Inc. (DCLI) |
| 9 | Merge | Extenet (formerly ExteNet Systems) |
| 10 | Merge | GCT Global Container Terminals Inc.; current country Canada |
| 11 | Merge | Gulf Coast Express Pipeline LLC (GCX); use the sourced 2025 ArcLight date |
| 12 | Keep separate | JW Water Holdings and Robson Utilities Portfolio |
| 13 | Merge | Landmark Dividend LLC; founding year corrected to 2010 |
| 14 | Merge | Luminace |
| 15 | Merge | Northview Energy; preserve the complete three-owner structure |
| 16 | Merge | Pattern Energy Group LP (Pattern Energy) |
| 17 | Merge | Pearl/Ruby Solar Portfolio |
| 18 | Keep separate | Puget Energy holding company and Puget Sound Energy utility |
| 19 | Merge | Skyservice US; remove the contradicted 2019 standalone-founding milestone |
| 20 | Merge | Transportation Equipment Network |
| 21 | Keep separate | MedCraft and Montecito medical outpatient portfolios |

The approval JSON contains the exact candidate IDs, reviewed scalar changes,
explicit relation deletions, rationale, and source URLs for each row above.

## Validation result

The additive migration and complete cleanup were tested on isolated Neon
branch `br-little-lab-am0bmh1s`.

- First apply: 18 merges and 3 keep-separate normalizations.
- Immediate replay: no writes; all 21 decisions recognized as already applied.
- Company count: 1,191 before; 1,172 after.
- Remaining heuristic duplicate clusters: 0.
- Redirects created: 19.
- Cleanup audit events created: 21.
- A sampled retired Coastal GasLink ID resolves to the reviewed canonical
  `Coastal GasLink Pipeline` record.

Production was not modified during validation.

## Safety properties

- The exact approval-file hash is the single approval authority.
- `--apply`, exact database host/name matching, an explicitly forbidden host,
  and `TARGET_DATABASE` are still required.
- All decisions and relation plans are computed before the first write.
- The cleanup runs in one serializable transaction.
- Unreviewed material relation collisions fail the entire transaction.
- Automatic deletion is limited to materially identical relation rows.
- Retired IDs receive permanent one-hop redirects before their records are
  removed.
- Every decision creates a hash-bound audit event.
- Replays are accepted only when redirects, reviewed updates, deletions, and
  audit evidence all match.
