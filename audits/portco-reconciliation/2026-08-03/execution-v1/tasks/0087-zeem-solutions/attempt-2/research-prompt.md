# Zeem Solutions — Phase 1 PortCo reconciliation

Research **Zeem Solutions** as of **2026-08-15** in a fresh web search. Requested census manager: **ArcLight Capital**. This is a list/ownership decision, not a full scorecard.

Existing production company `cmrxpj6nk00jnivhe6mtdjqda` already has one active **ArcLight Capital Partners** owner (2022; fund/vehicle and stake not recorded). It says founded 2020, headquarters California, and has no website. The queue proposes `ADD_OWNER`. Treat all claims as unverified.

Determine whether ArcLight Capital is only the existing manager's short label. Verify direct equity/infrastructure ownership, current status, exact public fund/vehicle, entry timing, later exit/pending sale, identity/legal aliases, manager-level boundary, official site, headquarters and founding year. Do not add LAZ/LPRI, fleet customers, depots, projects, grantors or lenders as owners without direct current ownership evidence. Do not infer stake, security class, holding vehicle or exact closing day.

Open direct pages, including:

- https://arclight.com/investments/
- https://arclight.com/portfolio-services/
- https://www.zeemsolutions.com/about
- https://www.zeemsolutions.com/press
- https://www.globenewswire.com/news-release/2022/07/06/2475140/0/en/Zeem-Solutions-EV-Fleet-as-a-Service-Provider-Secures-50-Million-Capital-Investment-from-Affiliates-of-ArcLight-Capital-Partners-Announces-Strategic-Partnership-with-LAZ-Parking-Re.html

Search acquisitions and exits through the as-of date. Choose exactly one: `VERIFIED_NO_CHANGE`, `PROPOSED_CORRECTION`, `SUPERSEDED_OR_DUPLICATE`, `EXCLUDED`, or `DEFERRED`. `UNRESOLVED` identity/current ownership requires `DEFERRED`; use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps.

Return one complete fenced `json` object, then at most two bullets. Start with ` ```json `. Keep the entire response under 4,000 characters: strings under 180 characters, at most 3 milestones and 5 direct-URL evidence rows. Include every top-level key below. No research narration.

```json
{
  "asOfDate":"2026-08-15",
  "requestedCompany":"Zeem Solutions",
  "requestedManager":"ArcLight Capital",
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

Ownership rows may use only manager, fund, vehicle, stake, announcementDate, entryDate, entryYear, exitDate, exitYear, isActive and transactionState. Recommend exactly one primary source. A complete parseable object is mandatory.
