# AES public-market rationale authority — audit only

Task 154, The AES Corporation (`cmrxpjgmk00yxivhegkkxve01`), has one original attribution discrepancy: the rationale on Public Market owner `cmt5w9df6000twyyy3y57d5th`. The source-supported recommendation is to retain the existing production rationale and align the semantically consistent seed wording in a separately authorized compatible persistence release. No production correction is needed for this field. No database or seed data was changed.

## Frozen proof

- Protected base: `d0eec989f20d6e73ff1877c7f4757a5d1adb0af1` (completed STRATOS PR #957).
- Read-only preparation passed at `2026-09-08T01:11:39.744Z` against canonical Git-integrated production deployment `dpl_CxGh4qA4oKu3YidzUGyrShGHU6fH`, with 32 protected input files unchanged.
- Publishable authority v2 SHA: `00a9c6e790e605fb6e5ad51c59188fb4bcdec9c861cb2b2a09c2d09d400abd43` in `authority-v2.json`. `capture-verification-v2.json` binds the same frozen read-only snapshot without another database capture.
- Scoped production SHA: `3f21aa5d30693e8c5fd2228dcb0a09d7ade99013010a5fec259ceaf6b272ac47`.
- One original field reviewed locally: cumulative 144/603, with 459 remaining after this audit's protected release; zero extra fields outside the original set. Until release verification, the last released total remains 143/603.
- Frozen manifest and idle ledger remain unchanged. All 496 tasks retain terminal outcomes. This audit is not an active source bundle, new adjudication attempt, apply manifest, or completion authorization.

## What is preserved

The complete receipt-backed parent company image, three aliases, six citations, three milestones, no management, one active Public Market owner and one `SIGNED_PENDING_INCOMING` Horizon Parent consortium transaction are unchanged. The two erroneous preclosing buyer-owner IDs remain removed. No retired company or redirect is invented. Preserve the canonical August 23 cutoff rather than claim a new exhaustive lifecycle review.

`Public Market` is an ownership classification and seed manager fallback, not a named legal fund or investment vehicle. Production has null fund and vehicle names, while the generated core organization resolves to Public Market through the canonical manager fallback. No numerical stakeholder allocation is inferred.

The exact applied PortCo member 2 receipt binds proposal `8a442316a28ed122c37919a8acb6aee1df60a79cc696a71e4ad7cd21f079c2ad` and transaction `ec184042-ea24-4666-8b0a-d29c15e7d581`. The Public Market owner is absent from the initial 1,264-row attribution chain and occurs exactly once in the later seven-row receipt `07408486b2ad3f251eb2eb899037c81f42518211de50e9e56f27fb1940c69e9e`, record `OFA-REPAIR-0154-AES-PUBLIC`. The current seed record `OFA-0AEF7B332AB6` matches the exact canonical upsert. Never replay any of these transactions.

## Evidence and limits

The single field-primary is the issuer's March 2, 2026 take-private announcement, whose raw HTTP 200 hash is preserved and whose published copy has one publisher token redacted as described below. It says AES becomes private and ceases NYSE trading upon completion, subject to conditions. The company-provided syndicated announcement corroborates the same conditional statement but is not independent evidence. Shareholder approval, HSR expiry and a New York comment period are not actual closing.

Nine existing-source requests were captured once: four readable HTTP 200 responses and five SEC HTTP 403 denial pages. Five separately hashed selected rendered excerpts preserve bounded agreement, quarterly note, annual report, vote and certificate facts. These excerpts are not complete source HTML or a whole-filing review. The vote selection retains its missing separately rendered initial T. No raw 403 body is treated as substantive evidence, and browser readability is not assigned an unobserved HTTP status.

The quarterly note and annual report are readable now. This does not prove that their historically required release-stage reopening occurred before the old application. Preserve that exact historical limitation. The existing application-primary remains the merger agreement; current evidence/citation persistence requires compatible separate treatment, not silent historical substitution.

The nine-file historical research packet, four attested content hashes, zero repairs, identical initial/accepted responses and compiled prompt/response transcript are verified. No new ChatGPT conversation was submitted. The transcript is not represented as a full DOM trace.

## Validation and release boundary

All 203 test files / 3,728 tests pass after the publication revision, including 81 targeted AES tests with altered source, rendered text, redaction provenance, packet, receipt, company, pending transaction, owner metadata and duplicate-scope rejection cases. Strict targeted typecheck, application typecheck, scoped ESLint and offline seed validation pass; seed validation reports zero errors and 54 existing warnings. The full seed runner was not executed. Nonfatal pg deprecation warnings do not change the read-only transaction.

Three preliminary preparation runs failed closed on audit-assumption mistakes (total candidate cardinality, scoped candidate cardinality and organization fallback), before any output or write. Each was corrected against the frozen canonical inputs and the existing image normalizer. The fourth attempt passed and produced the only immutable AES preparation outputs. Do not repeat successful preparation or raw capture.

Authored-file diff whitespace checks pass. Evidence HTML retains publisher whitespace and line endings; a blanket diff check therefore reports source-origin whitespace. Do not reformat evidence to suppress those diagnostics.

## Publication security revision

GitHub rejected the first unpublished commit because the issuer announcement and homepage embed a value flagged as a Mapbox secret access token. Push protection was not bypassed. The raw originals remain local and excluded from Git, along with the superseded local-only authority/capture/review v1 files. Exactly one `mapbox_token` value per page was replaced with an explicit redaction marker in separate `.sanitized.html` copies. `source-redactions.json` binds the original and published hashes and byte lengths. All substantive source text is unchanged; the published copies are not represented as raw-byte-identical downloads.

The offline `revise-aes-publication.ts` script validated the frozen v1 proof and all 32 dependencies, then re-proved v2 against the same captured production state and revised source bindings. It performed no database capture or write. The original raw response metadata remains in `source-capture.json`; v2 distinguishes those original hashes from the publishable source hashes. Do not repeat either successful capture, sanitization or offline revision.

Publish only the v2 scoped audit packet, its seven audit scripts/tests, and the three previously local STRATOS postrelease artifacts through protected main. Exclude both raw token-bearing pages and the superseded v1 files. After exact merge-SHA canonical production is ready, run the exclusive production-release proof and guarded route smoke. These are not rendered-card verification or data corrections. Completion remains false until all remaining fields and separately authorized compatible persistence are resolved.
