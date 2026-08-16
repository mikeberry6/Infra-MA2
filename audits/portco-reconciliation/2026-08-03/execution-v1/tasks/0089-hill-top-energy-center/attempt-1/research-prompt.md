# Hill Top Energy Center — Phase 1 PortCo reconciliation

Research **Hill Top Energy Center** as of **2026-08-15** using a fresh, current web search. Requested census managers: **Ardian and Blackstone**. This is a list/ownership decision, not a full scorecard.

Existing production company `cmrxpj9a700noivhe1fv3krgh` treats Hill Top as an active U.S. PortCo currently owned by **Blackstone** through vehicle text **Blackstone Energy Transition Partners**, entry year 2025, stake not disclosed. It has no former Ardian ownership period and no pending transaction. The record says Blackstone announced an agreement on September 15, 2025 to acquire the 620 MW Pennsylvania plant from Ardian, but it nevertheless records Blackstone as `CLOSED_ACTIVE`. Treat every claim as unverified.

The census contains both an Ardian holding and a Blackstone holding and proposed `ADD_PENDING_TRANSACTION`. Determine whether the Blackstone acquisition legally closed after announcement. Search specifically for closing, consummation, regulatory approvals, later owner references, financings, operations, and any subsequent sale or exit through the as-of date. If no closing is directly established, keep Ardian active and classify Blackstone `SIGNED_PENDING_INCOMING`; if closing is directly established, retire Ardian at the supported close and keep Blackstone active from that date. Do not infer closing from announcement language, elapsed time, a buyer portfolio page, or the database’s existing active-owner row.

Also verify canonical/legal identity and asset boundary; site and location; infrastructure basis; Blackstone strategy/vehicle; Ardian acquisition/development history; announcement and closing dates with precision; stake; commercial-operation date; capacity; current status; and any pending exit. Do not count lenders, operators, counterparties, affiliates, projects, or officers as owners without direct evidence. Do not invent a fund row: the repo has only vehicle text “Blackstone Energy Transition Partners.”

Open direct pages, including:

- https://www.ardian.com/news-insights/press-releases/ardian-announces-sale-hill-top-energy-center-blackstone
- https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-hill-top-energy-center-in-western-pennsylvania-for-nearly-1-billion/
- https://www.blackstone.com/news/press/blackstone-energy-transition-partners-announces-1-2-billion-investment-to-build-first-ever-natural-gas-power-generation-facility-in-west-virginia/

Choose exactly one: `VERIFIED_NO_CHANGE`, `PROPOSED_CORRECTION`, `SUPERSEDED_OR_DUPLICATE`, `EXCLUDED`, or `DEFERRED`. `UNRESOLVED` identity or current legal ownership requires `DEFERRED`; use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps.

Return one complete fenced `json` object, then at most two concise Markdown bullets. Start with ` ```json `. Keep the entire response under 4,000 characters: strings under 180 characters, at most 5 milestones and 7 direct-URL evidence rows. Include every top-level key below. No research narration.

```json
{
  "asOfDate":"2026-08-15",
  "requestedCompany":"Hill Top Energy Center",
  "requestedManager":"Ardian / Blackstone",
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
