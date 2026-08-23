# Portfolio fund attribution

This workflow assigns a fund-attribution state to every active portfolio-company ownership row while keeping the curated fund database independent.

## Classification

- `DISCLOSED`: public or reviewed supplemental evidence identifies a named fund or vehicle.
- `INFERRED`: the fund is an educated estimate based on manager match, investment timing, mandate, vehicle-name overlap, and ranked alternatives. Inference is capped at Medium confidence and is displayed as **Estimated**.
- `DIRECT_PROGRAM`: evidence indicates a balance-sheet, proprietary-capital, pension, sovereign, SMA, or other direct/program investment rather than a commingled fund.
- `UNRESOLVED`: there is no credible existing-fund candidate.

Attribution never creates or updates a Fund record. A disclosed name outside the curated database stays unlinked and enters the separate approximately US$1bn fund-addition review.

## Generate and review

```sh
npm run portfolio:fund-attribution -- \
  --as-of=2026-08-16 \
  --production-snapshot=audits/portfolio-fund-attribution/2026-08-16/production-snapshot.json \
  --force
```

The command writes an immutable review set under `audits/portfolio-fund-attribution/<date>/`:

- `production-snapshot.json`: the immutable read-only snapshot of published companies, active ownership rows, and available live fund names.
- `ledger.json` and `ledger.csv`: every active production ownership row, evidence, rationale, ranked alternatives, and classification.
- `summary.md`: coverage and policy counts.
- `apply-manifest.json`: the exact production mutations, bound to ownership IDs and the source-snapshot hash, including existing-fund links and zero fund creates/updates.
- `seed-ledger.json` and `seed-apply-manifest.json`: the equivalent evaluated-seed restoration artifacts, kept separate because seed and production have different record sets.

Generation is deterministic except for the informational `generatedAt` timestamp. `ledgerSha256` excludes that timestamp; `manifestSha256` binds the complete apply payload.

## Promote to seed restoration

```sh
npm run portfolio:fund-attribution:promote -- \
  --manifest=audits/portfolio-fund-attribution/2026-08-16/seed-apply-manifest.json \
  --manifest-sha256=<manifest sha256> \
  --force=true
```

This creates `prisma/seed-data/ownership-attributions.manifest.json`. The seed runner requires a one-to-one match with every evaluated active owner and resolves only funds already present in `prisma/seed-data/funds.ts`.

When an approved PortCo batch changes active owner identities, reconcile this
restoration manifest with an explicit hash-bound change spec. The reconciliation
preserves every reviewed attribution outside the batch, rejects stale source
lineage, and fails unless the result matches every evaluated active seed owner
exactly once:

```sh
npm run portfolio:fund-attribution:reconcile-seed -- \
  --source=prisma/seed-data/ownership-attributions.manifest.json \
  --spec=<batch seed-attribution reconciliation spec> \
  --output=prisma/seed-data/ownership-attributions.manifest.json \
  --artifact=<batch reconciliation receipt> \
  --force=true
```

## Approval and apply

Create an approval bound to the exact manifest:

```sh
npm run portfolio:fund-attribution:approve -- \
  --mode=apply \
  --manifest=audits/portfolio-fund-attribution/2026-08-16/apply-manifest.json \
  --manifest-sha256=<manifest sha256> \
  --approver=<reviewer> \
  --approved-at=<ISO-8601 timestamp> \
  --output=audits/portfolio-fund-attribution/2026-08-16/approval.json
```

Validate artifacts without a database:

```sh
npm run portfolio:fund-attribution:apply -- \
  --manifest=<manifest> \
  --manifest-sha256=<manifest sha256> \
  --production-snapshot=<production snapshot> \
  --approval=<approval> \
  --approval-sha256=<approval sha256> \
  --validate-only=true
```

The protected GitHub workflow `.github/workflows/portfolio-fund-attribution-apply.yml` is the production path. The schema workflow first applies the additive columns, checks, and replacement identity index, then the guarded `finalize-ownership-period-identity.ts` cutover verifies both index definitions before removing the superseded three-field index. After that schema stage, the attribution workflow binds protected `main`, the merged PR, required build, Vercel production deployment, database target, exact artifacts, and cache endpoint; then it dry-runs before one transactional apply and verifies public API samples after revalidation.

When more than one independently reviewed correction is released on the same date, preserve earlier immutable evidence under the date root and place each later package at `audits/portfolio-fund-attribution/YYYY-MM-DD/scoped/<correction-key>/`. The protected workflow accepts only that constrained nested layout and still requires the snapshot, manifest, and approval to be colocated.

## Rollback

The apply receipt contains the exact before/after state for every ownership row. Create a receipt-bound rollback approval and use the rollback command only if the public verification or a post-release integrity check fails:

```sh
npm run portfolio:fund-attribution:approve -- \
  --mode=rollback \
  --receipt=<apply receipt> \
  --receipt-sha256=<receipt sha256> \
  --approver=<reviewer> \
  --approved-at=<ISO-8601 timestamp> \
  --output=<rollback approval>

npm run portfolio:fund-attribution:rollback -- \
  --receipt=<apply receipt> \
  --receipt-sha256=<receipt sha256> \
  --approval=<rollback approval> \
  --approval-sha256=<rollback approval sha256> \
  --apply=true \
  --write-token=ROLLBACK_REVIEWED_PORTFOLIO_FUND_ATTRIBUTION \
  --output=<rollback receipt>
```

Rollback refuses to proceed if any affected ownership row has changed since the apply receipt was written.
