# Pike Holdings — Phase 1 list-reconciliation research

You are researching one infrastructure portfolio-company record for a North American ownership census. Perform fresh, current web research as of **2026-08-15**. Open direct source pages; do not rely on search-result snippets.

## Task identity

- Requested company label: **Pike Holdings**
- Requested infrastructure manager: **ArcLight Capital** (resolve this census label against the repository's **ArcLight Capital Partners** organization; do not create a duplicate manager merely because the labels differ)
- Census holding ID: `012-arclight-capital:holding:013:pike-holdings`
- Census evidence lead: <https://arclight.com/investments/>
- Queue status: `NEEDS_REVIEW`
- Queue action to sense-check, not assume: `PROPOSED_CORRECTION`
- Current production and evaluated seed contain **no exact Pike Holdings record**.

The reconciliation queue identified one name-only heuristic candidate, **Pike Corporation** (`pike.com`, production ID `cmrxpjob301b2ivhenp2i7eq1`). Treat that relationship as an unverified hypothesis, not a fact. The existing Pike Corporation record describes a Mount Airy, North Carolina utility-construction and engineering company currently associated with TPG, La Caisse and management. Do not merge, redirect, supersede or change that record unless direct evidence establishes that it is the same entity as ArcLight's Pike holding.

There is also a distinct repository record for **Pike County Light & Power**, a Pennsylvania regulated utility. Do not conflate it with either Pike Holdings or Pike Corporation.

Potential identity leads that must be independently reopened and tested include:

- A November 2021 SEC contribution agreement that may define **Pike Petroleum Holdings, LLC** as “Pike Holdings” and show a holding-company chain above TransMontaigne Partners: <https://www.sec.gov/Archives/edgar/data/1319229/000110465921141709/tm2133423d1_ex10-1.htm>
- TransMontaigne's latest annual filing: <https://www.sec.gov/Archives/edgar/data/1319229/000110465926032830/tmb-20251231x10k.htm>
- A September 2025 TransMontaigne release filed with the SEC: <https://www.sec.gov/Archives/edgar/data/1319229/000110465925086822/tm2524750d1_ex99-1.htm>
- NGL's February 1, 2016 closing release: <https://www.sec.gov/Archives/edgar/data/1504461/000110465916094285/a16-3576_1ex99d1.htm>
- ArcLight/TransMontaigne's November 2018 take-private announcement: <https://www.sec.gov/Archives/edgar/data/1319229/000110465918069905/a18-40638_1ex99d1.htm>
- TransMontaigne's February 2019 closing filing: <https://www.sec.gov/Archives/edgar/data/1319229/000110465919011614/a19-5348_28k.htm>
- TransMontaigne's official profile: <https://www.transmontaignepartners.com/about-us/>

These links are leads only. Reopen them and state exactly what each supports.

## Required decision

Determine which outcome is correct:

1. `PROPOSED_NEW` — ArcLight's Pike label resolves to a distinct manager-level operating company or platform that is absent from production and seed; provide a complete canonical list-ready record.
2. `PROPOSED_CORRECTION` — an existing production company is the exact entity but its name, aliases, boundary or ownership requires correction.
3. `SUPERSEDED_OR_DUPLICATE` — Pike Holdings is demonstrably an alias, predecessor, successor or parent label for an existing canonical PortCo; identify that company and the exact mapping.
4. `EXCLUDED` — Pike Holdings is only an internal/passive holding shell, project, subsidiary, debt exposure, LP/fund exposure, public security, non-infrastructure holding or realized investment, with no appropriate manager-level operating platform to count.
5. `DEFERRED` — canonical identity or current legal ownership remains unresolved after reasonable direct-source research.

If Pike Holdings is an intermediate shell above a distinct manager-level operating platform, prefer the operating platform as the canonical PortCo and retain the shell/census labels as searchable aliases or boundary notes. Do not count both the shell and the operating platform. Use `NOT_PUBLICLY_DISCLOSED` for unavailable noncritical facts. Use `UNRESOLVED` for canonical identity or active-ownership uncertainty; either unresolved item requires `DEFERRED`.

## Research requirements

- Establish the exact legal identity represented by ArcLight's “Pike Holdings” label, including predecessors, successors, abbreviations, holding entities and operating subsidiaries.
- Determine whether the correct canonical PortCo is Pike Petroleum Holdings, TransMontaigne Partners, Pike Corporation, or another entity.
- Prove or disprove the queue's Pike Corporation heuristic match and separately exclude Pike County Light & Power.
- Determine whether the record is a manager-level operating platform or only a passive shell. Identify the single appropriate PortCo boundary and all assets/subsidiaries that should not be double-counted.
- Reopen ArcLight's current investments page and establish whether the investment remains current as of 2026-08-15.
- Establish direct evidence tying the position to ArcLight's infrastructure strategy and the exact fund or vehicle, if public.
- Verify all current and former legal owners, ownership/control percentages, announcement dates, legal closing dates, take-private dates and exit dates. Distinguish control from 100% ownership and platform ownership from intermediate-shell capitalization.
- Search explicitly for subsequent sales, exits, restructurings, asset dispositions, dissolutions, renamings and signed pending transactions through 2026-08-15. Asset-level sales do not establish a platform exit unless the evidence says so.
- Verify the North American qualification, infrastructure classification, headquarters and operating footprint.
- Prefer official company, manager, regulatory, government or filing sources. Reliable secondary sources may fill gaps.
- Every included fact must have a direct URL whose opened page supports it. One source is sufficient when it directly proves the fact; add evidence when identity, ownership, current status, geography, fund, entry year, stake or platform boundary is not established by the first.

## Existing-repository guardrails

- Do not change or merge the existing Pike Corporation record merely because both names contain “Pike.”
- Do not map former Morgan Stanley corporate ownership to **Morgan Stanley Infrastructure Partners** without direct strategy evidence.
- Do not treat lenders, preferred-capital providers or public limited partners as direct infrastructure owners.
- Do not count terminals, pipelines, storage facilities or local operating subsidiaries separately beneath an already-counted platform.
- Do not infer a current percentage at an intermediate shell from historical merger-proxy capitalization if later restructurings changed that shell.
- If the correct operating platform is absent from the repository, recommend exactly one new canonical company and state which later queue task, if any, should remain separate rather than be superseded.

## Output contract

Return one JSON object in a fenced `json` block, followed by a concise Markdown review. Use this top-level shape:

```json
{
  "asOfDate": "2026-08-15",
  "requestedCompany": "Pike Holdings",
  "requestedManager": "ArcLight Capital",
  "decision": "PROPOSED_NEW | PROPOSED_CORRECTION | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence": "HIGH | MEDIUM | LOW",
  "rationale": "",
  "identityResolution": {
    "canonicalLegalName": "",
    "aliases": [],
    "officialWebsite": null,
    "headquarters": null,
    "country": null,
    "platformBoundary": "",
    "pikeCorporationDecision": "",
    "pikeCountyLightPowerDecision": "",
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
    "initialControlAcquisition": "",
    "takePrivateOrFullOwnership": "",
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
  "recommendedListAction": "",
  "queueDisposition": {
    "pikeHoldingsTask": "",
    "pikeCorporationTask": ""
  }
}
```

For ownership rows, include only supported fields from: `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState` (`CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`).

Before answering, verify that every included active owner has direct current evidence and a documented exit search. If the evidence supports 100% ownership of an operating platform but not the same percentage at an intermediate Pike shell, preserve that distinction explicitly.
