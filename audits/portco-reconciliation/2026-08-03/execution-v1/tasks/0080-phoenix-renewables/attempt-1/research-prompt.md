# Phoenix Renewables — Phase 1 list-reconciliation research

You are researching one infrastructure portfolio-company record for a North American ownership census. Perform fresh, current web research as of **2026-08-14**. Open direct source pages; do not rely on search-result snippets.

## Task identity

- Requested company: **Phoenix Renewables**
- Requested infrastructure manager: **ArcLight Capital** (resolve this census label against the repository's **ArcLight Capital Partners** organization; do not create a duplicate owner merely because the labels differ)
- Census holding ID: `012-arclight-capital:holding:011:phoenix-renewables`
- Census status: `CLOSED_ACTIVE`, high confidence
- Census evidence: <https://arclight.com/investments/>
- Existing production company ID: `cmrxpj6im00jeivhecwke4ndp`
- Existing canonical key: `phoenix-renewables|united-states`
- Existing evaluated seed key: `phoenix renewables|United States`
- Queue action to sense-check, not assume: `ADD_OWNER`

The current production and evaluated-seed records already contain one active ownership period:

- Manager / organization: **ArcLight Capital Partners**
- Fund and displayed vehicle: **ArcLight Infrastructure Partners Fund VIII**
- Stake: not publicly disclosed
- Investment year: **2024**
- State: `CLOSED_ACTIVE`

Current record summary, all of which must be treated as claims to verify rather than trusted facts:

- Name: Phoenix Renewables
- Country / region: United States / North America
- Sector / subsector: Power & Energy Transition / Operating Renewables Portfolio
- Headquarters: United States
- Status: Active
- Website and founding year: not publicly disclosed
- Boundary claim: an operating portfolio of renewable generation assets managed through SkyVest Renewables, rather than SkyVest itself or one underlying project
- Current sources:
  - <https://arclight.com/investments/>
  - <https://arclight.com/portfolio-services/>
  - <https://www.prnewswire.com/news-releases/arclight-announces-operating-focused-renewables-initiative-and-new-wind-investment-302207994.html>

Current milestone claims:

1. `2024` — Phoenix Renewables became part of ArcLight's operating-focused renewables initiative.
2. `Jul 2024` — ArcLight launched SkyVest Renewables and disclosed Phoenix Renewables as one of the initial Fund VIII portfolios it would manage.

Important guardrails:

- Do not add a second ArcLight owner if `ArcLight Capital` and `ArcLight Capital Partners` are the same manager for this holding.
- Do not conflate Phoenix Renewables with **SkyVest Renewables**, **Thunderbird Renewables**, the **Mesquite Sky** wind project, another unrelated Phoenix-named renewable developer, or any individual project/subsidiary beneath Phoenix.
- Determine whether Phoenix Renewables is itself a manager-level portfolio/platform record or only an internal portfolio label/passive holding shell that should not be counted independently.
- Do not infer that ArcLight acquired Phoenix in 2024 merely because SkyVest launched or began managing it in 2024. Preserve `investmentYear: 2024` only if a direct source supports ArcLight's entry/closing in that year; otherwise recommend an exact correction or `NOT_PUBLICLY_DISCLOSED`.
- Do not infer full ownership, a percentage stake, website, founding year, headquarters, or asset capacity.

## Required decision

Determine which outcome is correct:

1. `VERIFIED_NO_CHANGE` — the current canonical company and its single ArcLight Capital Partners / Fund VIII ownership period already represent the census holding correctly, so the queued `ADD_OWNER` must not create a duplicate.
2. `PROPOSED_CORRECTION` — Phoenix remains in scope but one or more list-level identity, boundary, geography, active-owner, vehicle, stake, investment-year, status, milestone, or primary-citation claims require an exact correction.
3. `SUPERSEDED_OR_DUPLICATE` — Phoenix is demonstrably another canonical company's alias, predecessor, successor, subsidiary, or duplicate.
4. `EXCLUDED` — it is only a project, passive holding shell, debt exposure, LP/fund exposure, public security, non-infrastructure holding, or realized/stale investment.
5. `DEFERRED` — canonical identity or current legal ownership remains unresolved after reasonable direct-source research.

Use `NOT_PUBLICLY_DISCLOSED` for unavailable noncritical facts. Use `UNRESOLVED` for canonical identity or active-ownership uncertainty; either unresolved item requires `DEFERRED`.

## Research requirements

- Establish Phoenix Renewables' exact public identity, aliases, website (if any), headquarters, country, and platform boundary.
- Determine whether it is a distinct manager-level renewable operating portfolio/platform suitable for one PortCo record.
- Reopen ArcLight's current investments and portfolio-services pages and establish whether Phoenix remains a current Fund VIII investment as of 2026-08-14.
- Establish direct evidence tying the position to ArcLight's infrastructure strategy, Fund VIII, vehicle, or direct infrastructure mandate.
- Verify whether `ArcLight Capital` in the census is merely a short label for `ArcLight Capital Partners`.
- Find the formation or acquisition announcement and legal closing if public. Distinguish an ownership closing from SkyVest's later management-platform launch.
- Search explicitly for subsequent sales, exits, restructurings, dissolutions, renamings, and signed pending transactions through 2026-08-14.
- Establish stake and entry/exit dates only when publicly disclosed.
- Verify the North American qualification and operating-infrastructure scope.
- Prefer official company, manager, regulatory, government, filing, or counterparty sources. Reliable secondary sources may fill gaps.
- Every included fact must have a direct URL whose opened page supports it. One source is sufficient when it directly proves the fact; add evidence when ownership, current status, geography, fund, entry year, or platform boundary is not established by the first.

Potential sources to reopen and assess include:

- ArcLight investments: <https://arclight.com/investments/>
- ArcLight portfolio services: <https://arclight.com/portfolio-services/>
- ArcLight / SkyVest launch release: <https://www.prnewswire.com/news-releases/arclight-announces-operating-focused-renewables-initiative-and-new-wind-investment-302207994.html>
- ArcLight 2025 ESG report, if publicly available on the manager's domain
- Regulatory or transaction records found under the exact Phoenix Renewables name or a directly established legal-entity alias

These links are leads only. Reopen them and state exactly what each supports.

If the outcome is `PROPOSED_CORRECTION`, provide a complete corrected list-ready record and identify each exact before/after change. If it is `VERIFIED_NO_CHANGE`, explicitly state that the existing one-owner period satisfies the census holding and that no second ArcLight ownership row should be added.

## Output contract

Return one JSON object in a fenced `json` block, followed by a concise Markdown review. Use this top-level shape:

```json
{
  "asOfDate": "2026-08-14",
  "requestedCompany": "Phoenix Renewables",
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
    "pendingOwnershipTransactions": []
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
    "footprint": null
  },
  "acquisitionExitCheck": {
    "formationOrAcquisition": "",
    "legalClosing": "",
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

For ownership rows, include only supported fields from: `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState` (`CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`).

Before answering, verify that any included active ownership has direct current evidence and a documented exit search. If the evidence supports ArcLight ownership and Fund VIII but not a 2024 acquisition, do not hide that distinction: return the precise correction needed rather than treating the SkyVest launch as ArcLight's investment date.
