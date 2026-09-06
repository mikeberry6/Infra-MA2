# Receipt-backed ownership semantics — audit-only checkpoint

This release publishes a reproducible, read-only comparison of all **1,128 published companies**. Core ownership agrees when the exact approved canonical after-images are distinguished from their older, lossy display projections. It does **not** establish fund-link/attribution parity, authorize a full database seed, or complete the PortCo goal.

No production data, evaluated seed data, immutable overlay, attribution manifest, source-task state, bundle ledger, public interface or scorecard layout changes are included. The only change to the existing approved-seed implementation extracts its unchanged owner projection into a shared pure function. New audit code uses it to reproduce, not redefine, existing display output.

## Bound evidence and result

The pinned READ ONLY RepeatableRead snapshot was captured at **2026-09-06T04:57:28.391Z**. Canonical Vercel production was READY on Git-integrated protected main `c4fe14071d6a0a4d17f07c95165e742dbed1da62`, deployment `dpl_61hztPBNsctx2zamH3Hw7UVRYCze`, immutable host `infra-ma-2-1f72w5imt-mberry.vercel.app`.

The complete compared published ownership rows (including IDs, fund links and attribution metadata), selected pending-transaction fields, company identity/status fields and all 70 redirects are unchanged from the corresponding PR915 snapshot fields. No new legal ownership facts were inferred.

| Authority / population | Count | Scope |
| --- | ---: | --- |
| Latest receipt-backed canonical companies | 298 | 711 owner rows; exact proposals, approvals, receipts and after-images independently verified |
| Legacy-only companies | 829 | Existing seed-runner-style core matches production; not newly researched cap tables |
| Chicago scoped display binding | 1 | Exact PR918 after-image; preserves task345's ownership exception |
| Published companies | 1,128 | Unique seed/production name-country identities and unique production IDs |
| Active / realized | 1,116 / 12 | Recorded production status |
| Companies with pending transactions | 19 | Overlaps active/realized, not a separate additive population |
| Redirects | 70 | Full captured rows unchanged |

The semantic comparison covers owner organization, explicit-null legal vehicle, investment/exit year, stake, active flag and lifecycle state. It compares complete sorted owner tuples with multiplicity, not an unbound name match. Fund links and attribution fields are preserved in the snapshot but **not adjudicated** by this contract.

All 298 latest canonical images map to current COMPLETED source tasks and their exact apply evidence. The audit additionally binds all 315 evidence files from the 45 fresh seven-file deferred adjudications. Execution-manifest hash `e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07` and ledger hash `9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c` remain unchanged and idle.

## Why the display projections differ

Of the 298 rich canonical entries, 256 reproduce the current separate fund/vehicle projection and 42 reproduce the older combined-only shape preceding commit `f943b55f` (PR454). The retained historical source is hash-bound; unknown projection shapes fail closed.

The 73 rich companies with display differences include 106 explicit-null legal vehicles replaced by legacy fund/manager display fallbacks. Broad Reach Power has one additional non-null canonical vehicle description replaced by its older combined fund display. Terra-Gen and Skyway also encounter different global manager-name normalization. Chicago contributes one separately scoped MSIP/full-name display binding. These explain the 74 company representation differences without overwriting approved nulls or creating new organization aliases.

The existing full seed runner remains lossy. **Do not replay it to assert this contract.** The explicit result is `coreOwnershipParity: true`, `fundLinkAttributionParity: NOT_ADJUDICATED`, `fullSeedReplayParity: false`, and `completionAllowed: false`.

## Integrity and verification

- Audit SHA: `788e78084f594dbdbc7ae9ae7bc612f9fcb3972f3b0152056e8751c4599e4076`.
- Contract SHA: `43b50e961ee3c526d55512fa6a2ebd295d18fe21b33a208bb1f71a7612bc0c69`.
- Production snapshot SHA: `6c539eda0084faee743169dfff2cf29691d590f84a8b469f46804bb99aa6ec17`.
- Evaluated seed SHA: `d9cf4d477f5640c4f69b8e2b5ab499cb14a2050222c3af75d0a643f2c271523c`.

Local verification passed: **165 test files / 1,274 tests**, ordinary project typecheck, scoped ESLint and `git diff --check`. Offline seed validation reported zero errors and 54 existing date-format warnings. This does not claim that the separate historical scripts tsconfig passes. Six new tests independently reproduce the frozen contract and reject tampered/missing/duplicate receipts, changed dependencies, identity collisions, unapproved seed edits, production owner drift and duplicate or shadowed overlay lineage.

The one-off runner `scripts/portco-reconciliation/audit-owner-semantic-contract.ts` pins the permitted worktree, exact source/seed state, expected full deployment SHA and database target. It contains no production mutation path and writes evidence exclusively. The prepare output already exists; do not overwrite or rerun that phase. After protected merge, its `production-release` phase must recapture production and prove the exact same state, contract and dependencies on the canonical merge-SHA deployment. Then run the ordinary canonical smoke test. Until those checks pass this is a pre-release audit, not a production-verified release claim.

This PR also publishes the four retained PR918 post-release artifacts under `../chicago-seed-state-persistence/`; it does not repeat that repair.

## Remaining closeout

The 603 attribution-field comparison candidates across 155 companies (including 12 fund-link comparisons) still need chronology and protected-receipt review before any scoped correction. The superseded Pocahontas Parkway overlay still needs historical lineage documentation. Final reconciliation, exception/count publication and production verification remain required before completing the existing goal and deleting its heartbeat. All 496 source outcomes remain terminal: 343 completed, 31 excluded, 10 verified no-change, 71 superseded, 41 exact fresh deferrals and zero pending. Do not reopen tasks, repeat research or replay transactions.
