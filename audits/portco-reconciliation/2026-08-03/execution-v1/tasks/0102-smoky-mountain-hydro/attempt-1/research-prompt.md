# Smoky Mountain Hydro — compact Phase 1 reconciliation

Freshly research **Smoky Mountain Hydro** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository currently publishes two active records that may describe the same manager-level investment. Treat every claim as unverified:

- `Smoky Mountain Hydro` (`cmrxpj5z600ijivher3ow39vc`) describes four hydroelectric facilities in Tennessee and North Carolina. It assigns Argo a 2023 active period through the suspicious vehicle label `Argo Infrastructure Partners (Apollo)` and says Argo acquired 50% of Smoky Mountain Holdings in March 2023.
- `Smoky Mountain Hydroelectric Facilities` (`cmrxpjab100pcivhe8qvszy2f`) describes the same approximately 377 MW portfolio. It assigns Brookfield Asset Management a 2012 active period through `Brookfield Infrastructure Income Fund` and cites Brookfield's purchase of former Alcoa hydro assets.

The manager census included **Smoky Mountain Hydro** as Argo's holding but flagged the second record as a possible duplicate. Resolve whether both names cover the same four-facility portfolio and whether `Smoky Mountain Holdings, LLC` is the current legal ownership platform. Do not preserve a record merely because it already exists.

Independently search direct pages and later sources to resolve:

1. the exact identities and relationship among Smoky Mountain Hydro, Smoky Mountain Hydroelectric Facilities, Smoky Mountain Holdings, LLC, Brookfield Renewable and the four named hydro facilities;
2. whether Brookfield acquired the portfolio in 2012 and what exact interest Argo acquired, from whom, through which vehicle, and on what announcement/closing dates in 2023;
3. whether Argo and Brookfield currently remain co-owners, including supported percentages and fund/vehicle names, after a full later-sale and pending-exit search through the as-of date;
4. whether Apollo has any asset-level role; a manager-level Apollo transaction must not be converted into a PortCo vehicle or owner without direct evidence;
5. whether Brookfield Infrastructure Income Fund is supported for this investment or is a later fund-marketing reference rather than the acquisition vehicle;
6. the correct canonical keep/retire/redirect decision and how ownership histories from both records should be combined without duplicate owners;
7. only the geography, four-asset boundary, capacity, TVA PPA and 2025 financing facts needed for this list decision.

The four hydro plants/projects are underlying assets, not separate manager-level PortCos. Open direct pages/documents, not snippets. Prefer official company/sponsor releases, SEC/FERC/regulatory filings, TVA, LIHI and financing counterparties. Search explicitly for both acquisition and subsequent exit. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved.

Start with:

- https://www.businesswire.com/news/home/20241119725256/en/TVA-Enters-10-year-Power-Purchase-Agreement-with-Argo-and-Brookfields-Smoky-Mountain-Hydro-Facilities
- https://www.businesswire.com/news/home/20250814980122/en/Smoky-Mountain-Holdings-LLC-Closes-Landmark-%24435-Million-Financing
- https://lowimpacthydro.org/lihi-certificate-18-smoky-mountain-project-north-carolina/
- https://privatewealth.brookfield.com/sites/default/files/funds/tender-offer-funds/brookfield-infrastructure-income-fund-presentation.pdf
- https://www.argoip.com/

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 8 evidence rows and 8 before/after strings. Never truncate JSON; shorten strings/lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Smoky Mountain Hydro","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"POWER_ET","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision, the correct manager-level canonical record and whether the second record remains separately published.
