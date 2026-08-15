# Salamanca — Phase 1 list-reconciliation research

You are researching one infrastructure portfolio-company holding for a North American ownership census. Perform fresh, current web research as of **2026-08-15**. Open direct source pages; do not rely on search-result snippets.

## Task identity

- Requested holding: **Salamanca**
- Requested infrastructure manager: **ArcLight Capital** (resolve this census label against the repository's **ArcLight Capital Partners** organization; do not create a duplicate owner merely because the labels differ)
- Census holding ID: `012-arclight-capital:holding:014:salamanca`
- Census evidence lead: <https://arclight.com/investments/>
- Existing production company: **none**
- Existing evaluated seed company: **none**
- Existing canonical key: `salamanca|united-states`
- Queue actions to sense-check, not assume: `CREATE_COMPANY` and `ADD_OWNER`

The recovered census says only that ArcLight lists “Salamanca” as a current Opportunistic investment. No standalone production or seed record currently represents it. Determine whether this is a valid manager-level company or standalone infrastructure asset and, if so, the exact canonical identity and list-ready ownership record.

## Identity hypotheses to test

Public leads suggest the holding may be the **Salamanca Floating Production Unit/System** and associated oil-and-gas export laterals in the U.S. Gulf of Mexico, owned through **Salamanca Infrastructure, LLC** and subordinate asset/finance entities. Do not assume that hypothesis is correct.

Distinguish carefully among:

- the Salamanca floating production unit/system and associated midstream export laterals;
- Salamanca Infrastructure, LLC, Salamanca Infrastructure Finance, LLC, Salamanca FPS Infra, LLC, Salamanca OGL Infra, LLC, and other holding/asset/finance entities;
- the broader Salamanca development project;
- the Leon and Castile upstream discoveries, wells, leases and working interests;
- LLOG Exploration and its role as operator;
- Repsol, Centaurus Energy, Beacon Offshore Energy, O.G. Oil & Gas and any other current or former project participants;
- unrelated businesses, cities, mines and power projects named Salamanca.

Under this census, a manager-level operating company, platform **or standalone infrastructure asset** primarily based in or dedicated to the United States, Canada or Mexico can qualify. A subsidiary, finance vehicle, upstream field, well, lease, lateral or project beneath an already-counted platform should not be counted separately.

## Direct source leads to reopen

These are leads only. Open each direct page and state exactly what it supports.

- ArcLight current investments page: <https://arclight.com/investments/>
- LLOG's May 4, 2022 development announcement: <https://www.globenewswire.com/news-release/2022/05/04/2435746/0/en/LLOG-Exploration-Announces-Development-of-Salamanca-Production-Facility.html>
- LLOG's September 29, 2025 first-production announcement: <https://www.globenewswire.com/news-release/2025/09/29/3157792/0/en/LLOG-Exploration-Announces-First-Production-at-Salamanca-Floating-Production-Unit.html>
- U.S. Bureau of Safety and Environmental Enforcement November 18, 2025 release: <https://www.bsee.gov/newsroom/latest-news/statements-and-releases/press-releases/american-energy-dominance-a-new>
- Repsol 2023 annual financial report, including its December 1, 2023 Salamanca Infrastructure transaction: <https://www.repsol.com/content/dam/repsol-corporate/en_gb/accionistas-e-inversores/informes-jga/2024/accessible-documents/consolidated-annual-statements-auditors-report-consolidated-management-report-and-independent-verifying-report-accessible.pdf>
- Repsol 2025 annual financial report, including current Salamanca entities and its retained interest: <https://www.repsol.com/content/dam/repsol-corporate/en_gb/accionistas-e-inversores/ref/2026/ref19022026-2025-group-annual-financial-report.pdf>
- ArcLight 2025 ESG report, which lists the Salamanca Floating Production System: <https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf>
- Oil & Gas Journal's Salamanca development report, including ArcLight's stated infrastructure involvement: <https://img.ogj.com/files/base/ebm/ogj/document/2025/12/69432212994616a66307819e-ogj_off_llog_salamanca_ebook_2025_low_res.pdf>
- Salamanca Infrastructure, LLC LEI record: <https://lei.bloomberg.com/leis/view/25490053T629X928P208>
- Williams' May 4, 2022 deepwater agreement release: <https://www.businesswire.com/news/home/20220504005823/en/Williams-Announces-Deepwater-Agreement-at-Salamanca>

Find stronger or more current primary/regulatory sources where available. Reliable secondary sources may fill genuine gaps.

## Required decision

Determine which outcome is correct:

1. `PROPOSED_NEW` — one canonical Salamanca company or standalone infrastructure asset is in scope, current ArcLight ownership is directly supported, and a complete list-ready record can be created without inventing identity or ownership.
2. `VERIFIED_EXISTING_MATCH` — a differently named existing production company demonstrably already represents this holding, so creation would be a duplicate.
3. `SUPERSEDED_OR_DUPLICATE` — Salamanca is only an alias, subsidiary, finance entity, upstream field or asset beneath another canonical PortCo and should map there rather than become a new record.
4. `EXCLUDED` — Salamanca is debt-only exposure, an LP/fund interest, public security, non-infrastructure business, stale/realized holding, or a project that does not meet the standalone-asset rule.
5. `DEFERRED` — canonical identity or current ArcLight ownership remains unresolved after reasonable direct-source research.

Use `NOT_PUBLICLY_DISCLOSED` for unavailable noncritical facts. Use `UNRESOLVED` for canonical identity or active-ownership uncertainty; either unresolved item requires `DEFERRED`.

## Research requirements

- Establish the exact current public and legal identity, aliases, official website if one exists, country, operating location and boundary of the proposed canonical record.
- Decide whether the best canonical record is Salamanca Infrastructure, LLC, the Salamanca Floating Production Unit/System, or another supported parent/asset identity. Explain why the selected record subsumes the other entities and assets without double-counting.
- Determine whether ArcLight's interest is equity ownership of the infrastructure, construction financing only, or both. Debt-only exposure is out of scope; direct infrastructure equity may qualify even when paired with financing.
- Establish current direct evidence tying Salamanca to ArcLight Capital Partners or ArcLight-managed investment vehicles and to ArcLight's infrastructure strategy.
- Verify whether `ArcLight Capital` is merely a shortened census label for `ArcLight Capital Partners`.
- Determine the exact ArcLight fund, legal holding vehicle, stake, announcement date, closing/entry date and transaction state if publicly disclosed. Do not infer Fund VII, Fund VIII, a legal vehicle or a numeric stake from timing, fund vintage, a financing borrower, or ArcLight's general materials.
- Treat “plurality ownership interest” as a disclosed qualitative stake, not a numeric percentage. Do not convert Repsol's sale of a 20% interest to ArcLight and Centaurus into an ArcLight percentage unless the split is directly disclosed.
- Research every supported current and former co-owner. Distinguish infrastructure-company ownership from upstream working interests in Leon/Castile. Do not treat LLOG's operator role as equity ownership unless a source says so.
- Verify Repsol's original 22.5% interest, its December 1, 2023 sale of 20% to ArcLight and Centaurus, and its retained 2.5% only if the opened direct source supports each point. Determine whether a later transfer changed that retained interest.
- Determine whether Beacon's reported 0.5% FPS/lateral interest transfer to an O.G. Oil & Gas affiliate affects the infrastructure ownership ledger, and include it only with direct support.
- Search explicitly for subsequent sales, exits, restructurings, refinancing, dissolution and signed pending ownership transactions through 2026-08-15.
- Verify the 2022 development/ownership arrangement, construction, regulatory approval, September 2025 first production, current operating status, capacity, water depth, fields served, operator and U.S. geography.
- Produce two to four list-level milestones sufficient for a new record. Do not turn every well, field or tieback into a separate company.
- Every included fact must have a direct URL whose opened page supports it. One source is sufficient when it directly proves the fact; add evidence when identity, ownership, current status, geography, strategy, fund, entry date, stake or boundary is not established by the first.

## Existing-repository guardrails

- Do not add a second ArcLight organization merely because the census uses the shorter label.
- Do not create separate companies for Salamanca Infrastructure's finance and asset SPVs.
- Do not combine the Salamanca midstream infrastructure owners with the Leon/Castile upstream working-interest owners unless direct evidence proves they are the same ownership interests.
- Do not count LLOG Exploration itself, the Leon or Castile fields, individual wells, leases, subsea equipment, the 30-mile KCC tieback or other laterals as separate PortCos in this task.
- Do not infer that ArcLight owns 100%, a majority, or any numeric percentage. Preserve only the exact qualitative or numeric stake publicly disclosed.
- Do not treat the first-lien loan issued by Salamanca Infrastructure as ArcLight ownership evidence.
- If a new record is supported, return one complete canonical list-ready record with one recommended primary citation and enumerate every proposed relation.

## Output contract

Return one JSON object in a fenced `json` block, followed by a concise Markdown review. Use this top-level shape:

```json
{
  "asOfDate": "2026-08-15",
  "requestedCompany": "Salamanca",
  "requestedManager": "ArcLight Capital",
  "decision": "PROPOSED_NEW | VERIFIED_EXISTING_MATCH | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
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
  "ownershipResolution": {
    "managerAliasDecision": "",
    "currentOwners": [],
    "formerOwners": [],
    "pendingOwnershipTransactions": [],
    "operator": null,
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
    "initialOwnershipArrangement": "",
    "repsolTransaction": "",
    "otherOwnershipChanges": "",
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

Before answering, verify that every included active owner has direct current evidence and that a subsequent-exit search was performed. If ArcLight's equity ownership and current status are supported but its exact fund, legal vehicle, percentage or legal closing date are not, use `NOT_PUBLICLY_DISCLOSED`; do not hide the distinction and do not invent those fields.
