# US Water Systems — Phase 1 list reconciliation retry

Freshly research **US Water Systems** as of **2026-08-16** for **Argo Infrastructure Partners**. This is a manager-level PortCo identity/list decision, not a full scorecard. Independently search the current web, open direct sources, and verify acquisitions and later exits; treat every repo fact below as an unverified claim.

Production currently publishes:

- `US Water Systems` (`cmrxpj62g00ipivhe4zr74wn1`), described as a two-concession Argo platform.
- `Bayonne water and wastewater concession` (`cmrxpj76y00keivhellw38dtk`).
- `Middletown Water Joint Venture LLC` (`cmrxpj7b200klivhel3gtzeza`).

Resolve whether US Water Systems is a real legal/operating platform or only a repository umbrella for the two separately held concessions; the legal/operating relationship among the concession SPVs, Veolia/SUEZ/United Water, Water Capital Partners, Argo-managed capital, KKR and Apollo; current/former owners, stakes, entry/exit dates and vehicles; and whether Bayonne and Middletown remain active through the as-of date. Determine which production records should remain published under the anti-double-counting rule. Do not invent a one-to-many redirect or treat Apollo's announced manager acquisition as asset ownership without a legal close.

The repository can safely archive an unsupported umbrella with **no redirect** while preserving both existing child records. Therefore, if fresh evidence proves that boundary and active child records are already published, return `PROPOSED_CORRECTION`, not `DEFERRED`, unless identity or current ownership remains materially unresolved.

Reopen and verify at least these direct sources, then search for anything later:

- https://www.suez-asia.com/-/media/suez-global/files/publication/annual-report/document-de-reference-2018-en.pdf
- https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BE2E7B10B-96D0-437D-8D48-F1B1DDCF8132%7D
- https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BF082C39B-0000-C423-9296-BE68E22B02CF%7D
- https://wcpartnersllc.com/projects/
- https://wcpartnersllc.com/project/bayonne-concession/
- https://wcpartnersllc.com/project/middletown-concession/
- https://middletownborough.com/wp-content/uploads/2024/02/Operating-Minutes-12-5-23.pdf
- https://middletownborough.com/wp-content/uploads/2025/11/Operations-Report-July-2025.pdf
- https://www.bayonnewater.veolianorthamerica.com/
- https://ir.apollo.com/news-events/press-releases/detail/533/apollo-to-acquire-argo-infrastructure-partners

Return one complete minified fenced `json` object followed by exactly one short Markdown sentence. No narration before the JSON. Keep the entire response under **4,200 characters**; use short strings and at most five evidence rows. Every key below is mandatory. Exactly one evidence row must have `isRecommendedPrimary:true`.

```json
{
  "asOfDate":"2026-08-16",
  "requestedCompany":"US Water Systems",
  "requestedManager":"Argo Infrastructure Partners",
  "decision":"VERIFIED_EXISTING_MATCH | PROPOSED_CORRECTION | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence":"HIGH | MEDIUM | LOW",
  "rationale":"",
  "identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},
  "ownershipResolution":{"managerAliasDecision":"","currentLegalOwners":[],"currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"apolloTransactionTreatment":"","duplicateOwnerAction":""},
  "recordDisposition":{"usWaterSystems":"KEEP | RETIRE | CORRECT | DEFER","bayonneConcession":"KEEP | RETIRE | CORRECT | DEFER","middletownConcession":"KEEP | RETIRE | CORRECT | DEFER","canonicalKeepCompanyId":null,"retiredCompanyIds":[],"redirectsAreTruthful":false,"requiredApplicationMechanism":""},
  "operatingResolution":{"sector":"UTILITIES","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE | REALIZED","yearFounded":null,"services":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},
  "acquisitionExitCheck":{"argoEntry":"","apolloTransaction":"","currentStatus":"","subsequentExitOrTerminationSearch":""},
  "milestones":[],
  "evidence":[],
  "beforeAfterChanges":[],
  "excludedOrDuplicateCandidates":[],
  "unresolvedQuestions":[],
  "recommendedListAction":""
}
```

Owner rows may use only `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState`; states are `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`. Evidence rows may use only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, and `isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
