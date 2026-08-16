# Dauntless Energy — Phase 1 PortCo reconciliation

Research **Dauntless Energy** as of **2026-08-15** using a fresh, current web search. Requested census manager: **Ardian**. This is a list/ownership decision, not a full scorecard.

Existing production company `cmrxpj6rw00jrivhelcbdhy6b` treats Dauntless as an active U.S. Ardian portfolio company: owner **Ardian**, fund and vehicle **Ardian Americas Infrastructure Fund IV (AAIF IV)**, entry year 2018, stake not disclosed. It describes Dauntless as the successor/rebrand of Skyline Renewables, with Skyline Renewables and 1370 Clean Energy as portfolios it manages; it has no recorded founding year or website and gives headquarters as “Texas; multi-state United States portfolio.” Treat every claim as unverified.

The census source holding was called **Skyline Renewables**, but the queue maps it to Dauntless and proposes `CORRECT_COMPANY`, not a new owner. Determine whether Dauntless is the same current manager-level operating platform/successor, whether Ardian/AAIF IV currently owns it, and whether Skyline Renewables and 1370 Clean Energy are portfolios/vehicles beneath it or separate manager-level PortCos. Verify legal/canonical identity and aliases, official site, headquarters, founding/rebrand timing, infrastructure basis, fund/vehicle, entry/closing date, stake, current status, and any subsequent sale, pending exit, or ownership change. Do not count projects, subsidiaries, managed portfolios, TPH, service providers, lenders, customers, or officers as owners without direct evidence. Do not infer a stake or exact closing date.

Open direct pages, including:

- https://www.dauntless-energy.com/
- https://www.dauntless-energy.com/about
- https://www.dauntless-energy.com/our-portfolios
- https://www.ardian.com/press-releases/ardian-infrastructure-partners-tph-create-skyline-renewables-and-acquires-60mw-wind

Search acquisitions and exits through the as-of date. Choose exactly one: `VERIFIED_NO_CHANGE`, `PROPOSED_CORRECTION`, `SUPERSEDED_OR_DUPLICATE`, `EXCLUDED`, or `DEFERRED`. `UNRESOLVED` identity or current ownership requires `DEFERRED`; use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps.

Return one complete fenced `json` object, then at most two concise Markdown bullets. Start with ` ```json `. Keep the entire response under 4,000 characters: strings under 180 characters, at most 4 milestones and 6 direct-URL evidence rows. Include every top-level key below. No research narration.

```json
{
  "asOfDate":"2026-08-15",
  "requestedCompany":"Dauntless Energy",
  "requestedManager":"Ardian",
  "decision":"",
  "confidence":"HIGH|MEDIUM|LOW",
  "rationale":"",
  "identityResolution":{"canonicalLegalName":"","aliases":[],"officialWebsite":null,"headquarters":null,"country":null,"platformBoundary":"","duplicateDecision":""},
  "ownershipResolution":{"managerAliasDecision":"","currentOwners":[],"formerOwners":[],"pendingOwnershipTransactions":[]},
  "operatingResolution":{"sector":null,"subsector":null,"region":null,"countryTags":[],"description":null,"companyStatus":null,"yearFounded":null,"services":null,"footprint":null,"scale":[]},
  "acquisitionExitCheck":{"formationOrAcquisition":"","legalClosing":"","subsequentExitSearch":""},
  "milestones":[],
  "evidence":[{"label":"","url":"https://...","purpose":"","sourceTier":"PRIMARY|REGULATORY|INSTITUTIONAL|REPUTABLE_SECONDARY","workingStatus":"WORKING|REDIRECTED|BROWSER_BLOCKED_BUT_VERIFIED|DEAD","isRecommendedPrimary":false}],
  "beforeAfterChanges":[],
  "excludedOrDuplicateCandidates":[],
  "unresolvedQuestions":[],
  "recommendedListAction":""
}
```

Ownership rows may use only manager, fund, vehicle, stake, announcementDate, entryDate, entryYear, exitDate, exitYear, isActive and transactionState. Recommend exactly one primary source. A complete parseable object and the Markdown review are mandatory.
