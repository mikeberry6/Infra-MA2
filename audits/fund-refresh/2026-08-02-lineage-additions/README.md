# Same-lineage North American fund additions

This release materializes the 15 approximately $1B-plus additions that are genuine predecessors, successors, or same-series peers of funds already present in the 179-fund website baseline.

## Result

- Baseline: 179 funds / 87 managers
- Added: 15 funds / 0 new managers
- Desired manifest: 194 funds / 87 managers
- Affected share: 8.38%, below the protected refresh workflow's 10% cap
- OwnershipPeriod changes: none
- Existing-fund changes: none

The stable IDs from the reviewed census are preserved, including gaps for the six candidates excluded by the narrower lineage rule.

## Material corrections to the earlier draft

- DigitalBridge Partners II uses the official $8.3B close and a 2020 fundraising vintage.
- DigitalBridge Partners I uses the current DigitalBridge legal/display name, $4.059B commitments, and a 2018 vintage.
- InfraRed Infrastructure Fund VI uses the disclosed above-$1B combined commitment figure; the unsupported $1.8B draft figure is not used.
- Stonepeak Infrastructure Fund IV is classified Value-Add with a 2020 vintage.
- BlackRock Global Renewable Power Fund III is classified Value-Add / Greenfield from the institutional investment memorandum.
- CI II and CI III now have complete native-currency amount, basis, and as-of metadata. Their source pages disclose only the close month, so the machine-readable dates are normalized to month-end.
- Dead BlackRock newsroom links were replaced with opened copies of the issuer-authored releases plus institutional corroboration.

## Artifacts

- `implementation-policy.json` — selected IDs, exclusions, expected counts, and release gates
- `candidate-set.json` — immutable 15-candidate CREATE set
- `field-diff.csv` — field-level create after-images and supporting sources
- `source-health.json` — reopened evidence inventory
- `ownership-impact.json` — zero-mutation ownership impact for every candidate
- `scope-coverage.json` — selected managers and excluded reviewed candidates
- `pro-review.md` — mandatory review packet for all 15 creates
- `readiness.json` — explicit production blockers
- `manifest-audit.json` / `baseline-manifest-audit.json` — offline audit comparison

## Release status

The Prisma seed manifests and generated fund-source audit now contain all 15 additions. The candidate and evidence contracts pass, all 15 additions have normalized evidence, and the offline audit introduces no findings beyond the 52 pre-existing baseline findings.

Production apply is intentionally not authorized. A trusted live database audit, GPT-5.6 Pro review tied to the final PR head, and human approval are required before creating an executable `FundRefreshProposal` or using the protected apply workflow.
