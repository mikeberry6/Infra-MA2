# North American Direct Infrastructure Fund Census

This package runs a sequential, review-only census of the 100 managers in
`scripts/research/manager-universe.json`. It identifies current direct-equity
infrastructure funds with an explicit North American mandate or a verified
current North American holding attributed to the named fund.

Each manager uses a fresh signed-in ChatGPT web conversation with GPT-5.6 Sol
and Pro mode. Concurrency is fixed at one. The version-controlled
`prisma/seed-data/funds.manifest.json` is the reconciliation baseline.
Capture marked responses from DOM `textContent`; rendered `innerText` can add
layout line breaks inside linked JSON URL strings.

The workflow creates audit artifacts only. It never changes the fund manifest,
fund evidence manifest, Prisma data, ownership links, publication state, or
production database. Managers absent from the baseline manager universe are
reported as out of scope rather than proposed as automatic additions.

## Files

- `worker-prompt.md`: manager-specific research and reconciliation contract.
- `orchestrator-prompt.md`: sequential browser-run protocol.
- `repair-prompt.md`: the single permitted schema-repair follow-up.
- `schema.ts`: strict snapshot, result, and resumable-run schemas.
- `snapshot.ts`: read-only manager slice from the reviewed fund manifest.
- CLI scripts: initialize, generate prompts, validate, ingest, track state, and
  aggregate results.

## Generate the outer workflow prompt

```bash
npm run fund:census:orchestrator -- --as-of 2026-07-29
```

The generated file is
`audits/fund-census/2026-07-29/orchestrator-prompt.md`.

## Initialize or resume

```bash
npm run fund:census:init -- --as-of 2026-07-29
```

Initialization refuses to replace an existing manifest. The run records the
100-manager order, GPT-5.6 Sol, Pro mode, and concurrency one.

## Build one manager prompt

```bash
npm run fund:census:prompt -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1
```

The command writes an indexed snapshot and prompt without changing fund data.
A prebuilt strict snapshot can be supplied with `--snapshot path`.

## Track state

```bash
npm run fund:census:state -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1 \
  --action start
```

After a second invalid response:

```bash
npm run fund:census:state -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1 \
  --action fail \
  --error "Response remained invalid after one repair"
```

## Validate and ingest

```bash
npm run fund:census:capture -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1 \
  < complete-browser-response.txt

npm run fund:census:normalize -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1 \
  --input audits/fund-census/2026-07-29/raw/001-3i-infrastructure.txt

npm run fund:census:validate -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1 \
  --input audits/fund-census/2026-07-29/raw/001-3i-infrastructure.txt

npm run fund:census:ingest -- \
  --run-dir audits/fund-census/2026-07-29 \
  --manager-index 1 \
  --input audits/fund-census/2026-07-29/raw/001-3i-infrastructure.txt
```

Ingestion revalidates the response, refuses to overwrite completed artifacts,
writes JSON and Markdown atomically, and advances resumable state.

The optional normalization command is deliberately narrow. Its modes cover
only deterministic contract repairs: hydrating exact snapshot identities,
recording native-size evidence for stale USD conversions or exact USD
normalization, anchoring missing or unsupported exact `sizeAsOf` assertions to
the publication date of the single qualifying amount source, aligning
retrieval dates to the fixed
cutoff, mapping the unambiguous `OPEN_ENDED_ACTIVE` synonym to the contract's
`EVERGREEN_ACTIVE` enum, and demoting proposed-new vehicles whose claimed
North American holding lacks fund-specific evidence. It can also move any
repository-backed included row to `repoOnlyRecords` when no opened evidence
supports the mandatory North America claim or current lifecycle. An
additional `--mode secondary-only-evidence-repo-review` demotes a
repository-backed inclusion when every qualifying citation is secondary and
no primary or institutional source supports the row.
An operator-verified
publication date can be recorded for an exact opened primary or institutional
source with `--mode verified-source-published-at --source-date
YYYY-MM-DD=https://...`; amount-source dates must match the result's existing
`sizeAsOf` assertion. Every mode refuses conflicts, preserves the raw response,
and writes a separate normalization audit log. Repository reversion also
removes declared correction fields when no opened evidence maps to those
fields; evidence-supported differences remain untouched.

