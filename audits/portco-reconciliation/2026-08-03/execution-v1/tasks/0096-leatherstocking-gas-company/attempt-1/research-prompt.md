# Leatherstocking Gas Company — compact Phase 1 reconciliation

Freshly research **Leatherstocking Gas Company** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository currently publishes Leatherstocking separately (`cmrxpj5sm00ibivhekmn5ibaf`) as an active Argo PortCo from 2022, using vehicle `ACP Crotona Corp. (via Corning Natural Gas Holding Corp.)`. It also publishes **Corning Natural Gas Holding Corp.** (`cmrxpj5nf00i2ivhew54p3fxp`) as the active Argo-backed parent platform from 2022. Existing evidence says Leatherstocking is a regulated gas utility in New York/Pennsylvania and a Corning subsidiary. The manager census retained Corning as the manager-level holding and treated Leatherstocking as an operating subsidiary beneath it. Treat every claim as unverified.

Our census counts a manager-level operating company/platform once. It excludes subsidiaries, bolt-ons, brands, projects and assets beneath an already-counted platform. A subsidiary is not a duplicate legal identity: do **not** recommend a canonical merge/redirect merely because Corning owns Leatherstocking. If Leatherstocking remains a distinct regulated subsidiary or operating utility, the expected treatment is to archive/remove its standalone published PortCo row while preserving its identity and accurate indirect Argo ownership history. Recommend a merge only if direct evidence proves the records are the same legal identity.

Independently search direct pages and later sources to resolve:

1. Leatherstocking's exact current legal entities, aliases, official site, service territories, regulator status and parent/subsidiary structure;
2. the 2010/2011 joint-venture formation, the New York and Pennsylvania entity boundary, and Corning/Mirabito ownership changes through 2020;
3. Argo's July 2022 acquisition of Corning through ACP Crotona, including closing, stake, vehicle and whether Leatherstocking is owned only indirectly;
4. whether Corning remains the correct single manager-level PortCo boundary while Leatherstocking remains a distinct operating subsidiary;
5. any later sale, exit, dissolution, restructuring, legal merger, rebrand or pending transaction involving Leatherstocking or Corning through the as-of date;
6. whether Leatherstocking's current direct-looking Argo row should be retained only as corrected indirect audit history when its standalone record is archived.

Open direct pages/documents, not snippets. Prefer Leatherstocking, Corning, Argo, SEC and NY/PA regulators. Search explicitly for acquisitions and subsequent exits. Do not infer a legal merger, ownership percentage, fund, headquarters or exact closing date. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved.

Start with:

- https://leatherstockinggas.com/
- https://leatherstockinggas.com/company-history
- https://www.corninggas.com/company-history
- https://www.globenewswire.com/news-release/2022/07/06/2475377/0/en/corning-natural-gas-holding-corporation-acquired-by-argo-infrastructure-partners-lp.html
- https://www.sec.gov/Archives/edgar/data/1582244/000110465922072432/tm2218804d1_8k.htm
- https://www.puc.pa.gov/press-release/2023/puc-approves-rate-settlement-with-leatherstocking-gas-company-llc-for-natural-gas-services-in-susquehanna-and-bradford-counties

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 7 evidence rows and 7 before/after strings. Never truncate JSON; shorten strings/lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Leatherstocking Gas Company","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"UTILITIES","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision and whether Leatherstocking remains a standalone manager-level PortCo.
