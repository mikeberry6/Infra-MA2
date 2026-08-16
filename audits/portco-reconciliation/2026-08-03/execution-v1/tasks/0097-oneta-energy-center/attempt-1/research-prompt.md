# Oneta Energy Center — compact Phase 1 reconciliation

Freshly research **Oneta Energy Center** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository publishes two active Argo records from 2019:

- **Oneta Energy Center** (`cmrxpj5uv00ifivheiv841o51`), described as a 1,127 MW combined-cycle plant near Broken Arrow, Oklahoma, with an owner vehicle recorded as `Argo Infrastructure Partners (Apollo)`;
- **Oneta Power** (`cmrxpj7c400knivhe7bfekz6z`), described as the owner/operator of the same Oneta Energy Center, with `https://onetapower.com/` and the same 2019 LS Power sale evidence.

The manager census accepted Oneta Energy Center as the included holding and flagged Oneta Power as a possible duplicate/repository-only identity. Treat every claim as unverified. The announced Apollo transaction involving Argo was terminated in January 2026 and must not be shown as a current Oneta owner or vehicle unless direct Oneta-level evidence says otherwise.

Our census counts one manager-level operating company, platform or standalone asset once. A legal project owner and the plant it owns may still be one census investment, but do not merge unrelated entities merely because they share an owner. Resolve whether Oneta Power is the legal/operating identity for the single Oneta Energy Center asset, an alias/brand, or a genuinely separate manager-level company. If both records represent the same single-plant investment, recommend one canonical **Oneta Energy Center** record with **Oneta Power** preserved as a legal/operating alias and a redirect from the duplicate record.

Independently search direct pages and later sources to resolve:

1. the exact plant, legal owner/operator, aliases, official site, location, capacity and operating-market boundary;
2. whether Oneta Energy Center and Oneta Power refer to the same single generation asset/investment or distinct manager-level holdings;
3. LS Power's August 2019 agreement to sell Oneta and Carville to Argo, including announcement versus legal closing, acquirer vehicle, stake and fund if publicly disclosed;
4. whether Argo remains the current owner and whether `Argo Infrastructure Partners (Apollo)` is inaccurate after the Apollo-Argo termination;
5. any later sale, exit, dissolution, restructuring, rebrand or pending ownership transaction through the as-of date;
6. which record should remain canonical and how ownership, milestones, citations and the duplicate identity should be preserved.

Open direct pages/documents, not snippets. Prefer Oneta, Argo, LS Power, FERC, SPP and government/regulatory sources. Search explicitly for acquisitions and subsequent exits. Do not infer an exact closing date, fund, stake, founding year or headquarters. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved.

Start with:

- https://onetapower.com/
- https://onetapower.com/about/
- https://www.lspower.com/news/ls-power-announces-sale-of-carville-and-oneta-projects-to-argo-infrastructure-partners/
- https://www.argoip.com/
- https://www.argoip.com/news-and-insights
- https://cdn.ymaws.com/mpua.org/resource/collection/984F6EB9-DDFA-41EB-9ADE-762188D73686/2024_MEC_Annual_Disclosure_Report_-_Final.pdf

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 7 evidence rows and 7 before/after strings. Never truncate JSON; shorten strings/lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Oneta Energy Center","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"POWER_ET","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision and whether Oneta Power is the same census investment as Oneta Energy Center.