`--mode program-exception-identity-evidence` adds the required identity claim
only when an exact primary program-scoped row names the documented program and
already supports its direct-equity infrastructure strategy.
`--mode unclassified-size-structure` preserves an evidenced descriptive size
while removing structured numeric fields when no allowed amount basis is
disclosed, instead of inventing one.

`--mode explicit-na-basis` repairs only a holding-based qualification that
omits its required holding payload when exactly one opened primary or
institutional fund source explicitly connects the vehicle's mandate, targets,
or investments to North America.

`--mode summary-counts` recomputes the complete summary block from the result
arrays and classifications without changing any research fact or disposition.
`--mode region-enum` maps only the unambiguous `Asia` shorthand to the
contract's canonical `Asia-Pacific` enum.

## Aggregate

After all managers complete:

```bash
npm run fund:census:aggregate -- \
  --run-dir audits/fund-census/2026-07-29
```

This produces `aggregate.json`, `review-queue.json`,
`eligibility-ledger.csv`, and `summary.md`. Use `--allow-partial` only for an
explicit interim review.

To generate a deterministic record-level log of every proposed addition and
material correction, with frozen baseline values and evidence links:

```bash
npm run fund:census:change-log -- \
  --run-dir audits/fund-census/2026-07-29
```

This writes `major-change-log.md` and a field-level
`major-change-log.csv`. Needs-review, archive-review, unknown-manager, and
cross-manager duplicate records remain non-actionable and are summarized
separately.

To retain only proposed additions with fund-specific evidence indicating at
least $1 billion of current or expected size while preserving all existing
fund corrections:

```bash
npm run fund:census:change-log -- \
  --run-dir audits/fund-census/2026-07-29 \
  --minimum-addition-size-usd-mm 1000
```

## Promote a reviewed census

Promotion is a separate, review-gated step. It reads the complete aggregate,
the version-controlled baseline manifests, and an explicit implementation
policy:

```bash
npm run fund:census:promote -- \
  --run-dir audits/fund-census/2026-07-29
```

The default command is non-mutating. It writes a deterministic promotion plan,
six batch change sets, six candidate-contract readiness reports, and a
review-only ownership-linked rename report under `implementation/`. The policy
fixes the addition threshold, excluded existing fields, Evergreen
preservation, deferred renames, stable new IDs, and expected batch counts.
Readiness reports deliberately remain blocked until sources are reopened,
raising vehicles have explicit `VERIFY_NO_CHANGE` coverage, a trusted live
audit is supplied, and GPT-5.6 Pro plus human review are complete. A change set
is not an executable `FundRefreshProposal`.

After the refresh foundation is merged and a trusted live audit has been
downloaded, materialize exactly one reviewed batch on its own data branch:

```bash
npm run fund:census:promote -- \
  --run-dir audits/fund-census/2026-07-29 \
  --live-audit audits/fund-refresh/<trusted-run>/fund-audit.json \
  --apply-batch 1
```

Never combine batches. The live audit must include ownership snapshots; any
additional exact ownership-linked rename is deferred automatically. Promotion
refuses to materialize a batch with candidate-contract errors.

From batch 2 onward, rebuild the reviewed plan from the immutable foundation
commit while applying it to the current manifest:

```bash
npm run fund:census:promote -- \
  --run-dir audits/fund-census/2026-07-29 \
  --review-baseline-commit <full-foundation-commit-sha> \
  --live-audit audits/fund-refresh/<trusted-run>/fund-audit.json \
  --apply-batch 2
```

The current manifest count must match the selected batch's expected base count,
so batches cannot be skipped, replayed, or combined accidentally.

## Validation guarantees

An included fund is rejected unless evidence collectively supports:

- fund identity;
- direct-equity infrastructure scope;
- North American mandate or fund-attributed current holding; and
- current lifecycle.

The validator also checks exact enums, summary counts, duplicate commercial
fund identities, field-specific support for corrections, program-exception
evidence, amount-date constraints, secondary-source safeguards, exact
repository diffs, and reconciliation of every supplied legacy ID exactly once.

## Tests

```bash
npm run test:fund-census
```
