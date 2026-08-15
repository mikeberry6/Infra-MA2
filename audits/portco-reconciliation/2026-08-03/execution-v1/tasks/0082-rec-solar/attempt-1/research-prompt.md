# REC Solar — Phase 1 list-reconciliation research

You are researching one infrastructure portfolio-company record for a North American ownership census. Perform fresh, current web research as of **2026-08-15**. Open direct source pages; do not rely on search-result snippets.

## Task identity

- Requested company: **REC Solar**
- Requested infrastructure manager: **ArcLight Capital** (resolve this census label against the repository's **ArcLight Capital Partners** organization; do not create a duplicate owner merely because the labels differ)
- Census holding ID: `012-arclight-capital:holding:012:rec-solar`
- Census evidence lead: <https://arclight.com/investments/>
- Existing production company ID: `cmrxpj6jr00jgivheinookosn`
- Existing canonical key: `rec-solar|united-states`
- Existing evaluated seed key: `rec solar|United States`
- Queue action to sense-check, not assume: `ADD_OWNER`

The current production and evaluated-seed records already contain one active ownership period:

- Manager / organization: **ArcLight Capital Partners**
- Fund: not separately recorded
- Displayed vehicle: **ArcLight Energy Partners Fund VII**
- Stake: not publicly disclosed
- Investment year: **2023**
- State: `CLOSED_ACTIVE`

Do not add a second ArcLight row if `ArcLight Capital` and `ArcLight Capital Partners` are the same manager for this holding. Determine whether the existing single ownership period already satisfies the census holding and whether the Fund VII attribution is directly supported.

Current record summary, all of which must be treated as claims to verify rather than trusted facts:

- Name: REC Solar
- Country / region: United States / North America
- Sector / subsector: Power & Energy Transition / Distributed Solar & Storage
- Status: Active
- Website: not recorded
- Founded: 1997
- Headquarters: United States only; no city or state recorded
- Description: REC Solar develops, installs, owns and operates distributed solar, storage, fuel-cell and microgrid systems for commercial and public-sector customers; company materials claim more than 700 projects across 29 states.
- Boundary claim: REC Solar is the manager-level commercial distributed-energy operating platform acquired as part of Duke Energy's commercial distributed-generation portfolio, not every underlying solar project or the entire former Duke portfolio as a second company.

Current milestone claims:

1. `1997` — REC Solar was founded in California.
2. `Oct 4, 2023` — Duke Energy completed the sale of its commercial distributed-generation portfolio, including REC Solar, to an investment fund managed by ArcLight.
3. `2025` — REC Solar stated that it had delivered more than 700 projects across 29 states.

Current source leads, which must be reopened and assessed:

- Duke Energy closing release: <https://investors.duke-energy.com/news/news-details/2023/Duke-Energy-completes-sale-of-commercial-distributed-generation-portfolio-including-REC-Solar-to-ArcLight/default.aspx>
- ArcLight current investments: <https://arclight.com/investments/>
- REC Solar official site: <https://recsolar.com/>
- REC Solar “Why REC Solar”: <https://recsolar.com/why-rec-solar/>
- REC Solar company-history article: <https://recsolar.com/resources/blog/powering-possibilities-the-evolution-of-rec-solar/>

These links are leads only. Reopen them and state exactly what each supports.

## Required decision

Determine which outcome is correct:

1. `VERIFIED_NO_CHANGE` — the current canonical company and its single ArcLight Capital Partners ownership period already represent the census holding correctly, including every retained fund/vehicle, date and status claim, so the queued `ADD_OWNER` must not create a duplicate.
2. `PROPOSED_CORRECTION` — REC Solar remains in scope but one or more list-level identity, boundary, website, geography, owner, fund, vehicle, stake, investment date, status, milestone or primary-citation claims require an exact correction.
3. `SUPERSEDED_OR_DUPLICATE` — REC Solar is demonstrably another canonical company's alias, predecessor, successor, subsidiary or duplicate and should not remain a separate canonical PortCo.
4. `EXCLUDED` — REC Solar is only a project, passive holding shell, debt exposure, LP/fund exposure, public security, non-infrastructure business, or realized/stale investment.
5. `DEFERRED` — canonical identity or current legal ownership remains unresolved after reasonable direct-source research.

Use `NOT_PUBLICLY_DISCLOSED` for unavailable noncritical facts. Use `UNRESOLVED` for canonical identity or active-ownership uncertainty; either unresolved item requires `DEFERRED`.

## Research requirements

- Establish REC Solar's exact current legal/public identity, official website, aliases, predecessors or successors, headquarters, country and platform boundary.
- Distinguish REC Solar from REC Group, REC Silicon, Renewable Energy Corporation, unrelated REC-branded businesses, and every individual project or subsidiary beneath the platform.
- Determine whether REC Solar remains a distinct manager-level commercial distributed-energy platform suitable for one PortCo record after ArcLight's acquisition of Duke Energy's broader commercial distributed-generation portfolio.
- Reopen ArcLight's current investments page and establish whether REC Solar remains a current ArcLight investment as of 2026-08-15.
- Establish direct evidence tying the position to ArcLight's infrastructure or energy-transition strategy and the exact fund and legal acquisition vehicle, if public.
- Verify whether **ArcLight Energy Partners Fund VII** is directly disclosed for REC Solar. Do not convert a fund name into a legal vehicle, or retain Fund VII merely because it appears in the repository. If public evidence says only “investment funds managed by ArcLight,” preserve that narrower disclosure.
- Verify whether `ArcLight Capital` in the census is merely a shortened label for `ArcLight Capital Partners`.
- Find the acquisition announcement and legal closing. Distinguish the sale of Duke's asset portfolio from the transfer of the REC Solar operating company.
- Determine the supported current stake. Do not infer 100%, majority or another percentage from a sale announcement unless a source establishes it.
- Verify Duke Energy's former ownership and acquisition/exit dates when direct sources establish them; do not create a current Duke ownership row.
- Search explicitly for subsequent sales, exits, restructurings, dissolutions, renamings and signed pending transactions through 2026-08-15.
- Verify founding year, company scale, services, customer/end-market scope, U.S. footprint and any precise headquarters location retained in a list-ready record.
- Prefer official company, manager, counterparty, regulatory, government or filing sources. Reliable secondary sources may fill gaps.
- Every included fact must have a direct URL whose opened page supports it. One source is sufficient when it directly proves the fact; add evidence when ownership, current status, geography, fund, entry date, stake or platform boundary is not established by the first.

## Existing-repository guardrails

- Do not add a second ArcLight owner merely because the census uses the shorter manager label.
- Do not infer Fund VII, a special-purpose acquisition vehicle or a stake percentage from transaction timing, fund vintage or ArcLight's general fund materials.
- Do not count the entire former Duke commercial distributed-generation asset portfolio and REC Solar separately unless direct evidence establishes two manager-level operating platforms.
- Do not count individual solar, storage, microgrid, fuel-cell or development projects beneath REC Solar as separate PortCos.
- Do not map former corporate owner Duke Energy to an infrastructure-fund strategy.
- If the current record is correct except the queued owner addition is stale, return `VERIFIED_NO_CHANGE` and explicitly suppress that duplicate action.
- If any retained field changes, return one complete corrected list-ready record and enumerate the exact before/after differences.

## Output contract

Return one JSON object in a fenced `json` block, followed by a concise Markdown review. Use this top-level shape:

```json
{
  "asOfDate": "2026-08-15",
  "requestedCompany": "REC Solar",
  "requestedManager": "ArcLight Capital",
  "decision": "VERIFIED_NO_CHANGE | PROPOSED_CORRECTION | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence": "HIGH | MEDIUM | LOW",
  "rationale": "",
  "identityResolution": {
    "canonicalLegalName": "",
    "aliases": [],
    "officialWebsite": null,
    "headquarters": null,
    "country": null,
    "platformBoundary": "",
    "duplicateDecision": ""
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
    "dukeOwnershipHistory": "",
    "arcLightAnnouncement": "",
    "arcLightClosing": "",
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
  "beforeAfterChanges": [],
  "excludedOrDuplicateCandidates": [],
  "unresolvedQuestions": [],
  "recommendedListAction": ""
}
```

For ownership rows, include only supported fields from: `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState` (`CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`).

Before answering, verify that every included active owner has direct current evidence and a documented exit search. If ArcLight ownership and the October 2023 closing are supported but Fund VII, a legal vehicle or a stake is not, do not hide that distinction: return the precise correction and use `NOT_PUBLICLY_DISCLOSED` for the unsupported fields.
