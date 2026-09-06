# Seed-only persistence repair for five superseded aliases

This scoped release removes five obsolete base-seed records whose source tasks were already superseded by completed, receipt-backed canonical tasks. It does **not** reopen a source task, activate a reconciliation bundle, create or remove a production company, replay a transaction, or alter canonical ownership, pending transactions, citations, redirects, public interfaces or scorecards.

| Superseded source | Existing completed canonical task | Retained canonical identity |
| --- | --- | --- |
| 466 — Alpha Generation (AlphaGen) | 64 | Alpha Generation, LLC |
| 472 — Cleco Corporation | 122 | Cleco Corporate Holdings LLC |
| 490 — Puget Energy / Puget Sound Energy | 128 | Puget Energy, Inc. |
| 495 — U.S. Medical Outpatient Facilities Portfolio (MedCraft JV) | 250 | Fengate-MedCraft Cleveland Clinic Outpatient Portfolio |
| 496 — U.S. Medical Outpatient Facilities Portfolio (Montecito JV) | 251 | Montecito Medical Outpatient Portfolio |

Each source label is explicitly preserved as an alias in its existing canonical proposal and production company. The exact terminal decisions, task/research/source bindings, canonical proposals, approvals and immutable apply receipts were revalidated without repeating research. No new ownership assertion or source conclusion is introduced.

## Frozen scope and checks

`repair-plan.json` SHA `fe73d0279eaf28f077a4bdc8094fc6fe6bf5e5ed5170930a86cdfcf8f825ab3a` binds the protected base `e800427881fe13269e20b9eafd9607db43094b5e`, idle ledger, unchanged terminal execution manifest, original seed entries, retained canonical seed hashes, source artifacts and dependency file-byte hashes.

A fresh target-pinned production capture at **2026-09-06T02:21:53.307Z** used a RepeatableRead transaction with `SET TRANSACTION READ ONLY`. All five canonical company graphs remain identical to the verified PR915 audit capture, the five alias labels are not independently published, and all 70 redirects are unchanged. Scoped production snapshot SHA: `0a0a325c48299f4dd50bb2e2a470751bba9e5b226de793e9861dcf606468909b`.

The change removes exactly five seed entries and their eight duplicate active-owner attribution records (five inferred and three disclosed). It does not replace or upsert any attribution record; all retained canonical attribution metadata is unchanged. The existing seed-attribution reconciliation utility validates every remaining active seed owner exactly once. Its `batchId` field names this seed-only persistence release, **not** a newly activated source-task bundle or a production apply authorization.

Evaluated seed companies fall from **1,134 to 1,129**; active seed-attribution records fall from **1,402 to 1,394**. All retained company fields match the captured resulting seed hash `f2a398507cb2c320456b9f6ea4b9514095d8443ed3f22cbfaffcf9446aaf07bc`. Production stays at **1,128 published companies**. The five removed seed objects and all eight removed attribution records are preserved in this directory and protected Git history, so the retirement is recoverable.

Local verification: ordinary typecheck passed; 38 scoped PortCo/attribution/seed test files passed all 351 tests; offline seed validation had zero errors and 54 existing-format warnings. Regression coverage binds exact scoped changes and preserves source evidence, canonical fields, overlays, redirect baseline and unrelated companies. Initial local test failures were corrected by using the attribution subsystem's own insertion-order hash algorithm and updating the explicit attribution census for the eight removed duplicate records; evidence hashes were not rewritten to hide failures.

`prepare-seed-alias-persistence.ts` only captures production and creates exclusive artifacts. It refuses stale manifests, active work, changed production dependencies, missing aliases, collisions or unverifiable receipts. Hand edits to seed files are separately reviewed in the protected PR. `verify-seed-alias-persistence.ts` rechecks the exact seed hash, unchanged production snapshot, canonical main deployment's full SHA, and canonical/retired-focus API projections. Neither script can write to production. Their evidence outputs are exclusive; do not rerun a completed phase over existing artifacts.

## Remaining work — overall completion is still blocked

This is deliberately limited to the five fully resolved supersession relationships. Extenet's two legacy labels versus its one canonical production name, Chicago Parking Meters' legacy ownership-state projection, attribution chronology/override candidates, and obsolete Pocahontas overlay lineage remain for separately scoped reconciliation. All 41 exact deferred exceptions remain unchanged. This release does not establish whole-database seed replay parity and must not complete the durable goal or stop its heartbeat.
