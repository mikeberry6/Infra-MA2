# North American PortCo reconciliation — Zeem Solutions

Research one manager-level holding as of **2026-08-15**. Independently search the current web and return a list-reconciliation decision for **Zeem Solutions** under census manager **ArcLight Capital**.

## Existing repository claim to verify

- Existing canonical company: `Zeem Solutions`
- Production ID: `cmrxpj6nk00jnivhe6mtdjqda`
- Country: United States; region: North America
- Existing active owner: ArcLight Capital Partners
- Existing vehicle: `n.a.`; investment year: 2022; stake: not disclosed
- Existing company fields: founded 2020; headquarters `California`; no official website stored
- Existing milestones: 2020 founding, July 2022 LAZ Parking partnership, and July 6, 2022 $50 million Series A investment from ArcLight affiliates
- Census queue action: `ADD_OWNER` for manager label `ArcLight Capital`

Treat every field as an unverified claim. Determine whether `ArcLight Capital` is merely a shortened label for the existing ArcLight Capital Partners owner; do not add a duplicate owner if so. Also determine whether ArcLight's $50 million investment is direct equity ownership within its infrastructure strategy rather than debt-only exposure, and whether any fund or vehicle is publicly disclosed.

## Required research

Verify identity and legal/brand aliases, platform/subsidiary boundaries, current and former legal owners, ArcLight infrastructure-strategy basis, fund or vehicle, stake, announcement and legal closing dates, current status, later financings or restructurings, subsequent exits or signed pending transactions, official website, headquarters, founding year, services, customers/end markets, operating footprint, and publicly disclosed scale. Search explicitly for both the 2022 investment and any later exit through the as-of date.

Keep Zeem Solutions as the manager-level company unless evidence establishes a different canonical boundary. Do not count LAZ Parking, fleet customers, charging depots, projects, or financing providers as owners without direct evidence. Do not infer a fund, ownership percentage, headquarters, or legal closing date.

Open direct pages. These are leads, not assumed facts:

- https://arclight.com/investments/
- https://www.zeemsolutions.com/about
- https://www.zeemsolutions.com/press
- https://www.globenewswire.com/news-release/2022/07/06/2475140/0/en/Zeem-Solutions-EV-Fleet-as-a-Service-Provider-Secures-50-Million-Capital-Investment-from-Affiliates-of-ArcLight-Capital-Partners-Announces-Strategic-Partnership-with-LAZ-Parking-Re.html

Choose exactly one decision: `VERIFIED_NO_CHANGE`, `PROPOSED_CORRECTION`, `SUPERSEDED_OR_DUPLICATE`, `EXCLUDED`, or `DEFERRED`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical unavailable facts. Use `UNRESOLVED` only for identity or active ownership uncertainty; either unresolved item requires `DEFERRED`.

## Output contract — compact and complete

Return exactly one fenced `json` object followed by a Markdown review of no more than five bullets. Do not output research narration before the JSON. Keep the JSON compact: every ordinary string under 300 characters, the description under 600 characters, at most four milestones, and at most ten evidence rows. Do not omit any required key.

```json
{
  "asOfDate": "2026-08-15",
  "requestedCompany": "Zeem Solutions",
  "requestedManager": "ArcLight Capital",
  "decision": "",
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
    "footprint": null,
    "scale": []
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

For ownership rows, include only supported fields from `manager`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState`. Verify every active owner with a current direct source and a documented exit search. A complete parseable JSON object is mandatory.
