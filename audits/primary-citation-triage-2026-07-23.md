# Primary-Citation Triage Audit — 2026-07-23

> **REVIEW-ONLY CONTROL — NO CITATION APPROVAL OR DATA MUTATION**
>
> This audit measures the review queue in one exact retained validation artifact. It does not select a citation, approve a source, rank candidate quality, authorize a Company merge, create an approval file, or change a Deal, Company, source, citation, database row, or publication state. A URL's presence in the template is evidence of review workload only; it is not evidence that the page is authoritative, relevant, current, reachable, or sufficient for primary designation.

## Exact artifact binding

| Field | Exact value |
|---|---|
| GitHub Actions run | [`30048515397`](https://github.com/mikeberry6/Infra-MA2/actions/runs/30048515397) |
| Source head | `bf05e5d582d795037c098ffb0fabb6b4e7705d20` |
| Artifact name | `validation-evidence-30048515397` |
| Artifact ID | `8580178919` |
| Artifact digest | `sha256:8009e8e7870ec4d06cb862e9d4a292d923af42019ca115e23423d21b7dd15694` |
| Template file | `primary-citation-approval-template.json` |
| Template SHA-256 | `aee08fd7b799e62446acea3416bd4d20544f7df6700ac8c95d9aba56446236da` |
| Template `generatedAt` | `2026-07-23T22:04:08.630Z` |
| Template schema | `schemaVersion: 1` |
| Template scope | `PUBLISHED_DEAL_AND_COMPANY_MISSING_PRIMARY` |

The exact template contains 1,543 review items: 352 Deals and 1,191 Companies. All 1,543 `selectedCitationId` fields are `null`, `reviewedBy` and `reviewedAt` are `null`, and none of the 18,649 candidate rows is marked `currentlyPrimary`. Candidate order is an opaque citation-ID order, not a recommendation.

This audit is therefore bound only to the artifact above. Counts must be regenerated if the source head, artifact, template bytes, database state, or candidate-generation logic changes.

## Queue size and evidence density

The template contains many citation records that reuse the same exact URL for the same item. To avoid overstating source diversity, this audit distinguishes:

- **Candidate/citation uses:** candidate rows in the template. Each has its own citation ID, but multiple rows can point to the same URL.
- **Per-item unique URL uses:** one exact URL counted once within each Deal or Company item. The same URL may still be counted for another item.
- **Globally unique URLs:** one exact URL counted once across the full Deal or Company population.
- **Repeated candidate uses:** candidate rows beyond the per-item unique-URL count. These can reflect different citation purposes or evidence labels, but they are not independent web sources.

| Entity type | Items | Candidate/citation uses | Per-item unique URL uses | Globally unique URLs | Repeated candidate uses within items | Items containing a repeated URL |
|---|---:|---:|---:|---:|---:|---:|
| Deal | 352 | 836 | 343 | 340 | 493 | 225 |
| Company | 1,191 | 17,813 | 4,906 | 4,318 | 12,907 | 1,157 |
| **Total** | **1,543** | **18,649** | **5,249** | **4,572** | **13,400** | **1,382** |

The global total is not the sum of the two entity subtotals because 86 exact URLs appear in both Deal and Company candidates: `340 + 4,318 - 86 = 4,572`.

### Evidence-density risk

- The full queue has 3.55 candidate rows per per-item unique URL use (`18,649 / 5,249`). Deals have 2.44 and Companies have 3.63.
- Repeated exact URLs account for 13,400 of 18,649 candidate rows, or 71.9%. The repetition is especially concentrated in Companies: 1,157 of 1,191 Company items contain at least one repeated URL.
- A reviewer who treats every candidate ID as independent corroboration will materially overstate evidence breadth.
- A reviewer who mechanically collapses every repeated URL could also lose meaningful citation-purpose distinctions. Two citation records can use the same page for different facts or evidence purposes.
- Exact-URL uniqueness is not semantic independence. Locale variants, mirrored releases, syndicated copies, redirects, and URL aliases may contain the same underlying announcement.
- Conversely, two pages on the same host can contain different first-party perspectives or support different facts.

The safe rule is to compare the actual page, issuer, transaction party, entity match, publication date, supported fact, evidence purpose, and any conflicts. Neither candidate count nor URL count is a quality score.

## Deal queue

### Exact Deal unique-URL distribution

| Unique candidate URLs on one Deal | Deal items | Share of Deal queue |
|---:|---:|---:|
| 0 | 16 | 4.5% |
| 1 | 329 | 93.5% |
| 2 | 7 | 2.0% |
| **Total** | **352** | **100.0%** |

The 329 one-URL Deals are not automatically low-effort approvals. Many have multiple citation IDs mapped to the same page, and a sole candidate can still be secondary, misclassified, stale, entity-mismatched, or insufficient for the Deal's full fact pattern.

### Sixteen Deals with no candidate

These items cannot be completed from the bound template because `candidates` is empty:

| Deal ID | Target |
|---|---|
| `INF-2026-080` | Reload |
| `INF-2026-081` | Cleanwatts |
| `INF-2026-082` | Andion CH4 Renewables |
| `INF-2026-083` | Cella Dati Biomethane Plant |
| `INF-2026-084` | HyCC |
| `INF-2026-085` | 83MW Indian Solar Energy Projects |
| `INF-2026-086` | Masdar Portuguese Wind Portfolio |
| `INF-2026-087` | atNorth |
| `INF-2026-088` | Ori Industries |
| `INF-2026-089` | Sandy Farms & Eternal Rings Data Centers |
| `INF-2026-090` | Skellefteå Data Center Site |
| `INF-2026-091` | Digital Sense |
| `INF-2026-092` | Macquarie AirFinance |
| `INF-2026-093` | Lower Lakes Towing & 6 Canadian-flagged Lakers |
| `INF-2026-094` | 321 Precision Conversions |
| `INF-2026-095` | DTG Recycle |

The existing [Primary-Source Research Proposals — 2026-07-23](../docs/primary-source-research-proposals-2026-07-23.md) and [Primary Citation Source-Gap Review — 2026-07-22](primary-citation-source-gap-review-2026-07-22.md) contain review-only research for this set. They are bound to earlier evidence states and do not populate this template or authorize copying a proposed URL into an approval.

The proposal also identifies fact corrections or unresolved classification questions for several rows, especially `INF-2026-082`, `INF-2026-085`, `INF-2026-087`, `INF-2026-088`, `INF-2026-089`, `INF-2026-091`, `INF-2026-093`, and `INF-2026-095`. Those facts must be resolved before citation designation so a citation is not used to make an unsupported Deal appear publication-ready.

### Seven Deals with two unique URLs

The following are the only Deals with two exact unique candidate URLs in the bound template. The observations describe URL-host or path relationships only and are not source-quality findings.

| Deal | Candidate URLs | Human comparison required |
|---|---|---|
| `INF-2026-209` — R.E.L.A.M. | [IREI-hosted page](https://irei.com/news/basalt-agrees-to-acquire-r-e-l-a-m-a-north-american-lessor-of-rail-infrastructure-equipment/)<br>[Paceline-hosted page](https://pacelineequity.com/paceline-equity-partners-agrees-to-sell-r-e-l-a-m/) | Inspect both pages to establish issuer, transaction-party perspective, supported facts, dates, and whether either page independently satisfies the intended primary-citation purpose. |
| `INF-2026-218` — QScale | [GS `en-int` path](https://am.gs.com/en-int/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale)<br>[GS `en-us` path](https://am.gs.com/en-us/advisors/news/press-release/2026/goldman-sachs-alternatives-acquire-qscale) | The host and path indicate localized variants. Compare rendered content, canonical metadata, and redirects before treating them as distinct evidence. |
| `WB-2026-05-02-001` — Power Factors | [Mubadala-hosted page](https://www.mubadala.com/en/news/mubadala-announces-acquisition-of-minority-stake-in-power-factors)<br>[Power Factors-hosted page](https://www.powerfactors.com/news/power-factors-welcomes-mubadala-as-strategic-investor-to-support-next-phase-of-growth) | Compare the investor and target perspectives and determine which page supports the exact primary purpose; preserve both only when they support meaningfully distinct facts. |
| `WB-2026-05-16-003` — FirstLight U.S. Clean-Power Portfolio | [PSP Investments-hosted page](https://www.investpsp.com/en/news/psp-investments-announces-sale-of-firstlights-us-portfolio-to-hull-street-energy)<br>[PR Newswire-hosted page](https://www.prnewswire.com/news-releases/hull-street-energy-to-acquire-firstlights-us-generation-fleet-scaling-the-firms-hydro-footprint-302776103.html) | Verify the issuer behind the distributed release, compare seller and buyer facts, and apply the repository's transaction-date convention. |
| `WB-2026-06-06-002` — Pathway Power | [Igneo Australia path](https://www.igneoip.com/australia/en/institutional/news-and-insights/press/igneo-completes-investment-in-power-pathway.html)<br>[Igneo U.S. path](https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-completes-investment-in-pathway-power.html) | The host and path indicate regional variants with different slugs. Compare content, canonical metadata, and redirects before treating them as independent evidence. |
| `WB-2026-06-13-009` — Navitas Credit Corp. | [PR Newswire-hosted page](https://www.prnewswire.com/news-releases/wafra-announces-acquisition-of-navitas-credit-corp-302799078.html)<br>[Wafra-hosted page](https://www.wafra.com/wafra-announces-acquisition-of-navitas-credit-corp/) | Determine whether the wire page is an issuer-distributed copy of the Wafra page and whether the two URLs add any independent facts. |
| `WB-2026-06-27-001` — EDF Power Solutions U.S. and Canada operations | [GlobeNewswire resource](https://ml-eu.globenewswire.com/Resource/Download/7d53ada8-1bff-4ad0-a652-6c8e9e254784)<br>[KKR-hosted page](https://media.kkr.com/news-details/?news_id=ccd64ec4-8642-4400-9619-313f0d81db29) | Identify the issuer and contents of the downloaded resource, compare them with KKR's page, and verify which facts and dates each supports. |

No row in this table has a selected candidate. “Two URLs” means only two distinct URL strings in the generated item; it does not mean two independent, acceptable, or sufficient primary sources.

## Company queue

### Exact Company unique-URL distribution

| Unique candidate URLs on one Company | Company items |
|---:|---:|
| 0 | 1 |
| 1 | 0 |
| 2 | 17 |
| 3 | 331 |
| 4 | 525 |
| 5 | 185 |
| 6 | 88 |
| 7 | 31 |
| 8 | 10 |
| 9 | 1 |
| 10 | 2 |
| **Total** | **1,191** |

There are no Company items with exactly one unique URL. Most Company items—1,041 of 1,191, or 87.4%—contain three to five unique URLs. That apparent breadth still requires entity-level and fact-level review because URL count does not establish independence, authority, or correct attachment to the canonical Company.

### Company with no candidate: Extenet

The sole zero-candidate Company is:

- `Extenet — United States`
- Company ID: `cmoqc0y7100vi171flkm8xuz4`

The bound artifact's neutral heuristic also placed this row in cluster 9 of
the earlier [Canonical Company Merge Review](company-canonical-merge-review-2026-07-22.md):

- Proposed survivor: `ExteNet Systems` (`cmnva0mwt00elm8lz2xp3ijr4`)
- Proposed retired row: `Extenet` (`cmoqc0y7100vi171flkm8xuz4`)
- Evidence counts: `4/6/0/18 → 1/4/0/0`
- Current decision: **PENDING REVIEW**

The newer review-only
[Company Canonical Identity Review](company-canonical-identity-review-2026-07-23.md#9-extenet--merge)
recommends reversing that heuristic: keep the current `Extenet` brand record
and retire `ExteNet Systems`, subject to regenerated snapshots and formal human
approval. The
[Primary-Source Research Proposals](../docs/primary-source-research-proposals-2026-07-23.md#company-extenet--pending-canonical-merge)
identify a first-party rebrand page as candidate identity evidence. Neither
review document authorizes a surviving ID, canonical display name, founded
year, ownership history, milestone set, or citation designation.

The Company identity decision must precede citation approval for this item. Adding a citation to a row that is later retired would create avoidable review churn and could attach evidence to the wrong canonical record.

## Safe human review order

1. **Freeze the evidence binding.** Review the exact run, head, artifact, and template hash above. If any bound value changes, stop and regenerate this triage rather than carrying selections forward.
2. **Resolve canonical Company identity first.** Review all pending duplicate clusters before Company citation designation, beginning with Extenet because it is both the only zero-candidate Company and a proposed retired duplicate. Approval of identity consolidation must remain separate from citation approval.
3. **Correct unsupported Deal facts before adding citations.** Individually adjudicate the 16 zero-candidate Deals, including the classification, chronology, parties, stake, value, and seller issues already recorded in the research proposals. Do not add a source merely to clear the gap.
4. **Add accepted evidence through the editorial workflow.** Only after a human accepts the source and associated factual corrections should an authenticated editor add or correct source/citation records. Do not hand-edit `selectedCitationId` into this stale template.
5. **Regenerate all neutral templates.** Run the protected generation process against the corrected isolated database. Re-bind the new source head, artifact ID/digest, template SHA-256, and `generatedAt`, and verify that no intended item disappeared without an explained data or identity decision.
6. **Review low-choice Deal items with full evidence checks.** Review the seven two-URL Deals by reading and comparing both pages. Then review the 329 one-URL Deals; a one-URL item needs an explicit reject/research-more path when the sole page is insufficient.
7. **Review Companies by canonical risk, then evidence diversity.** After merge decisions are applied and templates regenerated, start with remaining low-URL Company items, then proceed through higher-URL groups. Within each group, prioritize identity conflicts, ownership-period conflicts, and citations reused across many entities. Do not use candidate order as a ranking.
8. **Select by exact fact and purpose, not by URL frequency.** For every item, verify entity identity, issuer, publication timing, source classification, evidence purpose, supported facts, conflicts, and whether the page is primary for the claim being designated. Review repeated URLs once for content, then evaluate each citation record's entity and purpose separately.
9. **Complete the approval atomically.** Only after every regenerated item has exactly one valid listed `selectedCitationId` should the reviewer populate `reviewedBy` and `reviewedAt`, retain every item and candidate, save the complete approval at the repository-approved path, and compute the SHA-256 of the exact final bytes.
10. **Apply only through protected automation.** Run validation against a non-production database branch, verify the bound hash and expected row count, inspect the generated audit events and quality gates, and keep the prior deployment/database state recoverable. Citation approval must not silently approve unrelated fact corrections or Company merges.

## Reviewer checklist

For each regenerated item, the human reviewer should be able to answer all of the following before selection:

- Is this the correct canonical Deal or Company?
- Is the page issued by, filed by, or directly attributable to a party with first-hand knowledge of the selected evidence purpose?
- Does the page support the exact fact for which the citation will be primary?
- Are date, status, buyer, seller, stake, value, geography, and entity scope consistent with the record?
- Is the URL a locale variant, mirror, syndicated copy, redirect, or duplicate of another candidate?
- Does another candidate contain a materially different party perspective or support a distinct fact?
- Is the page reachable and stable enough for publication use, without mistaking reachability for quality?
- Does selection conflict with a pending Company merge, Deal correction, ownership-period decision, or seller-treatment decision?
- Is the chosen citation ID present in the newly regenerated item—not merely in this bound historical template?
- Is the rationale sufficient for another reviewer to reproduce the decision?

Until those checks are completed against a regenerated, hash-bound template, every item remains **PENDING HUMAN REVIEW**.
