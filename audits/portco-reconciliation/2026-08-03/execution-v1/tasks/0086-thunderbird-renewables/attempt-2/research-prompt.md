# North American PortCo reconciliation — Thunderbird Renewables

Research one manager-level holding as of **2026-08-15**. Independently search the current web and return a list-reconciliation decision for **Thunderbird Renewables** under census manager **ArcLight Capital**.

## Existing repository claim to verify

- Existing canonical company: `Thunderbird Renewables`
- Production ID: `cmrxpj6mi00jlivhev0ljria1`
- Country: United States; region: North America
- Existing active owner: ArcLight Capital Partners
- Existing fund: ArcLight Infrastructure Partners Fund VIII
- Existing investment year: 2024
- Existing headquarters: United States
- Existing milestones: a generic 2024 entry and a July 2024 SkyVest launch
- Census queue action: `ADD_OWNER` for manager label `ArcLight Capital`

Treat every existing field as an unverified claim. Determine whether `ArcLight Capital` is merely a shortened label for the existing ArcLight Capital Partners owner; do not add a duplicate owner if so.

## Required research

Verify identity, platform/project boundaries, Fund VIII attribution, current status, North American operating-infrastructure scope, stake, investment announcement and legal closing dates, subsequent exits or signed pending transactions, headquarters, website, founding year, and disclosed scale. Search explicitly for both acquisitions and later exits through the as-of date.

Do not conflate Thunderbird with SkyVest Renewables, Phoenix Renewables, or individual projects/subsidiaries. Project-level percentages may not be treated as a manager-level Thunderbird stake.

Open direct pages. These are leads, not assumed facts:

- https://arclight.com/investments/
- https://arclight.com/portfolio-services/
- https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf
- https://www.prnewswire.com/news-releases/arclight-announces-operating-focused-renewables-initiative-and-new-wind-investment-302207994.html
- https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250303-5288
- https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250328-5462
- https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250313-5247
- https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250430-5412
- https://elibrary.ferc.gov/eLibrary/filelist?accession_number=20250708-5177

Choose exactly one decision: `VERIFIED_NO_CHANGE`, `PROPOSED_CORRECTION`, `SUPERSEDED_OR_DUPLICATE`, `EXCLUDED`, or `DEFERRED`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical unavailable facts. Use `UNRESOLVED` only for identity or active ownership uncertainty; either unresolved item requires `DEFERRED`.

## Output contract — compact and complete

Return exactly one fenced `json` object followed by a Markdown review of no more than five bullets. Do not output research narration before the JSON. Keep the JSON compact: every ordinary string under 300 characters, the description under 600 characters, at most three milestones, and at most ten evidence rows. Do not omit any required key.

```json
{
  "asOfDate": "2026-08-15",
  "requestedCompany": "Thunderbird Renewables",
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
