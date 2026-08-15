# Sequitur — Phase 1 list-reconciliation research

You are researching one infrastructure portfolio-company holding for a North American ownership census. Perform fresh, current web research as of **2026-08-15**. Open direct source pages; do not rely on search-result snippets.

## Task identity

- Requested holding: **Sequitur**
- Requested infrastructure manager: **ArcLight Capital** (resolve this census label against the repository's existing **ArcLight Capital Partners** organization; do not create a duplicate owner merely because the labels differ)
- Census holding ID: `012-arclight-capital:holding:015:sequitur`
- Census evidence lead: <https://arclight.com/investments/>
- Census result requiring review: ArcLight lists “Sequitur” as a current investment, but the recovered census did not resolve its exact legal/platform identity
- Existing production company named exactly **Sequitur**: none
- Existing evaluated seed company named exactly **Sequitur**: none
- Queue canonical key: `sequitur|united-states`
- Queue status: `NEEDS_REVIEW`; no mutation action was pre-authorized

## Existing repository candidate that must be tested

The repository already contains one published production and seed record that may represent the same holding:

- Name: **Sequitur Renewables**
- Production ID: `cmrxpj6k800jhivheu0xn4hyt`
- Existing canonical key: `sequitur-renewables|united-states`
- Existing manager: **ArcLight Capital Partners**
- Existing status: Active
- Existing investment year: 2022
- Existing ownership vehicle: `n.a.`
- Existing sector/subsector: Power & ET / Operating Wind Portfolio
- Existing geography: United States; Pennsylvania, West Virginia and California
- Existing description says ArcLight established the platform in 2022 around a 185 MW PJM wind portfolio and expanded it in 2023 with an operating California wind farm in Altamont Pass
- Existing record has one active ArcLight ownership period, four milestones and four citations, but no current verification date

Treat every existing fact as a claim to verify. The task-scoped production snapshot did not auto-match “Sequitur” to “Sequitur Renewables” because the names differ. Determine from direct evidence whether ArcLight's census holding is exactly this existing platform, a parent/alias of it, or a distinct business.

## Identity and boundary questions

Distinguish carefully among:

- “Sequitur” as displayed by ArcLight;
- Sequitur Renewables and any legal entity bearing that name;
- any Sequitur holding, project, asset or acquisition vehicle;
- the 185 MW operating PJM wind portfolio announced in 2022;
- the operating Altamont Pass, California wind farm announced in 2023;
- individual wind projects, local asset companies, sellers, operators and power-market counterparties;
- unrelated companies named Sequitur.

Under this census, a manager-level operating company, platform or standalone infrastructure asset primarily based in or dedicated to the United States, Canada or Mexico can qualify. Subsidiaries and individual projects beneath an already-counted platform must not be double-counted.

## Direct source leads to reopen

These are leads only. Open each direct page and state exactly what it supports.

- ArcLight current investments: <https://arclight.com/investments/>
- Sequitur Renewables website: <https://sequiturrenewables.com/>
- Sequitur Renewables news page: <https://sequiturrenewables.com/category/news/>
- ArcLight's August 1, 2022 PJM wind acquisition announcement: <https://www.prnewswire.com/news-releases/arclight-to-acquire-operating-pjm-windfarms-301596749.html>
- Sequitur's May 2023 California wind-farm acquisition announcement: <https://www.prnewswire.com/news-releases/arclights-sequitur-platform-to-acquire-operating-california-wind-farm-301825282.html>
- ArcLight 2023 ESG report, which may identify Sequitur's fund and acquisition chronology: <https://arclight.com/wp-content/uploads/2023/10/ArcLight_2023ESGReport_Final.pdf>
- ArcLight 2024 ESG report: <https://arclight.com/wp-content/uploads/2024/09/2024-ArcLight-ESG-Report.pdf>
- ArcLight 2025 ESG report: <https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf>
- Sequitur Renewables, LLC GLEIF record and ultimate-parent relationship: <https://api.gleif.org/api/v1/lei-records/254900IHCZT8GGFOZW95> and <https://api.gleif.org/api/v1/lei-records/254900IHCZT8GGFOZW95/ultimate-parent-relationship>
- 2022 PJM State of the Market report, including the reported transfer date for the initial five wind farms: <https://www.monitoringanalytics.com/reports/PJM_State_of_the_Market/2022/2022-som-pjm-sec3.pdf>

Find stronger or more current primary, regulatory or filing sources where available. Reliable secondary sources may fill genuine gaps. Search explicitly for both the initial acquisitions and any later sale, exit, restructuring, refinancing, dissolution, rebrand or signed pending transaction through 2026-08-15.

## Required decision

Determine which outcome is correct:

1. `VERIFIED_EXISTING_MATCH` — ArcLight's “Sequitur” holding is the existing Sequitur Renewables platform and the current canonical record is list-level accurate; map the census holding to production ID `cmrxpj6k800jhivheu0xn4hyt` and do not create a new company.
2. `PROPOSED_CORRECTION` — the holding maps to the existing Sequitur Renewables platform, but a list-level identity, geography, classification, ownership, status or investment-year field requires an exact correction.
3. `PROPOSED_NEW` — direct evidence proves ArcLight's “Sequitur” is a distinct in-scope company or standalone asset not represented by Sequitur Renewables.
4. `SUPERSEDED_OR_DUPLICATE` — “Sequitur” is only an alias, subsidiary, project or acquisition vehicle beneath another canonical PortCo; identify the correct canonical target and mapping.
5. `EXCLUDED` — the holding is debt-only exposure, an LP/fund interest, public security, non-infrastructure business, realized with no current manager owner, or otherwise outside the census definition.
6. `DEFERRED` — canonical identity or current ArcLight ownership remains unresolved after reasonable direct-source research.

Use `NOT_PUBLICLY_DISCLOSED` for unavailable noncritical facts. Use `UNRESOLVED` for canonical identity or active-ownership uncertainty; either unresolved item requires `DEFERRED`.

## Research requirements

- Establish whether “Sequitur” and “Sequitur Renewables” are demonstrably the same ArcLight platform. Quote no more than a few necessary words from any source; otherwise paraphrase.
- Establish the best supported canonical display and legal identity, aliases, official website, country, operating footprint and platform boundary.
- Verify current direct equity ownership by ArcLight Capital Partners or ArcLight-managed investment vehicles and the infrastructure-strategy basis.
- Verify whether `ArcLight Capital` is merely a shortened census label for `ArcLight Capital Partners`.
- Determine the exact ArcLight fund, legal holding vehicle, stake, announcement date, closing/entry date and transaction state only if directly disclosed. Do not infer Fund VII, a legal vehicle, a numeric stake or a closing date from fund vintage, timing or general manager materials.
- Verify the August 2022 acquisition: target portfolio identity, capacity, states, seller, announcement versus closing and whether it established the Sequitur platform.
- Verify any reported October 2022 closing date rather than treating the August announcement as closing. Distinguish the five acquired wind-farm entities from the platform itself.
- Verify the May 2023 California acquisition: exact asset identity/location, seller, announcement versus closing and whether it was a bolt-on beneath Sequitur rather than a separate manager-level PortCo.
- Search for subsequent exits, sales, ownership changes, rebrands, insolvency, dissolution and signed pending transactions. A stale company page alone does not prove current ownership.
- Determine whether the existing active status, 2022 investment year, Power & ET classification, Operating Wind Portfolio subsector and U.S. geography remain accurate at list level.
- Produce two to four list-level milestones only if a correction or new record is recommended. Do not turn each wind project or asset entity into a separate PortCo.
- Every included fact must have a direct URL whose opened page supports it. One reliable source is sufficient when it directly proves the fact; add evidence when identity, ownership, current status, geography, strategy, fund, entry date, stake or platform boundary is not established by the first.

## Repository guardrails

- Do not create a second ArcLight organization.
- Do not create both Sequitur and Sequitur Renewables unless direct evidence proves they are distinct manager-level companies.
- Do not create separate PortCos for the PJM portfolio, the California wind farm or individual project companies if they sit beneath the Sequitur platform.
- Do not infer that ArcLight owns 100%, a majority, or any numeric percentage.
- Do not populate `n.a.` as a factual fund or legal vehicle. If the vehicle is not publicly disclosed, recommend `NOT_PUBLICLY_DISCLOSED` while explaining whether that is a list-level correction or later scorecard cleanup.
- This is a list-reconciliation decision, not the later full company scorecard refresh. Recommend only mutations necessary to establish one correct canonical company and ownership ledger.

## Output contract

Return one JSON object in a fenced `json` block, followed by a concise Markdown review. Use this top-level shape:

```json
{
  "asOfDate": "2026-08-15",
  "requestedCompany": "Sequitur",
  "requestedManager": "ArcLight Capital",
  "decision": "VERIFIED_EXISTING_MATCH | PROPOSED_CORRECTION | PROPOSED_NEW | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence": "HIGH | MEDIUM | LOW",
  "rationale": "",
  "identityResolution": {
    "canonicalLegalName": "",
    "canonicalDisplayName": "",
    "aliases": [],
    "officialWebsite": null,
    "headquartersOrOperatingLocation": null,
    "country": null,
    "platformBoundary": "",
    "duplicateDecision": ""
  },
  "existingRecordDisposition": {
    "productionCompanyId": "cmrxpj6k800jhivheu0xn4hyt",
    "mapsToExisting": false,
    "keepCanonicalName": false,
    "exactListLevelCorrections": [],
    "newCompanyRequired": false
  },
  "ownershipResolution": {
    "managerAliasDecision": "",
    "currentOwners": [],
    "formerOwners": [],
    "pendingOwnershipTransactions": [],
    "duplicateOwnerAction": ""
  },
  "operatingResolution": {
    "sector": null,
    "subsector": null,
    "region": null,
    "countryTags": [],
    "description": null,
    "companyStatus": null,
    "yearFounded": null,
    "services": null,
    "customersAndEndMarkets": null,
    "footprint": null,
    "disclosedScale": null
  },
  "acquisitionExitCheck": {
    "initialInvestment": "",
    "californiaBoltOn": "",
    "subsequentExitSearch": ""
  },
  "milestones": [],
  "evidence": [
    {
      "label": "",
      "url": "https://...",
      "purpose": "",
      "sourceTier": "PRIMARY | REGULATORY | INSTITUTIONAL | REPUTABLE_SECONDARY",
      "workingStatus": "WORKING | REDIRECTED | BROWSER_BLOCKED_BUT_VERIFIED | DEAD",
      "isRecommendedPrimary": false
    }
  ],
  "proposedRelations": [],
  "excludedOrDuplicateCandidates": [],
  "unresolvedQuestions": [],
  "recommendedListAction": ""
}
```

For ownership rows, include only supported fields from: `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState` (`CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`).

Before answering, verify that every included active owner has direct current evidence and that a subsequent-exit search was performed. If the existing record is the correct match but a fund, legal vehicle, percentage or closing date is not disclosed, use `NOT_PUBLICLY_DISCLOSED`; do not invent it and do not treat the missing noncritical fact alone as a reason to create a duplicate company.
