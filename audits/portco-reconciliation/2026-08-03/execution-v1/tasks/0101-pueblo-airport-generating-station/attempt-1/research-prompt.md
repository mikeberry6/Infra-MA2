# Pueblo Airport Generating Station — compact Phase 1 reconciliation

Freshly research **Pueblo Airport Generating Station** as of **2026-08-16**. This is one manager-level PortCo list decision, not a scorecard. Requested manager: **Argo Infrastructure Partners**.

The repository currently publishes two active records that may describe the same manager-level investment. Treat every claim as unverified:

- `Pueblo Airport Generating Station` (`cmrxpj5yn00iiivhemvos185r`) describes a 440 MW gas-fired facility in Pueblo County, Colorado. It assigns Argo a 2016 active ownership period through the erroneous-looking vehicle label `Argo Infrastructure Partners (Apollo)` and cites a 49.9% sale in `Black Hills Colorado IPP` to AIA Energy North America LLC.
- `Black Hills Colorado IPP` (`cmrxpj77i00kfivhe3epcx6ic`) describes the 200 MW independent-power-producer portion of co-located Pueblo Airport generating facilities. It assigns Argo a 2016 active ownership period through `AIA Energy North America LLC`, with a 49.9% stake, while Black Hills retained 50.1% and the operating role.

The manager census included **Black Hills Colorado IPP** as the Argo manager-level holding and rejected **Pueblo Airport Generating Station** as an underlying generating asset/project beneath that platform. The queue therefore asks whether the Pueblo record must be merged/redirected into Black Hills Colorado IPP, excluded without a redirect, or retained because evidence proves it is a separate manager-level direct infrastructure investment. Do not preserve a record merely because it already exists.

Independently search direct pages and later sources to resolve:

1. the exact legal identities and relationship among Pueblo Airport Generating Station, Black Hills Colorado IPP, LLC, Black Hills Colorado Electric, LLC and AIA Energy North America LLC;
2. whether the full Pueblo Airport site includes utility-owned units plus a separately owned 200 MW IPP unit, and which interest Argo/AIA acquired in 2016;
3. whether Pueblo is an asset/site name rather than a separate Argo portfolio company, and the correct canonical keep/retire boundary;
4. the exact 2016 announcement and legal closing dates, consideration, vehicle and stake;
5. current legal ownership after searching all later sales, exits, restructurings, FERC/PUC filings and signed pending transactions through the as-of date;
6. whether AIA Energy North America LLC remains the supported vehicle and whether any Apollo label is wrong; note that Apollo's announced manager-level acquisition of Argo was terminated in January 2026 unless direct evidence shows an asset-level ownership change;
7. only the identity, operating scale, tolling/PPA term and geography needed for this list decision.

Open direct pages/documents, not snippets. Prefer Black Hills filings, SEC, FERC, Colorado regulators, Argo and transaction counterparties. Search explicitly for acquisition and subsequent exit. Use `NOT_PUBLICLY_DISCLOSED` for nonblocking gaps and `DEFERRED` only if current identity or ownership is genuinely unresolved. An underlying generating site/unit is not a separate manager-level PortCo unless evidence shows a separate direct infrastructure investment.

Start with:

- https://www.sec.gov/Archives/edgar/data/1130464/000113046416000173/form8-ksgpurchasecompletion.htm
- https://www.sec.gov/Archives/edgar/data/1130464/000113046416000209/bkh10qq22016.htm
- https://www.sec.gov/Archives/edgar/data/1130464/000095017025066572/bkh-20250331.htm
- https://ir.blackhillscorp.com/static-files/b5529837-4c7b-46c0-b743-2a1b128db28a
- https://graycor.com/project/pags-expansion-unit-6-phase-ii/
- https://www.huschblackwell.com/inthenews/-husch-blackwell-llp-represents-black-hills-corp-in-215-million-ipp-sale-transaction
- https://www.argoip.com/

Return exactly one **complete, minified, fenced `json` object**, then one Markdown bullet. No narration. Maximum total response: **3,500 characters**. Use strings under 140 characters, at most 4 milestones, 8 evidence rows and 8 before/after strings. Never truncate JSON; shorten strings/lists instead.

Include every key in this compact schema:

```json
{"asOfDate":"2026-08-16","requestedCompany":"Pueblo Airport Generating Station","requestedManager":"Argo Infrastructure Partners","decision":"VERIFIED_NO_CHANGE|PROPOSED_CORRECTION|SUPERSEDED_OR_DUPLICATE|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},"operatingResolution":{"sector":"POWER_ET","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE","yearFounded":null,"services":"","footprint":"","scale":[]},"acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner rows may contain only `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`. Use `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT` or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`; recommend exactly one primary. The Markdown bullet must state the decision, the correct manager-level canonical record and whether Pueblo remains a separate published PortCo.
