# Ten-name PortCo completion

This internal workflow replaces per-company audit tooling for subsequent work. It does not change the source-task state machine, the five-member source-bundle schema, public data interfaces or the protected attribution write scope.

## Boundaries

Work only in `/Users/mikeberry6/Infra-MA2-portco-ipx-attribution-repair`. Start from fresh protected `origin/main`, preserving unrelated local artifacts. PR958 is verified; its completion bookkeeping accompanies the first combined release.

The progress register is keyed by canonical company ID, not by fields or duplicate source tasks. Initialize it once using `reviewedInventory()` from the frozen chronology, completed source proposals and published authority reports. It deliberately starts with zero fully verified names: an old audit report is not a correction receipt. Original unavailable-fact exceptions remain in the source manifest and are not silently counted as new work or as resolved facts.

`nextNames()` selects ten reviewed backlog companies in original source order before unreviewed names. Fewer are allowed only when that eligible pool is exhausted. Parked companies are revisited after the main pass. One active release is enforced independently of the permanently idle, terminal source ledger. No source tasks are reopened.

## Preparation

1. Use small `decisionSchema` records. Bind existing authority/receipt/source files by byte SHA; exactly one primary citation per owner decision. Review only unresolved facts or changed dependencies. No repeated ChatGPT requests. Preserve evidence qualifications and legal-vehicle/manager distinctions.
2. Validate files offline before any production capture. `scanPublication` rejects known credential formats without echoing values; GitHub secret scanning remains required. Keep raw originals local when necessary. `verifyRedaction` checks exact replacement counts plus original/publication hashes; never publish the original literal token or change substantive evidence. Do not automatically sanitize source evidence.
3. Capture all selected company images, owner metadata/IDs, redirects and linked/target fund dependencies in one target-pinned RepeatableRead, READ ONLY transaction using `capture()`. Preserve the output exclusively. A successful snapshot is not recaptured to hide a failed comparison. Rebind stale inputs only after reviewing the change.
4. Build one batch manifest with complete before-images and dependency hashes. `compileBatch()` validates it using the existing attribution seed and apply schemas. It emits compatible seed, exact projected company after-images and the existing apply manifest format, or no apply manifest for seed-only/no-op batches. It never invokes the full seed runner or writes a database.
5. Unsupported identity/organization/vehicle/stake/year changes, unresolved conflicts and missing seed identity bindings are parked with exact required work. A parked company has zero mutations. A safe company must account for every owner. Metadata not being changed is preserved exactly; do not declare unresolved non-target issues fully verified.

The rationale for a substantive production correction must identify the factual defect, not stylistic preference. For equivalent wording retain the source-supported production text and align seed only. The shared checker cannot itself adjudicate source truth: the reviewed decision records remain part of the protected PR.

Complementary historical authority packets may be combined only through an explicit `combinations` entry naming the canonical company, every exact report SHA and the audited reason. `reviewed-packets.ts` normalizes row-array and single-owner envelopes while retaining each original report, dependency and source binding. It rejects duplicate or overlapping owners/seed records, conflicting recommendations and incompatible source boundaries. Preparation additionally requires identical complete canonical company images across all packets and compares every owner before-image to the single fresh production snapshot. This is a disjoint union of existing decisions, not inferred fact reconciliation or permission to drop a packet.

An explicit `historicalTests` binding may preserve a report's original test bytes from an archived audit fixture while also binding the current test and historical reader. The checker permits only the exact `node:fs` to frozen-reader import migration; every assertion and all other bytes must be unchanged. Arbitrary stale code or data dependencies still fail closed.

`prepare-reviewed.ts` accepts a `completedReleases` list of immutable completion directories and receipt paths. `completedSeedLineage()` replays every preceding batch through the existing compiler, receipt-chain and completion validators, requiring consecutive progress and seed hashes and the exact current idle register. Only then may an older seed dependency be rebound to its frozen before-copy, and only when every selected company's seed record is byte-semantically unchanged. A changed selected record, missing receipt, omitted release or unexplained seed change fails closed. Original authority reports and hashes are never rewritten. Both historical single-image and multi-image snapshot envelopes are supported; their entire original payload hash and selected complete image remain mandatory.

## Release and verification

One scoped PR combines checker changes when needed, decisions, compatible seed overlay, reviewed apply manifest and previous release bookkeeping. Run targeted checks during preparation, the full regression suite once on final contents, offline seed validation, and required GitHub build checks. Do not create a separate preliminary audit deployment.

Use the existing `.github/workflows/portfolio-fund-attribution-apply.yml` and protected approval for supported mutations. Its mutation list has no five-company limit. Require exact protected merge SHA on the canonical Git-integrated production alias, not a preview, before dispatch. Keep immutable workflow receipts. Never retry a dispatched transaction merely because the response was lost. Persist APPLYING before dispatch; unknown outcome or any post-apply failure becomes VERIFYING_FAILED. Recover from immutable receipts and complete after-images, not a repeated apply. Existing transaction rollback/serialization tests and workflow checks must continue to pass.

`complete()` requires exact canonical release proof, all complete projected company/owner/fund/redirect after-images, a verified manifest/approval/production receipt chain for writes, exact receipt before-images and unused receipt hash. Every safe name additionally requires durable seed alignment, API, redirects, ownership, citations and rendered-card evidence. Route smoke alone is not a rendered card. Seed-only/no-op batches must not carry a DB receipt. Completion artifact files must exist and match their hashes before register finalization. Failures freeze the batch until the same release is fully recovered.

Store completion evidence durably. Carry release bookkeeping in the next combined batch where safe; publish a final closeout release if no next batch remains. Report fully verified / parked / remaining names separately from field counts. Final reconciliation includes the original exact exceptions, full production/seed identity, ownership and redirects, not just the original 155-name field-difference inventory.

## Commands

`npx tsx scripts/portco-completion/cli.ts status --progress=<progress.json>`

`npx tsx scripts/portco-completion/cli.ts offline --progress=<progress.json> --batch=<completion-batch.json>`

`node --env-file=<local-readonly-env> --import tsx scripts/portco-completion/cli.ts snapshot --progress=<progress.json> --batch=<completion-batch.json> --expected-sha=<full-main-sha> --output=<new-snapshot.json>`

`npx tsx scripts/portco-completion/cli.ts compile --progress=<progress.json> --batch=<completion-batch.json> --snapshot=<snapshot.json> --seed=prisma/seed-data/ownership-attributions.manifest.json --output=<new-output-directory>`

Compilation outputs are preparation artifacts, not approval or deployment. Never overwrite them with `--force`. Publication staging must be an exact file allowlist; never `git add .` in this recovery worktree.

The existing apply entry point also loads the committed completion sidecar when a ten-name release is active. It compiles the frozen inputs again, checks the entire published seed, rejects a previously successful transaction, and compares complete selected company/owner/redirect/fund images both before and after the writes inside the same serializable transaction. An after-image mismatch rolls the transaction back. This supplements, rather than replaces, protected workflow and immutable receipt validation.

Historical field-authority tests use `historical-fixtures.ts` for the original attribution seed, pinned by both byte and schema hashes. Their historical assertions remain unchanged while the batch compiler validates the new live seed overlay. Unchanged, byte-identical source evidence already committed at the pinned base is reused without republishing it; all new or modified publication copies must pass the secret scan. Existing raw originals and explicit redaction records remain preserved.

Shared regression: `npx vitest run scripts/portco-completion/*.test.ts scripts/portfolio-fund-attribution/*.test.ts`.
Strict tool typecheck: `npx tsc -p scripts/portco-completion/tsconfig.json`.
