# Research Remediation Handoff — 2026-07-23

## Scope and safety

This handoff is bound to:

- pull request [#223](https://github.com/mikeberry6/Infra-MA2/pull/223);
- source head `2141b01053f6c858bbee54aa9e36790c774775e6`;
- pull-request merge revision `ccd863693e5b51fc76602817df86e6dd2e4c0bfe`;
- validation run [30040590884](https://github.com/mikeberry6/Infra-MA2/actions/runs/30040590884);
- artifact `validation-evidence-30040590884` (artifact ID `8577168817`, digest `sha256:51d80c48cb86474232a1822e49176e7bbf84df48b9a7db013b105106c8414267`, retained through 2026-08-22); and
- the isolated validation database used by that run.

The packet is review-only. It contains no Research decisions, grants no permission to publish or merge records, and has not been applied to Preview or Production. Candidate order is deliberately neutral.

Download the exact retained evidence into a new temporary directory:

```bash
review_dir=$(mktemp -d /tmp/infrasight-research-review.XXXXXX)
gh run download 30040590884 \
  --name validation-evidence-30040590884 \
  --dir "$review_dir"
```

Verify the five input templates before review:

| Template | SHA-256 |
| --- | --- |
| `company-merge-approval-template.json` | `6120d2f5186b59144615f75714e64425d4880304682d5c4b442533500f8194e3` |
| `ownership-fund-link-approval-template.json` | `646e1d58354fa6df84f0f221cb39cdfae3e47316dec08865ded944a634a32376` |
| `fund-primary-source-approval-template.json` | `da8f03537ddf1c6009a0c23b4256a08859de6f6f6663f57075aa00f1c9b55af3` |
| `deal-seller-disclosure-approval-template.json` | `34edb970103786d5358c12002598e709a47cd75c4e7c1f4ed9cff5e8f07a3749` |
| `primary-citation-approval-template.json` | `2268602d56f08be8d74b7b9aeb328291f19b1253bc304d5ddd367298cc65c457` |

```bash
shasum -a 256 "$review_dir"/*approval-template.json
```

If any digest differs, stop and obtain the exact artifact again. Do not combine templates from different validation runs.

## Review order and current workload

Review and commit each stage independently in this order. Regenerate downstream templates whenever an earlier stage changes entity identity or candidate evidence.

1. **Canonical companies:** 21 fuzzy clusters covering 43 candidate records. Twenty clusters have two candidates and one has three. Research must choose the survivor and retired IDs for each approved merge or explicitly remove a rejected/deferred cluster, following the template instructions.
2. **Ownership-to-Fund links:** 4 records, all involving a `TPG Rise Climate` vehicle linked to `TPG Rise Climate II`. The current template contains no exact-name Fund candidate. Research may approve only an allowed `UNLINK`, or correct the underlying Fund/vehicle evidence through the editorial workflow and regenerate; it must not force an inexact `LINK`.
3. **Fund primary sources:** 150 Funds. Every item has at least one existing HTTP(S) candidate; 25 have one candidate and 125 require a choice among multiple candidates. Lexical URL order is not a quality ranking.
4. **Seller treatment:** 194 Deals. Three have no source evidence in the current snapshot: `INF-2026-080` Reload, `INF-2026-082` Andion CH4 Renewables, and `INF-2026-088` Ori Industries. Research must add evidence and regenerate before deciding those rows. Whenever evidence names a seller, add that seller through the editorial interface instead of marking it not disclosed.
5. **Primary citations:** 1,543 records—352 Deals and 1,191 Companies. The current pre-merge packet has 17 rows with no candidate citation:
   - Company: Extenet. This record is also in a pending canonical merge cluster.
   - Deals: `INF-2026-080` through `INF-2026-095` inclusive.

   The [2026-07-23 primary-source research proposal](./primary-source-research-proposals-2026-07-23.md) records verified first-party candidates and the Deal facts that require correction before citation approval. It remains a proposal, not an approval. Add accepted sources and corrections through the editorial workflow, then regenerate. Never turn candidate array position into an automatic selection rule.
6. **Historical weekly coverage:** 5 published-deal gaps remain for the 2026-07-03 issue. Do not edit that historical email. Run the weekly synchronization as a dry run on an isolated database, create only reviewable proposals through the guarded apply path, and review each proposed Deal individually before publication.

The current exact-name duplicate count and invalid non-HTTP source count are both zero; those checks need no Research action.

## Approval outputs

After completing a stage, preserve the template structure and embedded snapshots exactly, fill only the documented decision fields, set `reviewedBy` and `reviewedAt`, and commit the reviewed file to its canonical path:

| Stage | Canonical reviewed path |
| --- | --- |
| Company merges | `audits/approvals/company-merges.json` |
| Ownership links | `audits/approvals/ownership-fund-links.json` |
| Fund primary sources | `audits/approvals/fund-primary-sources.json` |
| Seller treatment | `audits/approvals/deal-seller-disclosures.json` |
| Primary citations | `audits/approvals/primary-citations.json` |

Compute the SHA-256 from the exact committed bytes. A later edit requires a new digest and renewed review. The protected validation workflow applies approved files to the isolated database in order and reruns every strict gate; do not invoke a production apply command directly.

## Acceptance evidence

Research remediation is complete only when a fresh protected validation run reports all of the following:

- zero published Deals or Companies without an explicit primary citation;
- zero published Funds without a reviewed HTTP(S) primary source;
- zero published Deals with legacy-unreviewed seller treatment;
- zero ownership-to-Fund integrity issues;
- zero public canonical-company clusters;
- zero missing published weekly-briefing Deals; and
- audit evidence tying every applied decision to its reviewer, reviewed file digest, release SHA, and isolated database target.
