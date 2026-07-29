# Live company canonicalization cutover — 2026-07-29

## Target and rollback

- Vercel Production currently reads Neon branch
  `br-sparkling-firefly-ambnknjv`
  (`preview-codex-infra-90-day-clean`).
- The exact unpooled endpoint host is
  `ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech`.
- The pre-change rollback branch is
  `br-morning-pond-am21z8nj`
  (`pre-company-canonical-live-20260729-0350`).
- The rollback branch expires at `2026-08-05T03:50:00Z`. Do not delete it
  before the application and data verification in this runbook is complete.

This live branch contains five deals and 29 funds that are absent from the
current Neon primary branch. Do not repoint Vercel to primary as part of this
cleanup; branch reconciliation is a separate data-migration project.

## Fixed approval

- Approval file:
  `audits/approvals/company-canonical-cleanup-live-2026-07-29.json`
- SHA-256:
  `c01e449e88aee4f700c280efb710576f1c4580a51c6666d6c6c13bbbabe8148f`
- Decision set: `vercel-live-2026-07-29`
- Reviewed scope: all 17 detected duplicate clusters
- Outcomes: 14 merges and three keep-separate normalizations

Never edit the approval in place. Any candidate or relation change makes the
snapshot stale and requires a new dated approval.

## Migration baseline

The live branch already has `CompanyRedirect` and `AuditEvent`, created through
its earlier trust-foundations migration lineage. Their columns, defaults,
timestamp precision, primary keys, foreign keys, referential actions, and
indexes exactly match
`20260729031000_company_canonical_cleanup`.

Do not execute that migration's `CREATE TABLE` statements against this branch;
they would fail because the objects already exist. After verifying the exact
schema match, record the repository migration as applied with:

```sh
npx prisma migrate resolve \
  --applied 20260729031000_company_canonical_cleanup
```

This baseline does not reconcile the branch's other historical migration
differences. That broader lineage work remains separate.

## Preflight and apply

The read-only preflight must report:

- `pendingMerges: 14`
- `pendingKeepSeparate: 3`
- `unchanged: 0`

For the write, retain the exact database-target guard:

- `EXPECTED_DATABASE_HOST`:
  `ep-soft-feather-am7a9o9j.c-5.us-east-1.aws.neon.tech`
- `EXPECTED_DATABASE_NAME`: `neondb`
- `FORBIDDEN_DATABASE_HOST`:
  `ep-dawn-sky-amaxdqe4.c-5.us-east-1.aws.neon.tech`
- `TARGET_DATABASE`: `production`
- `RELEASE_SHA`: the committed approval and runner revision

The first application must report 14 applied merges, three keep-separate
updates, and 14 deleted companies. An immediate replay must report
`idempotent: true`, `unchanged: 17`, and no writes.

## Verification

Verify all of the following before releasing the rollback branch:

- 1,153 physical company rows remain.
- no heuristic duplicate cluster remains;
- 14 redirects and 17 cleanup audit events exist;
- every redirect resolves to a published canonical company;
- no retired company ID or retired relation remains;
- the six intentionally distinct normalized records remain visible;
- a retired company ID returns the canonical detail envelope through the
  deployed portfolio API;
- `/portfolio` and cross-database search render successfully.

The application caches company list and detail reads for up to 300 seconds.
Use a new deployment or allow that interval before declaring a stale response
to be a data failure.
