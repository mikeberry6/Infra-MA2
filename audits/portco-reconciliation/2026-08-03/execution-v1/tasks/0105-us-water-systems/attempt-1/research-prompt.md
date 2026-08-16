# US Water Systems — Phase 1 list reconciliation

Freshly research **US Water Systems** as of **2026-08-16**. This is one manager-level PortCo list and identity decision, not a full scorecard. Requested manager: **Argo Infrastructure Partners**.

The manager census treated two assets as separately countable current Argo holdings: **Bayonne water and wastewater concession** and **Middletown Water Joint Venture LLC**. It excluded the repository's `US Water Systems` row as a duplicate umbrella label. That conclusion is not assumed correct: reopen all evidence and determine the real manager-level boundary.

Current production has three published records that may overlap:

- `US Water Systems` (`cmrxpj62g00ipivhe4zr74wn1`): described as a two-concession platform; one active Argo period from 2017 with vehicle text `Argo Infrastructure Partners (Apollo)`; no website; founded/HQ fields currently inferred as 2012 and `New Jersey & Pennsylvania`.
- `Bayonne water and wastewater concession` (`cmrxpj76y00keivhellw38dtk`): standalone 40-year Bayonne, New Jersey concession; active Argo period from 2017.
- `Middletown Water Joint Venture LLC` (`cmrxpj7b200klivhel3gtzeza`): standalone Middletown, Pennsylvania concessionaire; active Argo period from 2017.

Existing records claim KKR/SUEZ interests moved to Argo in 2017. Census evidence also references an Apollo transaction described as giving Apollo exposure to Argo's water infrastructure. Treat all existing facts as claims to verify. Do not infer that Apollo became the direct legal owner, that `US Water Systems` is a legal company, or that Argo remains current without fresh evidence.

Resolve:

1. whether `US Water Systems` is a real legal/operating platform, an Argo portfolio label, a holding company, or merely a repository umbrella label;
2. the exact legal and operating relationship among US Water Systems, Bayonne's concessionaire/operator entities, Middletown Water Joint Venture LLC, SUEZ/United Water/Veolia, Water Capital Partners, Argo-managed funds, and Apollo-managed capital;
3. whether Bayonne and Middletown are separately held standalone investments or subsidiaries/assets beneath one manager-level platform under our anti-double-counting rule;
4. which exact production identity or identities should remain published, and whether any record can truthfully redirect to one canonical company; do not force a one-to-many redirect;
5. announcement and closing dates, sellers, buyers, vehicles, stakes and current status for Argo's entry and any Apollo transaction;
6. a full sale, transfer, refinancing, restructuring, concession termination and later-exit search through 2026-08-16;
7. whether the existing 2017 investment year, active ownership, founding year, headquarters, milestones and descriptions are supportable;
8. North American and infrastructure-strategy qualification and only the operating facts needed for a list-ready decision.

Apply this boundary rule: count the manager-level operating company/platform when one genuinely exists; otherwise count separately owned standalone concession assets. Do not count both a platform and its underlying concessions. Do not merge one umbrella record into a single asset merely to satisfy tooling if the umbrella represents two assets. If a supported correction cannot be represented safely as one canonical merge, return `DEFERRED` and explain the exact required data-model action.

Prefer direct manager, company, municipal, regulatory, court, filing and concession documents. Open direct pages/documents, not snippets. Search explicitly for acquisitions and subsequent exits. Start with:

- https://wcpartnersllc.com/project/middletown-concession/
- https://www.bayonnenj.org/content/236/default.aspx
- https://www.suez-asia.com/-/media/suez-global/files/publication/annual-report/document-de-reference-2018-en.pdf
- https://www.globalwaterintel.com/articles/argo-deal-gives-apollo-water-infrastructure-exposure
- https://middletownborough.com/wp-content/uploads/2020/12/Executed-Concession-Agreement-A4495119.pdf
- Argo, Apollo, Veolia/SUEZ, Bayonne and Middletown current filings/news/portfolio pages

Return one complete fenced `json` object followed by a concise Markdown review. No narration before the JSON. Keep the response under 7,000 characters; shorten prose rather than truncating JSON. Include every key:

```json
{
  "asOfDate": "2026-08-16",
  "requestedCompany": "US Water Systems",
  "requestedManager": "Argo Infrastructure Partners",
  "decision": "VERIFIED_EXISTING_MATCH | PROPOSED_CORRECTION | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
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
    "currentLegalOwners": [],
    "currentInfrastructureManagerOwners": [],
    "formerInfrastructureManagerOwners": [],
    "pendingOwnershipTransactions": [],
    "apolloTransactionTreatment": "",
    "duplicateOwnerAction": ""
  },
  "recordDisposition": {
    "usWaterSystems": "KEEP | RETIRE | CORRECT | DEFER",
    "bayonneConcession": "KEEP | RETIRE | CORRECT | DEFER",
    "middletownConcession": "KEEP | RETIRE | CORRECT | DEFER",
    "canonicalKeepCompanyId": null,
    "retiredCompanyIds": [],
    "redirectsAreTruthful": false,
    "requiredApplicationMechanism": ""
  },
  "operatingResolution": {
    "sector": "UTILITIES",
    "subsector": "",
    "region": "NORTH_AMERICA",
    "countryTags": ["United States"],
    "description": "",
    "companyStatus": "ACTIVE | REALIZED",
    "yearFounded": null,
    "services": "",
    "customersAndEndMarkets": "",
    "footprint": "",
    "disclosedScale": []
  },
  "acquisitionExitCheck": {
    "argoEntry": "",
    "apolloTransaction": "",
    "currentStatus": "",
    "subsequentExitOrTerminationSearch": ""
  },
  "milestones": [],
  "evidence": [],
  "beforeAfterChanges": [],
  "excludedOrDuplicateCandidates": [],
  "unresolvedQuestions": [],
  "recommendedListAction": ""
}
```

Owner rows may contain only `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState`; use `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`. Evidence rows may contain only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, and `isRecommendedPrimary`; recommend exactly one primary. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps. Use `UNRESOLVED` for identity or current legal ownership uncertainty; either requires `DEFERRED`.
