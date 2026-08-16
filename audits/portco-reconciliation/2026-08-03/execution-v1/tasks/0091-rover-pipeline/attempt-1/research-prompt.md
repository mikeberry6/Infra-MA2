# Rover Pipeline — compact Phase 1 reconciliation

Freshly research **Rover Pipeline** as of **2026-08-15**. This is one manager-level PortCo ownership decision, not a scorecard. Requested managers: **Ares Management / Blackstone**.

Existing record `cmrxpj9ha00o1ivheosmpe7bo` treats Rover as one U.S. interstate natural-gas pipeline platform; Ares is active from 2026 through its Infrastructure Opportunities strategy; Blackstone is former from 2017–2026; no pending transaction exists. The record says Ares bought Blackstone's 32.4% Rover stake on 2026-04-29. It does not record Energy Transfer as an owner, uses the four-state operating footprint as “headquarters,” has no website, and contains inconsistent 2017 milestone wording: 32.44% of the pipeline versus 49.9% of the holding company. Treat every claim as unverified.

Independently search direct pages and later sources to resolve:

1. canonical legal identity, holding-company/pipeline boundary, official site, and operating footprint;
2. Energy Transfer's ownership before and after the 2017 Blackstone transaction, distinguishing 49.9% of the holding company from the resulting 32.44% indirect Rover interest;
3. Blackstone's exact vehicle/strategy, closing date, economic interest, and full 2026 exit;
4. Ares' exact vehicle/strategy, stake, announcement/closing date, and direct-infrastructure basis;
5. whether Energy Transfer remains the other current legal owner and the best supportable percentage, without inferring across mismatched entities;
6. construction/service dates and any later sale, closing, exit, restructuring, or pending transaction through the as-of date.

Open direct pages, filings and PDFs—not snippets. Prefer Energy Transfer, Ares, Blackstone, FERC, SEC and other primary sources. Do not infer a platform percentage from a holding-company percentage unless the source supplies the bridge. Exclude shippers, producers, lenders, contractors, project segments and connecting pipelines as separate PortCos. If current legal ownership is genuinely unresolved, choose `DEFERRED`; use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps.

Start with:

- https://ir.energytransfer.com/news-releases/news-release-details/energy-transfer-announces-sale-3244-stake-entity-rover-pipeline
- https://ir.energytransfer.com/news-releases/news-release-details/energy-transfer-announces-closing-previously-announced-sale-3244
- https://www.blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america/
- https://www.energytransfer.com/operations/natural-gas/rover-pipeline/

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,200 characters**. Use strings under 120 characters, at most 4 milestones, 6 evidence rows and 6 before/after strings. Never truncate the JSON; shorten strings or lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-15","requestedCompany":"Rover Pipeline","requestedManager":"Ares Management / Blackstone","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"MIDSTREAM","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision and current owners.
