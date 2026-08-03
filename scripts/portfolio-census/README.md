# North American Portfolio Census

This package creates and validates the prompts for a sequential, review-only census of the 100 infrastructure managers in `scripts/research/manager-universe.json`.

The research worker runs in the signed-in ChatGPT web app with GPT-5.6 Sol and Pro mode selected in the UI. The prompt itself does not attempt to activate Pro mode. Every manager uses a fresh conversation, and the outer workflow keeps concurrency at one.

The workflow creates audit artifacts only. It does not update Prisma, seed data, ownership periods, portfolio scorecards, or publication state.

## Files

- `orchestrator-prompt.md`: Codex workflow for driving the signed-in ChatGPT web app one manager at a time.
- `worker-prompt.md`: per-manager research and reconciliation contract.
- `repair-prompt.md`: single allowed schema-repair follow-up.
- `schema.ts`: strict repository snapshot, ChatGPT result, and manifest schemas.
- `snapshot.ts`: read-only Prisma snapshot with evaluated seed fallback.
- `recover-session-lineage.mjs`: reconstructs the manager-to-ChatGPT conversation lineage from a Codex session archive without changing census artifacts.
- `recover-accepted-census.ts`: fail-closed recovery of an immutable accepted run plus strict downstream PortCo reconciliation inputs.
- `recovery.ts`: direct-envelope selection, documented chunk reassembly, fixed aggregate checks, and explicit field conversion.
- CLI scripts: initialize, generate prompts, validate, ingest, and update resumable state.

## Generate the outer Codex prompt

```bash
npm run portfolio:census:orchestrator -- --as-of 2026-07-28
```

This writes:

```text
audits/portfolio-census/2026-07-28/orchestrator-prompt.md
```

Use that generated file as the Codex prompt for the browser-driven run.

## Initialize a run

```bash
npm run portfolio:census:init -- --as-of 2026-07-28
```

Initialization refuses to overwrite an existing manifest. The manifest preserves the exact 100-manager order and records GPT-5.6 Sol, Pro mode, and concurrency one as run requirements.

## Build one manager prompt

```bash
npm run portfolio:census:prompt -- \
  --run-dir audits/portfolio-census/2026-07-28 \
  --manager-index 1
```

Snapshot behavior:

- `auto` (default): query published Prisma Company and OwnershipPeriod records when `DATABASE_URL` is configured; otherwise use evaluated seed data.
- `database`: require the Prisma database snapshot.
- `seed`: explicitly use evaluated seed data.
- `--snapshot path`: use a prebuilt snapshot that passes the strict snapshot schema.

The command writes indexed snapshot and prompt files without changing repository data.

## Track execution state

Before sending the generated prompt:

```bash
npm run portfolio:census:state -- \
  --run-dir audits/portfolio-census/2026-07-28 \
  --manager-index 1 \
  --action start
```

If the second ChatGPT response still fails validation:

```bash
npm run portfolio:census:state -- \
  --run-dir audits/portfolio-census/2026-07-28 \
  --manager-index 1 \
  --action fail \
  --error "Response remained invalid after one repair"
```

## Validate and ingest

Save the complete ChatGPT response, including both marked sections, then run:

```bash
npm run portfolio:census:validate -- \
  --run-dir audits/portfolio-census/2026-07-28 \
  --manager-index 1 \
  --input audits/portfolio-census/2026-07-28/raw/001-3i-infrastructure.txt
```

After validation:

```bash
npm run portfolio:census:ingest -- \
  --run-dir audits/portfolio-census/2026-07-28 \
  --manager-index 1 \
  --input audits/portfolio-census/2026-07-28/raw/001-3i-infrastructure.txt
```

Ingestion revalidates the response, refuses to replace completed artifacts, writes JSON and Markdown review files atomically, and advances the manifest.

## Recover ChatGPT conversation lineage

For an already completed browser-driven run, reconstruct the primary conversation URL and recovery evidence for all 100 managers from its Codex JSONL archive:

```bash
node scripts/portfolio-census/recover-session-lineage.mjs \
  --archive /absolute/path/to/rollout-session.jsonl \
  --out /tmp/portfolio-census-session-lineage.json
```

The output records the successfully ingested raw artifact, the primary conversation URL, related retry or chunk conversations, resolution method, confidence, and the live extraction selector `section[data-turn="assistant"]`. Assistant turn IDs remain empty until the corresponding signed-in ChatGPT page is opened and the accepted turn or ordered chunk turns are verified against the validator.

## Recover an immutable accepted census

When the accepted run still exists outside the active checkout, recover it into
a new directory without changing the source:

```bash
npx tsx scripts/portfolio-census/recover-accepted-census.ts \
  --lineage /tmp/portfolio-census-session-lineage.json \
  --fulltexts .recovery/census-chat-fulltexts.json \
  --accepted-run-dir /absolute/path/to/accepted/audits/portfolio-census/2026-07-28 \
  --output-dir audits/portfolio-census/2026-07-28
```

The output directory must not exist. Recovery is staged on the same filesystem
and renamed only after all 100 results pass the current strict schema, exact
manager order, manifest paths, accepted raw-envelope parity, and the fixed
historical aggregate (992 holdings: 946 closed active, 30 pending incoming,
and 16 pending exit). Fund-census envelopes are explicitly ignored.

The CLI selects the immutable accepted JSON and Markdown first. If an accepted
artifact is absent, it can select the last schema-valid marked portfolio
envelope for the requested manager or mechanically reassemble documented
identity/holding/reconciliation chunks. Chunk recovery requires exact holding
coverage and recovered Markdown; missing or ambiguous chunks fail with the
missing tag/range instead of synthesizing facts.

In addition to the restored audit package, recovery writes one strict
`PORTCO_CENSUS_RECOVERED_INPUT` object per manager under `recovered-inputs/`.
Each is bound to the accepted response SHA-256 and contains deterministic
holding IDs. Evidence facts and support labels are preserved; historical
`ownershipVehicle` maps to downstream `vehicleName`, while `fundName` stays
null because the census did not establish those as separate concepts.

`recovery-report.json` and `recovery-report.md` record source hashes, manager
methods, browser-capture evidence, ignored fund markers, conversion rules, and
the recovered/missing manager list. The copied lineage and chat capture remain
provenance only; they cannot override an accepted artifact.

## Validation guarantees

An included holding is rejected unless its evidence collectively supports:

- ownership;
- the manager's infrastructure strategy;
- North American scope; and
- closed or signed-pending ownership state.

The validator also checks exact enum values, summary counts, duplicate manager-level holdings, required repository matches, pending-state preservation, manager/as-of identity, snapshot provenance, and the human review report.

## Tests

```bash
npm run test:portfolio-census
```

The tests cover the 100-manager universe, clear and overlapping manager prompts, a fund-of-funds manager prompt, closed and signed-pending holdings, evidence failures, duplicate holdings, response parsing, manifest resumability, and overwrite protection.
