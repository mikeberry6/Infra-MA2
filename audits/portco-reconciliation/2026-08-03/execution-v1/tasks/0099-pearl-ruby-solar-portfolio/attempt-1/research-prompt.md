# Pearl/Ruby Solar Portfolio — compact Phase 1 reconciliation

Freshly research **Pearl/Ruby Solar Portfolio** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository currently publishes one active record (`cmrxpj5xm00igivhejhjldefv`) and already redirects retired duplicate production ID `cmrxpj7cn00koivhe1netbo47` to it. Two duplicate seed entries remain: `Pearl / Ruby solar portfolio` and `Pearl/Ruby Solar Portfolio`. The live record says Argo invested in 2019 through “Argo managed funds,” calls this a 114 MW / 134-site / 12-state C&I distributed-solar portfolio, assumes a 2019 founding year and U.S. headquarters, and has duplicate 2019 milestones/citations. Treat every claim as unverified.

The manager census accepted Pearl/Ruby as one Argo holding but required explicit identity and ownership review. Our census counts one manager-level operating company, platform or standalone asset once. Count the Pearl/Ruby portfolio once if it is a directly owned manager-level investment; do not count its 134 projects separately. Do not merge Astro Solar or another Argo portfolio merely because it has the same manager/operator.

Independently search direct pages and later sources to resolve:

1. whether `Pearl/Ruby Solar`, `Pearl / Ruby Solar` and `Pearl/Ruby Solar Portfolio` are one portfolio identity and whether Pearl and Ruby are sub-portfolios/projects beneath it;
2. the seller, buyer/legal acquisition vehicle, fund, stake, announcement date and legal closing date for Argo’s 2019 investment—do not call an announcement a closing;
3. whether 114 MW, 134 sites, 12 states and 2015–2018 operating dates describe the same acquired portfolio;
4. whether Argo still owns the portfolio as of the as-of date, using the newest direct evidence available, and any later sale, transfer, restructuring, dissolution or signed pending exit;
5. whether a 2019 founding year, headquarters, official website or legal company suffix is actually disclosed; do not infer portfolio formation from Argo’s entry;
6. the exact seed duplicate cleanup and which milestones/citations should remain in the one canonical record.

Open direct pages/documents, not snippets. Prefer Argo, transaction counterparties, SEC/regulatory filings and portfolio/operator sources. Search explicitly for acquisition and subsequent exit. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved.

Start with:

- https://www.prnewswire.com/news-releases/marathon-capital-announces-argos-investment-in-a-114-mw-distributed-solar-portfolio-300790298.html
- https://www.ballardspahr.com/insights/news/2019/03/ballard-spahr-represents-argo-infrastructure-partners-in-solar-energy-investment
- https://www.sec.gov/Archives/edgar/data/1289790/000110465921083888/tm2120341d1_defa14a.htm
- https://www.argoip.com/
- https://www.argoip.com/news-and-insights
- https://www.gresb.com/gresb-participant-members/

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 7 evidence rows and 7 before/after strings. Never truncate JSON; shorten strings/lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Pearl/Ruby Solar Portfolio","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"POWER_ET","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision and whether all Pearl/Ruby spellings and seed entries are the same census investment.
