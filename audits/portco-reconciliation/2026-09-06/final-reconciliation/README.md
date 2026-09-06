# PortCo closeout reconciliation — not yet complete

This is an audit-only checkpoint. All 496 source tasks are terminal, and all 45 original deferrals have fresh, hash-verified adjudications. Final seed/production parity has **not** passed, so the durable goal and heartbeat must remain open. No database, seed, source-manifest, ledger, public-interface, or scorecard changes were made by this checkpoint.

## Verified release and counts

The final deferred research batch was published by [PR #914](https://github.com/mikeberry6/Infra-MA2/pull/914), merged as `d114c0e3f6ee873f677934300ff59ed46b00211a`. Both PR CI `34004678170` and main CI `34004776925` passed. Canonical production was READY at `dpl_FQe6XL6uJi3vrfEmePr7MKJMNdFC`, immutable host `infra-ma-2-alq8sk042-mberry.vercel.app`. Its Git-integrated build log explicitly cloned main `d114c0e` at 2026-09-06 01:47:00.805 UTC; deployment completed at 01:48:35.537 UTC. All ten canonical smoke checks passed; health was explicitly skipped because no health route exists.

Production counts come from a target-pinned, read-only RepeatableRead snapshot captured at **2026-09-06 01:52:37.197 UTC**. These are whole-Portfolio-Database counts, not source-task counts or a claim that every company was freshly researched.

| Population | Count |
| --- | ---: |
| Published companies | 1,128 |
| Active published companies | 1,116 |
| Realized published companies | 12 |
| Published companies with a recorded pending transaction | 19 |
| Pending transaction rows: incoming / exit | 11 / 8 |
| Archived company records | 33 |
| Production redirects | 70 |

The 19 pending-transaction companies overlap the active/realized population; they are not a third mutually exclusive company status. These are recorded transaction states, not a new adjudication of closing events after each company's research cutoff.

| Source-task outcome | Count |
| --- | ---: |
| Completed | 343 |
| Excluded | 31 |
| Verified no change | 10 |
| Superseded | 71 |
| Deferred with fresh exact exception | 41 |
| Pending | 0 |
| Total | 496 |

The 45 fresh reviews resolved three tasks through corrections (42, 187, 257), excluded one (248), and retained 41 exact unavailable-fact exceptions. See [fresh-deferral-report-v3.json](fresh-deferral-report-v3.json) for every task's precise exception, decision, original evidence paths, and immutable hashes. Excluded, superseded and deferred are source-task outcomes, not additional production-company populations.

## Checks that passed

- All **343 current source-task apply receipts** validate against their exact proposals and approvals. No transaction was replayed.
- All **79 completed batch receipts** validate against their manifests. The 33 historical FAILED/no-receipt attempts have completed successor coverage; they are not active failures and must not be retried.
- All **45 fresh seven-file research chains** match their source-manifest evidence byte hashes. All 41 remaining deferrals include a precise fresh exception. All supersession chains resolve without a missing target or cycle.
- **3,430 artifact-reference checks** passed, including repeated references during receipt verification.
- **298 latest canonical approved after-images** agree with production on the compared name/geography/status fields, owner identities, vehicles, stakes, investment/exit years, lifecycle states and pending-transaction fields. This is not a blanket assertion about every legacy seed field or the 830 other published records.
- All **70 production redirect mappings** agree with the reconstructable approved lineage, and all retired focus URLs resolve correctly.
- The canonical unversioned API sweep passed **1,231 / 1,231** checks: 1,128 published IDs, 70 retired focus IDs and 33 archived IDs returning 404. Render-critical company projections were checked against the captured production images. See [public-api-verification-v2.json](public-api-verification-v2.json).

## Remaining parity failures and review candidates

1. **Identity projection mismatch:** the evaluated legacy seed contains 1,134 companies versus 1,128 published production companies. Seven seed-only labels remain: Puget Energy / Puget Sound Energy; Alpha Generation (AlphaGen); Cleco Corporation; ExteNet Systems; U.S. Medical Outpatient Facilities Portfolio (MedCraft JV); U.S. Medical Outpatient Facilities Portfolio (Montecito JV); and Extenet. Production additionally has the single canonical `Extenet (formerly ExteNet Systems)` label absent from the evaluated seed. Existing source decisions establish these alias relationships, but superseding source tasks did not retire all corresponding legacy seed entries. Do not add production duplicates or repeat the underlying transactions.
2. **Legacy owner projection mismatch:** 74 company projections differ under the seed-runner-style comparison. Many are representational (a legacy combined fund/vehicle or manager fallback versus an explicitly null legal vehicle) and must not be blindly written to production. One concrete state discrepancy is Chicago Parking Meters: its legacy seed says `SIGNED_PENDING_EXIT`, while production preserves `CLOSED_ACTIVE`. Fresh task 345 explicitly found no independently verified executed sale agreement or closing and authorized no ownership-state change. Preserve that exception and the approved displayed owners; do not promote the contemplated buyer into current ownership.
3. **Attribution candidate differences:** 603 field comparisons across 155 canonical companies differ against matched seed-attribution records, including 12 fund-link comparisons. These are diagnostic candidates, not an approved apply manifest. Historical overlays, seed-reconciliation chronology, field overrides, manager aliases, active-only scope and superseding protected attribution receipts must be checked before deciding which side needs correction. Never restore stale inferred attribution or change fund links merely to force equality. No attribution repair has been dispatched.
4. **Obsolete overlay lineage:** the older Pocahontas Parkway overlay `1c14424caf9278447d52ab6d93ece25ca5ea7e82c02e025a81d2ce20b44ced23` lacks a matching retained proposal artifact in the current checkout. It is followed by the current receipt-backed task-357 overlay `b06f359cea0f28f0f586e863f7acc7c9ae5753c4099b4703f6e8b2cea69ed1ff`, for the same canonical ID and retirement identity. The final redirect comparison is nevertheless exact. Recover/document the older lineage from protected Git history; never fabricate a proposal or repeat its transaction.

These findings require scoped persistence/attribution repair work before the requested final completion claim. No unavailable ownership fact should be invented to resolve a technical representation mismatch.

## Authoritative evidence and harness qualifications

Use **reconciliation-diagnostic-v3.json** and **public-api-verification-v2.json**, not their exploratory predecessors. The v1 offline diagnostic mistakenly classified discarded historical attempts and remote workflow references as unresolved. The v2 local receipt lookup could select a receipt-verification summary instead of the actual receipt. V3 requires a reproducible canonical receipt hash and verifies the real local receipt, eliminating those harness failures. The v3 JSON revision label was corrected from 2 to 3 before publication; no research, receipt or production evidence bytes were changed.

The first API sweep omitted the configured `/Infra-MA2` base path. Its root-path 404s, including apparent archived passes, are invalid harness observations, **not an application outage**. The corrected sweep uses the actual canonical API path and passes every check. Exploratory files remain preserved and explicitly non-authoritative.

Production state SHA: `da4ae4d20018fdd83b1ada3cf4626c7ca491706a6ee35b095a66710549c8abb2`.
Execution-manifest embedded SHA: `e1d37c59b0db0754f38fc8f1b668423d7135fa392b15559e4b7008586cbb2e07`.
Batch-ledger embedded SHA: `9118f52029df79c7d0e546d42bbae2d546b671786b574327c12bcd0beed5a45c`; active batch is null.

The diagnostic scripts are read-only with respect to production and use exclusive artifact output. The production capture was target-pinned to the established Neon database and explicitly set `SET TRANSACTION READ ONLY` inside RepeatableRead. Credentials are not included in these artifacts. Any later repair must take fresh locked snapshots and use its ordinary protected release/apply safeguards; this checkpoint is not write authorization and is not a substitute for those gates.
