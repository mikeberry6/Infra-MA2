# UGI Electric transmission and distribution utility business — Phase 1 list reconciliation

Freshly research **UGI Electric transmission and distribution utility business** as of **2026-08-16**. This is one manager-level PortCo list decision, not a full scorecard. Requested manager: **Argo Infrastructure Partners**.

The manager census found a definitive approximately **$470 million** agreement announced in April 2026 for funds managed by Argo to acquire **UGI Utilities, Inc.'s Pennsylvania electric utility division/business**. It treated Argo as `SIGNED_PENDING_INCOMING`. Production and evaluated seed contain no exact company record. Treat every census claim as unverified and reopen all sources.

Resolve whether the transaction is still signed and pending, has legally closed, was terminated, or changed by the as-of date. Do not show Argo as a current owner before legal closing. If still pending, create one list-ready company representing the separable regulated electric transmission-and-distribution utility business, keep UGI Utilities as the current legal corporate owner in the research narrative, and record Argo only in a pending incoming transaction. Do not invent an Argo fund, legal acquisition vehicle, stake percentage, exact expected closing date, headquarters, founding year or standalone website.

Independently establish:

1. the best canonical company/display identity and aliases for the acquired business, including whether official sources use `UGI Electric Division`, `UGI Utilities Electric Division`, `UGI Electric Utility`, or another name;
2. the boundary between this electric utility business, UGI Utilities, UGI Corporation, UGI's gas utility, generation assets and unrelated subsidiaries;
3. current legal ownership and the exact status of Argo's definitive agreement, including announcement date, buyer wording, seller, price, regulatory conditions, targeted closing language and any closing/termination update;
4. whether Pennsylvania PUC, FERC, HSR, SEC or other current filings provide a docket, approval, exact purchaser entity, legal close or revised timing;
5. the correct infrastructure-manager treatment: Argo equity acquisition versus debt or advisory exposure, and any publicly disclosed fund/vehicle or percentage;
6. North American qualification, Pennsylvania service territory, customers, transmission/distribution facilities and only the scale facts needed for a list-ready record;
7. a full subsequent-closing, later-sale, termination and pending-transaction search through 2026-08-16;
8. whether any existing or differently named portfolio company already represents this business.

The regulated electric utility business is the manager-level target. Do not create separate PortCos for transmission lines, distribution lines, substations, service territories, customers, UGI's gas division, UGI Corporation, UGI Utilities, individual facilities or regulatory dockets. Open direct pages/documents, not snippets. Prefer UGI/Argo releases, SEC filings, Pennsylvania PUC/FERC records and government sources. Use reliable secondary sources only to fill genuine gaps.

Start with:

- https://www.businesswire.com/news/home/20260427814373/en/UGI-Utilities-and-Argo-Infrastructure-Partners-Reach-Agreement-on-Purchase-and-Sale-of-UGIs-PA-Electric-Utility
- UGI Corporation and UGI Utilities 2026 SEC filings and investor materials
- Pennsylvania Public Utility Commission filings concerning the proposed electric-division sale
- Argo Infrastructure Partners' current investment and news pages

Return one complete fenced `json` object followed by a concise Markdown review. No narration before the JSON. Keep the response under 6,000 characters; shorten prose rather than truncating JSON. Include every key below:

```json
{
  "asOfDate": "2026-08-16",
  "requestedCompany": "UGI Electric transmission and distribution utility business",
  "requestedManager": "Argo Infrastructure Partners",
  "decision": "PROPOSED_NEW | VERIFIED_EXISTING_MATCH | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence": "HIGH | MEDIUM | LOW",
  "rationale": "",
  "identityResolution": {
    "canonicalLegalName": "",
    "canonicalDisplayName": "",
    "aliases": [],
    "officialWebsite": null,
    "headquartersOrOperatingLocation": null,
    "country": "United States",
    "platformBoundary": "",
    "duplicateDecision": ""
  },
  "ownershipResolution": {
    "managerAliasDecision": "",
    "currentLegalOwner": "",
    "currentInfrastructureManagerOwners": [],
    "formerInfrastructureManagerOwners": [],
    "pendingOwnershipTransactions": [],
    "duplicateOwnerAction": ""
  },
  "operatingResolution": {
    "sector": "UTILITIES",
    "subsector": "",
    "region": "NORTH_AMERICA",
    "countryTags": ["United States"],
    "description": "",
    "companyStatus": "ACTIVE",
    "yearFounded": null,
    "services": "",
    "customersAndEndMarkets": "",
    "footprint": "",
    "disclosedScale": []
  },
  "acquisitionExitCheck": {
    "announcement": "",
    "regulatoryStatus": "",
    "legalClosing": "",
    "subsequentExitOrTerminationSearch": ""
  },
  "milestones": [],
  "evidence": [],
  "proposedRelations": [],
  "excludedOrDuplicateCandidates": [],
  "unresolvedQuestions": [],
  "recommendedListAction": ""
}
```

Pending rows may contain only `direction`, `transactionState`, `counterpartyName`, `transactionDescription`, `announcedAt`, `expectedClosing`, and `evidenceUrls`; use `SIGNED_PENDING_INCOMING`. Infrastructure-manager owner rows may contain only `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState`; use `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, and `isRecommendedPrimary`; recommend exactly one primary.

Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps. Use `UNRESOLVED` only for identity or current legal ownership uncertainty; either requires `DEFERRED`. If the agreement remains pending, return zero current Argo owner periods and one pending incoming transaction. If direct evidence proves closing, return the supported active Argo ownership period and no stale pending transaction.
