# Reviewed census promotion status

This directory contains the deterministic promotion preflight for the reviewed
North American fund census. It does not publish funds, mutate the production
database, or change portfolio ownership links.

## Locked implementation scope

- Baseline: 179 funds
- Included additions: 21
- Excluded sub-threshold additions: 37
- Existing corrections: 88
- Final desired count after all batches: 200
- Existing strategy changes suppressed: 14
- Evergreen field changes suppressed: 12
- Ownership-linked renames deferred: 9, covering 64 reviewed references
- Batch sizes: 17, 19, 20, 20, 20, and 13

The generated `promotion-plan.json` is the canonical policy result.
`ownership-rename-deferrals.json` is review-only and proposes no
`OwnershipPeriod` mutation. Each batch directory contains its immutable
`change-set.json` and a `readiness.json` preflight.

## Release status

No batch is ready for an executable `FundRefreshProposal` yet.

- The foundation audit has 52 baseline errors: 29 missing evidence records,
  14 noncanonical manager names, and 9 invalid vintages.
- Current `main` contains 63 of the 64 reviewed exact ownership references;
  the missing `CDPQ Infrastructure` reference is an explicit drift blocker.
- Candidate preflight reports 62 blocking contract issues across the six
  batches: 34 unsupported fields, 9 missing fund-specific primary support,
  7 unclassified numeric size displays, 5 Form D capital-semantics blockers,
  4 invalid vintages, and 3 invalid status transitions.
- A trusted successful default-branch live audit with ownership snapshots has
  not been supplied.
- Every currently raising vehicle still requires explicit review in each
  proposal, and every cited source must be reopened and classified.
- GPT-5.6 Pro and human review remain mandatory.

The promotion command refuses to materialize a batch without a trusted live
audit and refuses candidates that fail the executable refresh contract.
Resolve the foundation audit and the selected batch's readiness report before
generating the five required proposal artifacts or opening a data PR.
