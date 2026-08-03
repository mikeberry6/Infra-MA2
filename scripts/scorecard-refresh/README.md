# Sequential portfolio-company scorecard refresh

This package is the executable, non-database research and review layer for the one-company-at-a-time scorecard refresh. It writes only resumable audit artifacts below the selected run directory. It never imports Prisma, controls a browser, submits a ChatGPT message, or changes company data.

The manifest is the concurrency authority. A run lock serializes every manifest write, `RUNNING` requires exactly one active company, and a company remains active while it is researching, repairing, awaiting approval, applying, or being verified. A second company cannot start until the prior one reaches a terminal state through the separate approved apply workflow. Conversation URLs must be unique and use `https://chatgpt.com/c/{id}`.

## 1. Initialize the deterministic manifest

Prepare a strict run input. `companies` can contain unpublished records, but the manifest includes only published canonical companies.

```json
{
  "schemaVersion": 1,
  "artifactType": "SCORECARD_REFRESH_RUN_INPUT",
  "asOfDate": "2026-08-03",
  "sourceDatabaseSnapshotHash": "<64-lowercase-hex-sha256>",
  "companies": [
    {
      "companyId": "company-id",
      "canonicalName": "Example Infrastructure, LLC",
      "country": "United States",
      "isPublished": true,
      "applicableManagers": ["BlackRock", "Global Infrastructure Partners"],
      "companySnapshotHash": "<64-lowercase-hex-sha256>"
    }
  ]
}
```

```sh
npx tsx scripts/scorecard-refresh/init-run.ts \
  --input /absolute/path/scorecard-run-input.json \
  --run-dir audits/scorecard-refresh/2026-08-03
```

The builder preserves the checked-in 100-manager order, alphabetizes companies within each manager, assigns a multi-manager company to the earliest applicable manager, appends all remaining published companies alphabetically, and emits each canonical company exactly once.

## 2. Inspect and start only the next company

Inspecting is read-only:

```sh
npx tsx scripts/scorecard-refresh/next-task.ts \
  --run-dir audits/scorecard-refresh/2026-08-03
```

Open a fresh conversation in the signed-in ChatGPT web application and externally verify `GPT-5.6 Sol` with `Pro` mode. The CLI deliberately does not do this. Then bind the fresh conversation to the next task:

```sh
npx tsx scripts/scorecard-refresh/next-task.ts \
  --run-dir audits/scorecard-refresh/2026-08-03 \
  --start \
  --conversation-url https://chatgpt.com/c/CONVERSATION_ID
```

## 3. Generate the full-company worker prompt

Create a `ScorecardPromptContext` JSON matching `scorecardPromptContextSchema` in `schema.ts`. It must contain the exact active task identity and hashes, the externally verified GPT-5.6 Sol/Pro execution attestation, current scorecard and ownership snapshots, reopened manager-census evidence, the seed record, related deals, and known flags.

```sh
npx tsx scripts/scorecard-refresh/build-worker-prompt.ts \
  --run-dir audits/scorecard-refresh/2026-08-03 \
  --context /absolute/path/company-context.json
```

The command saves the immutable context and rendered prompt. Submit that prompt in the bound ChatGPT conversation and wait for the complete response before taking any other company action.

## 4. Validate and ingest the response

Validation is read-only and exits nonzero when the response is malformed:

```sh
npx tsx scripts/scorecard-refresh/validate-response.ts \
  --run-dir audits/scorecard-refresh/2026-08-03 \
  --input /absolute/path/chatgpt-response.txt \
  --attempt initial
```

Ingestion saves the raw response and validation result. A valid response is finalized into a hash-bound proposal, the worker report, and a trusted review report, then moves the company to `AWAITING_APPROVAL` (or pauses it as `BLOCKED`).

```sh
npx tsx scripts/scorecard-refresh/ingest-response.ts \
  --run-dir audits/scorecard-refresh/2026-08-03 \
  --input /absolute/path/chatgpt-response.txt \
  --attempt initial
```

If the initial response is malformed, ingestion moves the same task to `REPAIRING` and writes one narrow repair prompt under `repairs/`. Submit it in the same conversation. There is exactly one repair attempt:

```sh
npx tsx scripts/scorecard-refresh/ingest-response.ts \
  --run-dir audits/scorecard-refresh/2026-08-03 \
  --input /absolute/path/repaired-response.txt \
  --attempt repair
```

A second malformed response marks the company `FAILED` and pauses the run. Replaying an initial response as a repair, or consuming more than one repair, is rejected.

## 5. Validate individual approval binding

After the user reviews the per-company proposal and trusted report, record the explicit approval using `scorecardApprovalSchema`. Approval must name the company, proposal hash, company snapshot hash, and source database snapshot hash exactly.

```json
{
  "schemaVersion": 1,
  "artifactType": "SCORECARD_REFRESH_APPROVAL",
  "approvalId": "approval-company-id",
  "companyId": "company-id",
  "requestedCompany": "Example Infrastructure, LLC",
  "decision": "APPROVED",
  "proposalHash": "<proposal hash>",
  "companySnapshotHash": "<company snapshot hash>",
  "sourceDatabaseSnapshotHash": "<database snapshot hash>",
  "approvedBy": "User",
  "approvedAt": "2026-08-03T16:00:00.000Z"
}
```

Immediately before any separate apply transaction, recompute both current hashes and validate the binding:

```sh
npx tsx scripts/scorecard-refresh/validate-approval.ts \
  --run-dir audits/scorecard-refresh/2026-08-03 \
  --approval /absolute/path/approval.json \
  --current-company-snapshot-hash CURRENT_COMPANY_HASH \
  --current-source-database-snapshot-hash CURRENT_DATABASE_HASH
```

This command is read-only. It rejects tampered proposals, mismatched approvals, blocked proposals, and any snapshot that changed after approval. The future target-pinned apply command must call the same binding assertion before writing and must advance `APPLYING` → `VERIFYING` → `COMPLETED` before another company can start.

## Artifact layout

```text
audits/scorecard-refresh/2026-08-03/
  manifest.json
  run-input.json
  contexts/          # immutable task inputs and execution attestation
  prompts/           # full one-company worker prompts
  raw/               # initial and optional repair responses
  repairs/           # at most one generated repair prompt per company
  validation/        # machine-readable validation outcomes
  proposals/         # strict JSON plus deterministic proposalHash
  reports/           # trusted Markdown review packets
  worker-reports/    # Markdown returned by the research worker
  approvals/         # reserved for externally recorded individual approvals
```

Run the focused suite with:

```sh
npx vitest run scripts/scorecard-refresh/*.test.ts
npx eslint scripts/scorecard-refresh --ext .ts
```
