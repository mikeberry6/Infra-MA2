# Research Remediation Handoff — 2026-07-23

## Scope and safety

This handoff is bound to:

- pull request [#223](https://github.com/mikeberry6/Infra-MA2/pull/223);
- source head `ebc8c88a419b22dee4e813de6152403d8d32b804`;
- pull-request merge revision `822e81c1a418dc57829f24292aad19dceafaab73`;
- validation run [30046462334](https://github.com/mikeberry6/Infra-MA2/actions/runs/30046462334);
- artifact `validation-evidence-30046462334` (artifact ID `8579420097`, digest `sha256:88fee1e35a2ecdc45910ab55009db9dc20a5a16b19cf7db6d79072c125c6e624`, retained through 2026-08-22T21:35:28Z); and
- the isolated validation database used by that run.

The packet is review-only. It contains no Research decisions, grants no permission to publish or merge records, and has not been applied to Preview or Production. Candidate order is deliberately neutral.

This packet supersedes the earlier run-30040590884 packet. The workload counts and 17 records without a candidate are unchanged, but generated timestamps, snapshots, opaque citation rows, and template digests must be reviewed only from the current artifact.

Run 30046462334 concluded **failure solely because the three strict publication/data-integrity checks remained blocking**. Its static, browser, visual, failure-state, persistence, migration, and secret-safety partitions passed. It is an evidence-bearing failed validation run, not a passing release gate. This packet attests only source head `ebc8c88a419b22dee4e813de6152403d8d32b804` and merge revision `822e81c1a418dc57829f24292aad19dceafaab73`; it does not attest any later pull-request commit, including documentation-only descendants.

Download the exact retained evidence into a new temporary directory:

```bash
review_dir=$(mktemp -d /tmp/infrasight-research-review.XXXXXX)
gh run download 30046462334 \
  --name validation-evidence-30046462334 \
  --dir "$review_dir"
```

Verify the five input templates before review:

| Template | SHA-256 |
| --- | --- |
| `company-merge-approval-template.json` | `a5574806ad344f7b795295e47c4f402251f45a19c2ba42b49cd37eb610ae80e2` |
| `ownership-fund-link-approval-template.json` | `24f87bee2b81e6379bc5adc7d8b4f1fcb411df530f10d544360d864367eb7ea4` |
| `fund-primary-source-approval-template.json` | `fd3fdfe10a6eb294769c083c9de5d62c58b70bbf830788c5020d4872fe163aaa` |
| `deal-seller-disclosure-approval-template.json` | `ade3e27a912e440f3a9cedf7b1f1f1dfd996ba6bab5021ceae99277ec042d138` |
| `primary-citation-approval-template.json` | `7176b8a3dcfbdcd9fbadb76778a2cb2ee68d884f85770a7d2446496a76465e34` |

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

   The [2026-07-23 primary-source research proposal](./primary-source-research-proposals-2026-07-23.md) records candidate research, remaining evidence gaps, and the Deal facts that require correction before citation approval. It remains a proposal, not an approval. Add accepted sources and corrections through the editorial workflow, then regenerate. Never turn candidate array position into an automatic selection rule.
6. **Historical weekly coverage:** 5 published-deal gaps remain for the 2026-07-03 issue. Do not edit that historical email. Run the weekly synchronization as a dry run on an isolated database, create only reviewable proposals through the guarded apply path, and review each proposed Deal individually before publication.

The current duplicate exact name-and-country key count and invalid non-HTTP source count are both zero; those checks need no Research action. Exact names may still repeat across different country strings and remain subject to the fuzzy canonical-company review.

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
