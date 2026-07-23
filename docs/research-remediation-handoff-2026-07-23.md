# Research Remediation Handoff — 2026-07-23

## Scope and safety

This handoff is bound to:

- pull request [#223](https://github.com/mikeberry6/Infra-MA2/pull/223);
- source head `4fee1d933390bd349cae9952809982491eafe257`;
- validation run [30034397931](https://github.com/mikeberry6/Infra-MA2/actions/runs/30034397931);
- artifact `validation-evidence-30034397931`; and
- the isolated validation database used by that run.

The packet is review-only. It contains no Research decisions, grants no permission to publish or merge records, and has not been applied to Preview or Production. Candidate order is deliberately neutral.

Download the exact retained evidence into a new temporary directory:

```bash
review_dir=$(mktemp -d /tmp/infrasight-research-review.XXXXXX)
gh run download 30034397931 \
  --name validation-evidence-30034397931 \
  --dir "$review_dir"
```

Verify the five input templates before review:

| Template | SHA-256 |
| --- | --- |
| `company-merge-approval-template.json` | `1209b790617ef91a01067532b3a487eb44873a526b6222a7523e51d07ec22b54` |
| `ownership-fund-link-approval-template.json` | `19b0817df3063c55f6f398073b89efbc6905c33e2f771c552cc0b84f2b476cf1` |
| `fund-primary-source-approval-template.json` | `66c8afd6f22bd4041128c44df20eb413ea9809672a43fd521ff638bfdb0c6643` |
| `deal-seller-disclosure-approval-template.json` | `a1ee4f9ca075ab19c015f209cafc778c0b665cd627ef7076a45971772327a429` |
| `primary-citation-approval-template.json` | `33882de48e3c0af5ba56ea7b9addc81e9088506704c4cb19e665ea676af1e89a` |

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
