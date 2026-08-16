# Pike County Light & Power — compact Phase 1 reconciliation

Freshly research **Pike County Light & Power** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository currently publishes one active record (`cmrxpj5y300ihivhe77dx28te`). It describes a regulated electric and gas distribution utility in Pike County, Pennsylvania, founded in 1910, acquired by Corning Natural Gas Holding Corporation in 2016, and indirectly acquired by Argo in 2022 through `ACP Crotona Corp. (via Corning Natural Gas Holding Corp.)`. It also publishes Corning Natural Gas Holding Corporation and Leatherstocking Gas Company separately. Treat every claim as unverified.

The manager census rejected Pike County as a separate Argo census holding because it appears to be an operating subsidiary beneath the manager-level Corning platform. The queue therefore asks whether the Pike County record must be consolidated into the canonical Corning record, excluded as a subsidiary, or retained because evidence proves a separate manager-level direct investment. Do not preserve a record merely because it already exists.

Independently search direct pages and later sources to resolve:

1. the exact legal identity, aliases and current corporate chain for Pike County Light & Power Company;
2. whether Corning acquired it in 2016 and whether Argo's 2022 transaction acquired Corning as one platform rather than Pike County as a separate direct investment;
3. whether `ACP Crotona Corp.` is the acquisition vehicle for Corning or a Pike-specific investment vehicle;
4. whether Pike County should be counted separately under the manager-level census rule, or instead removed/redirected to Corning while preserving Pike facts as subsidiary context;
5. the current legal owner after searching for all later acquisitions, closings, change-of-control proceedings, restructurings and signed pending exits through the as-of date;
6. the November 2025 Pennsylvania PUC change-of-control filing: parties, transaction state, closing status and whether it changes Argo ownership;
7. the correct official website, headquarters, founding date, service territory, customer/asset scale and utility boundary only insofar as needed for the list decision.

Open direct pages/documents, not snippets. Prefer the company, Corning, Argo, Pennsylvania PUC, SEC and transaction counterparties. Search explicitly for acquisition and subsequent exit. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved. A subsidiary-level regulated utility is not a separate manager-level PortCo unless evidence shows a separate direct infrastructure investment.

Start with:

- https://pclpeg.com/
- https://pclpeg.com/about-us
- https://www.corninggas.com/company-history
- https://www.globenewswire.com/news-release/2022/07/06/2475377/0/en/corning-natural-gas-holding-corporation-acquired-by-argo-infrastructure-partners-lp.html
- https://www.puc.pa.gov/pcdocs/1903783.pdf
- https://www.argoip.com/

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 8 evidence rows and 8 before/after strings. Never truncate JSON; shorten strings/lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Pike County Light & Power","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"UTILITIES","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision, the correct manager-level canonical record and whether Pike County remains a separate published PortCo.
