# OnPoint Energy — Phase 1 list-reconciliation research

You are researching one infrastructure portfolio-company candidate for a North American ownership census. Perform fresh, current web research as of **2026-08-14**. Open direct source pages; do not rely on search-result snippets.

## Task identity

- Requested company: **OnPoint Energy**
- Requested infrastructure manager: **ArcLight Capital Partners, LLC**
- Census holding ID: `012-arclight-capital:holding:020:onpoint-energy`
- Census status: `NEEDS_REVIEW`, low confidence
- Census evidence: <https://arclight.com/investments/>
- Existing production company: none
- Existing evaluated seed company: none
- Candidate canonical mappings: none
- Important guardrail: **Onward Energy** is an existing, separate JPMAM / IIF-owned company. Do not merge OnPoint Energy into Onward Energy based on name similarity.

The census describes OnPoint Energy only as a U.S. power-generation and energy-infrastructure platform currently owned by ArcLight. It provides no legal identity, website, headquarters, fund, vehicle, stake, investment date, or platform-boundary detail.

## Required decision

Determine which outcome is correct:

1. `PROPOSED_NEW` — a distinct manager-level operating company or platform currently owned by ArcLight and qualifying as North American infrastructure.
2. `SUPERSEDED_OR_DUPLICATE` — it is demonstrably another canonical company's alias, predecessor, successor, or duplicate.
3. `EXCLUDED` — it is only a project, subsidiary beneath another counted platform, holding shell, debt exposure, LP/fund exposure, public security, non-infrastructure strategy holding, or realized/stale investment.
4. `DEFERRED` — identity or current legal ownership remains unresolved after reasonable direct-source research.

Do not infer a company, owner, vehicle, stake, date, or geography from a generic portfolio listing. Use `NOT_PUBLICLY_DISCLOSED` for unavailable noncritical facts. Use `UNRESOLVED` for identity or active ownership uncertainty; either unresolved item requires `DEFERRED`.

## Research requirements

- Establish the exact legal/canonical identity, aliases, predecessor/successor names, official website, headquarters, and country.
- Resolve whether OnPoint Energy is an independent operating platform versus an asset, project, subsidiary, brand, or holding shell.
- Establish current and former legal owners and direct evidence tying ArcLight's position to an infrastructure strategy, fund, vehicle, managed account, or direct infrastructure mandate.
- Find the acquisition or formation announcement and legal closing, if public. Distinguish announcement from closing.
- Search explicitly for subsequent sales, exits, restructurings, dissolutions, renamings, and pending transactions through 2026-08-14.
- Establish stake and entry/exit dates only when publicly disclosed.
- Establish North American geography and the operating infrastructure scope.
- Search for exact-name and likely legal-entity variants, but do not merge any identity without direct evidence.
- Prefer official company, manager, regulatory, government, filing, or counterparty sources. Reliable secondary sources may fill gaps.
- Every included fact must have a direct URL whose opened page supports it. One source is sufficient when it directly proves the relevant fact; add another when ownership, current status, geography, or platform boundary is not established by the first.

If the correct outcome is `PROPOSED_NEW`, provide a list-ready record with:

- canonical company name and aliases
- sector, subsector, region, country, and country tags
- concise factual description
- company status
- website, founding year, and headquarters when public
- each current/former ownership period with manager, fund, vehicle, stake, entry/exit date or year, active flag, and transaction state
- any signed pending ownership transaction separately from closed ownership
- two to four material milestones, including ArcLight's investment/closing
- exactly one recommended primary citation

## Output contract

Return one JSON object in a fenced `json` block, followed by a concise Markdown review. Use this top-level shape:

```json
{
  "asOfDate": "2026-08-14",
  "requestedCompany": "OnPoint Energy",
  "requestedManager": "ArcLight Capital Partners, LLC",
  "decision": "PROPOSED_NEW | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
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
  "excludedOrDuplicateCandidates": [],
  "unresolvedQuestions": [],
  "recommendedListAction": ""
}
```

For ownership rows, include only supported fields from: `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState` (`CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`).

Before answering, verify that a `PROPOSED_NEW` decision has direct evidence for identity, current ArcLight ownership, infrastructure-strategy basis, North American qualification, and an exit search. If any of identity or current ownership remains unresolved, return `DEFERRED` instead.
