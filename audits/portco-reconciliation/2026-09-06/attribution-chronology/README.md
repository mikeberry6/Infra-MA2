# Attribution chronology — verified history, not a repair authorization

This read-only checkpoint recovers the original production attribution receipt and reconciles all **46 successful attribution pipelines** to their exact manifest, approval, immutable receipt and surviving database revision payloads. It makes no production, seed, source-task, ledger or public-interface changes. The PortCo goal is not complete.

## What the history check resolved

The previous local inventory contained 45 receipts. The original 1,264-row apply from 2026-08-18 was missing from Git, but its exact receipt survives in successful [workflow run 32087303941](https://github.com/mikeberry6/Infra-MA2/actions/runs/32087303941), artifact 9307153117. The archive's downloaded SHA-256 equals GitHub's supplied digest, `4a0fe2ef97cc95ac052db2d7dd47a16889c275f56e22eda56d76d008a4447299`. The recovered receipt hash is `779802d490bd3b00c5470e8fee2bc87ae5b3f98a70fe9c3d08af4931be2686cf`. The original protected-main release and canonical-deployment proofs are retained alongside the exact receipt. **No transaction was replayed.**

The initial receipt covered 1,131 companies, while 1,088 corresponding revision records survive. This is fully explained by 44 historical company relocations through the already-verified canonical redirects, producing 28 merged revision groups. The existing merge implementation rehomes revision history and unions exact before/after arrays for equal proposal hashes. The audit reproduces that grouping and compares every original ownership-row payload, without ignoring missing rows, duplicate rows, approvers, timestamps, changed fields or pipeline identities. Reordering is permitted only because merged revision arrays need not preserve the original company ordering.

Across all 46 applies, **1,199 current revision records preserve 1,242 original company groups and 1,451 changed ownership-row payloads**. All pipeline counts, metadata, approvals and receipt fingerprints match. The snapshot retains 1,357 total relevant revisions; the additional 158 belong to other canonical PortCo changes and are not mislabeled as attribution revisions. Its 162 relevant audit events are retained for subsequent review.

## Current comparison scope

The pinned READ ONLY RepeatableRead capture at 2026-09-06T06:23:19Z observed canonical READY Git-integrated production on protected main `cba48dfc4c46af5f574cb87320a95bfb7641c4fe` (PR919), deployment `dpl_Ep88nnoLvAv1mSfXrhuZEjEBMmN7`. Published company ownership, pending transactions and all 70 redirects exactly reproduce the preceding semantic snapshot `6c539eda0084faee743169dfff2cf29691d590f84a8b469f46804bb99aa6ec17`.

The 603 field comparisons across 155 companies / 277 active owner rows remain diagnostic candidates:

- 144 candidate owner IDs occur in a verified historical attribution receipt; 121 exactly match their latest attribution after-image.
- The other 23 differ from their historical receipt only in the fund link. Every one of the 277 current fund links agrees with its latest receipt-backed canonical PortCo owner image. Do not restore an older fund link to force historical equality.
- 133 candidate owner IDs have no direct attribution receipt. This is not evidence of a missing apply: new canonical owner rows can originate in PortCo transactions, whose write path does not populate attribution metadata.
- 252 candidate seed records exactly match their latest retained seed-reconciliation upsert; 25 have no such upsert binding. These are provenance observations, not findings that the seed expectation is substantively correct.

All candidates explicitly remain `REVIEW_REQUIRED_NO_MUTATION_AUTHORIZED`. Historical metadata, seed chronology and current field authority still require adjudication. No scoped repair manifest is produced. The remaining Pocahontas obsolete-overlay documentation and final reconciliation/count/exception publication are also still required.

## Integrity and release boundary

Local verification passed: 166 test files / 1,282 tests, ordinary project typecheck, scoped ESLint, and offline seed validation (zero errors; 54 existing date-format warnings). Eight new tests reproduce the frozen history and reject missing/duplicate coverage, tampered approvals/receipts/revisions, missing rows, unauthorized relocation, cycles and multiplicity loss. This does not claim the separate historical scripts tsconfig passes.

Chronology report SHA: `0e9326e9e40914ce36ad75c444d8f44200e6774639a5f450e173e95ebbb36eac`. The report and capture bind exact source files, protected-main introduction commits, execution/ledger/seed hashes, core state and full history snapshot. Source outcomes remain 343 completed, 31 excluded, 10 verified no-change, 71 superseded, 41 freshly evidenced exact deferrals, zero pending. No bundle is active.

The one-off `audit-attribution-chronology.ts` prepare output is frozen and must not be overwritten. After protected merge, its `production-release` phase must prove the canonical exact merge SHA and unchanged snapshot/report/dependencies; then run the ordinary canonical smoke test. Until those post-release checks pass this directory is a prepared checkpoint, not a new production-verified release claim.

The archive and two extracted log files remain local, outside the intended commit. Published recovery files are only `apply-receipt.json`, `release-provenance-before-write.json`, `canonical-deployment-before-write.json`, and `recovery-provenance.json`. This release also publishes the three retained PR919 post-release verification files. It does not repeat PR919 or any earlier repair, run a full seed, infer ownership facts, or complete the goal.
