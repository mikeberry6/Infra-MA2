# Canonical company cleanup runbook

## Purpose

Consolidate reviewed duplicate company rows without losing ownership,
milestone, management, citation, news-mention, or deep-link history. Distinct
lookalike records remain separate through explicit normalization decisions.

## Fixed inputs

- Approval file:
  `audits/approvals/company-canonical-cleanup-2026-07-28.json`
- Reviewed SHA-256:
  `bc4b651ecff5117eff71adbf9aff2951db934a46e09b0b59d5b05054eb978fc8`
- Runner: `scripts/merge-duplicate-companies.ts`

Never edit an approval in place. Regenerate and re-review a new dated artifact
if the runner reports stale evidence.

## Release order

1. Create a fresh Neon backup branch from production and record its branch ID.
2. Apply the additive `CompanyRedirect` / `AuditEvent` migration to production.
3. Run the hash-bound cleanup preflight against production.
4. Apply the cleanup once and immediately run it again to confirm an
   idempotent no-op.
5. Verify zero duplicate clusters, 19 redirects, 21 cleanup audit events, and
   sampled retired links.
6. Deploy the redirect-aware application code. Its versioned cache keys avoid
   stale pre-cleanup company lists and counts.
7. Smoke-test `/portfolio`, search, and at least one retired `focus` URL.

This order keeps the existing view-layer grouping active until the database is
canonical, then deploys code that reads physical canonical rows and redirects.

## Preflight

Set `DATABASE_URL` to the intended target without printing it. Then run:

```sh
npm run companies:cleanup -- \
  --approval-file=audits/approvals/company-canonical-cleanup-2026-07-28.json \
  --approval-sha256=bc4b651ecff5117eff71adbf9aff2951db934a46e09b0b59d5b05054eb978fc8
```

Expected initial result:

- `pendingMerges: 18`
- `pendingKeepSeparate: 3`
- `unchanged: 0`

Any other result requires investigation before applying.

## Apply

In addition to `DATABASE_URL`, set:

- `EXPECTED_DATABASE_HOST` to the exact target host.
- `EXPECTED_DATABASE_NAME` to the exact target database.
- `FORBIDDEN_DATABASE_HOST` to the other environment's host.
- `TARGET_DATABASE` to `validation` or `production`.
- `RELEASE_SHA` to the reviewed commit.
- `MUTATION_OPERATOR` and `MUTATION_REASON` for audit metadata.

Then add `--apply` to the preflight command. Do not weaken the exact-target
guard; it prevents a validation command from reaching production and vice
versa.

## Verification

The first production application should report:

- `appliedMerges: 18`
- `appliedKeepSeparate: 3`
- `deletedCompanies: 19`

Run the exact command again. It must report:

- `idempotent: true`
- `unchanged: 21`
- zero applied changes and zero relation changes.

Also verify:

- all redirect targets exist;
- no redirect targets another redirect;
- no retired ID remains in `Company`;
- no ownership, milestone, management, citation, or news-mention row references
  a retired ID;
- `Robson Utilities Portfolio`, `JW Water Holdings`, `Puget Energy`,
  `Puget Sound Energy`, `MedCraft Medical Outpatient Portfolio`, and
  `Montecito Medical Outpatient Portfolio` all remain separately visible.

## Rollback

The pre-cleanup Neon branch is the authoritative database rollback point.
Application rollback uses the previous Vercel deployment. If a postcondition
fails inside the cleanup, the serializable transaction rolls back
automatically; do not attempt a partial manual continuation.

Do not delete the backup branch until production data, redirect behavior,
search, and the portfolio drawer have been verified.
