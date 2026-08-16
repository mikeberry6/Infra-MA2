# DSD Renewables — compact Phase 1 reconciliation retry

Freshly research **DSD Renewables** as of **2026-08-15**. This is one manager-level PortCo ownership decision, not a scorecard. Requested managers: **Ares Management / BlackRock / Global Infrastructure Partners (GIP)**.

Existing record `cmrxpj8vd00n1ivhe5l7psm8n` has one canonical U.S. platform, BlackRock active from 2019, Ares active from a $200mm preferred-equity investment on 2022-03-03, Cox mentioned but not recorded as an owner, and no pending transaction. Treat all claims as unverified.

Independently search direct pages and later sources to resolve:

1. canonical identity and platform boundary;
2. GE Solar predecessor, BlackRock's reported 80% 2019 purchase and remaining 20% 2020 purchase, and GRP II vehicle;
3. whether Ares' 2022 preferred equity is direct infrastructure equity and whether a March/May 2025 conversion/change of control made Ares majority;
4. whether BlackRock and Cox retained minority equity after that change;
5. why BlackRock's GIP acquisition does or does not make GIP a DSD owner;
6. any signed sale, closing, exit, restructuring or insolvency through the as-of date. A sale exploration is not a pending transaction.

Open direct pages, not snippets. Prefer primary sources; use named reputable trade sources when primary cap-table evidence is unavailable. Do not infer percentages from dollars. Exclude projects, SPVs, lenders and tax-equity investors. If current legal ownership is genuinely unresolved, choose `DEFERRED`; use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps.

Start with:

- https://dsdrenewables.com/overview/
- https://dsdrenewables.com/featured/dsd-celebrates-5-years/
- https://dsdrenewables.com/press-release/dsd-secures-200m-preferred-equity-investment-from-ares-management-press-release/
- https://dsdrenewables.com/press-release/dsd-receives-250m-strategic-investment-from-cox-enterprises-press-release/
- https://ionanalytics.com/insights/infralogic/ares-exploring-sale-of-dsd-renewables/
- https://newprojectmedia.com/risk-dsd-renewables-pursuing-asset-sales-amongst-layoffs-restructuring/

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,200 characters**. Use strings under 120 characters, at most 4 milestones, 5 evidence rows and 5 before/after strings. Never truncate the JSON; shorten strings or lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-15","requestedCompany":"DSD Renewables","requestedManager":"Ares / BlackRock / GIP","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"POWER_ET","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision and current owners.
