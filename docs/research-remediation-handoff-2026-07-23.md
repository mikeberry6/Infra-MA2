# Research Remediation Handoff — 2026-07-23

## Scope and safety

This handoff is bound to:

- pull request [#223](https://github.com/mikeberry6/Infra-MA2/pull/223);
- source head `a74b44489d6dd0a55fdf3e7b89466b26f2b84a1d`;
- pull-request merge revision `9647cebd6b7b00a77d309fe9d0a6ece63c947790`;
- validation run [30056009981](https://github.com/mikeberry6/Infra-MA2/actions/runs/30056009981);
- artifact `validation-evidence-30056009981` (artifact ID `8582844857`, digest `sha256:d08396707ccb56a6e102ca8e2d17a52713aa8c564daeb154a0d90d364bb965e1`, retained through 2026-08-23T00:27:20Z); and
- the isolated validation database used by that run.

The packet is review-only. It contains no Research decisions, grants no permission to publish or merge records, and has not been applied to Preview or Production. Candidate order is deliberately neutral.

This packet supersedes every earlier validation packet, including run 30052780591. The workload counts and 17 records without a citation candidate are unchanged from that immediate predecessor, while canonical-company review is now 18 clusters covering 38 rows. Generated timestamps, snapshots, opaque rows, and template digests must be reviewed only from the current artifact.

Run 30056009981 concluded **failure solely because the three strict publication/data-integrity checks remained blocking**. Its static, browser, visual, failure-state, persistence, migration, and secret-safety partitions passed. It is an evidence-bearing failed validation run, not a passing release gate. This packet attests only source head `a74b44489d6dd0a55fdf3e7b89466b26f2b84a1d` and merge revision `9647cebd6b7b00a77d309fe9d0a6ece63c947790`; it does not attest any later pull-request commit, including this documentation-only descendant.

Download the exact retained evidence into a new temporary directory:

```bash
review_dir=$(mktemp -d /tmp/infrasight-research-review.XXXXXX)
gh run download 30056009981 \
  --name validation-evidence-30056009981 \
  --dir "$review_dir"
```

Verify the five input templates before review:

| Template | SHA-256 |
| --- | --- |
| `company-merge-approval-template.json` | `bea72ad815179255e5e3ab324000eb34fa27980845e885ae8bc8e11d4d3993aa` |
| `ownership-fund-link-approval-template.json` | `5bbe296c32ce04c2e673b7bdf76bafe612482fc1e67863fc69ea3fb8f5a45ad7` |
| `fund-primary-source-approval-template.json` | `6c8863c6bc12ef415ffd67da991d21938a2674858399a7a5bfa3b0fa040452f6` |
| `deal-seller-disclosure-approval-template.json` | `b2ef10578a82d042a307710be1ede510561c18c8f3f065c47ef549b5efb8fc9d` |
| `primary-citation-approval-template.json` | `ee4b33298b051547566aba91cad1ad680007da07655753f8b31de16580de8795` |

```bash
shasum -a 256 "$review_dir"/*approval-template.json
```

If any digest differs, stop and obtain the exact artifact again. Do not combine templates from different validation runs.

## Review order and current workload

Review and commit each stage independently in this order. Regenerate downstream templates whenever an earlier stage changes entity identity or candidate evidence.

1. **Canonical companies:** 18 fuzzy clusters covering 38 candidate records. Sixteen clusters have two candidates and two have three. Research must choose the survivor and retired IDs for each approved merge or explicitly remove a rejected/deferred cluster, following the template instructions.
2. **Ownership-to-Fund links:** 4 records, all involving a `TPG Rise Climate` vehicle linked to `TPG Rise Climate II`. The current template contains no exact-name Fund candidate. Research may approve only an allowed `UNLINK`, or correct the underlying Fund/vehicle evidence through the editorial workflow and regenerate; it must not force an inexact `LINK`.
3. **Fund primary sources:** 150 Funds. Every item has at least one existing HTTP(S) candidate; 25 have one candidate and 125 require a choice among multiple candidates. Lexical URL order is not a quality ranking.
4. **Seller treatment:** 194 Deals. Three have no source evidence in the current snapshot: `INF-2026-080` Reload, `INF-2026-082` Andion CH4 Renewables, and `INF-2026-088` Ori Industries. Research must add evidence and regenerate before deciding those rows. Whenever evidence names a seller, add that seller through the editorial interface instead of marking it not disclosed.
5. **Primary citations:** 1,543 records—352 Deals and 1,191 Companies. The current pre-merge packet has 17 rows with no candidate citation:
   - Company: Extenet. This record is also in a pending canonical merge cluster.
   - Deals: `INF-2026-080` through `INF-2026-095` inclusive.

   The [2026-07-23 primary-source research proposal](./primary-source-research-proposals-2026-07-23.md) records candidate research, remaining evidence gaps, and the Deal facts that require correction before citation approval. Supplemental research found first-party event evidence for 15 of the 16 Deal rows; `INF-2026-095` remains without a reliable public primary transaction source. Extenet has first-party identity evidence but remains merge-dependent. These findings do not populate the generated template or reduce its formal 17-row gap. The document remains a proposal, not an approval. Add accepted sources and corrections through the editorial workflow, then regenerate. Never turn candidate array position into an automatic selection rule.
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
