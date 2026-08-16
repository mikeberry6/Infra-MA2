# Waihonu Solar Farm — Phase 1 list reconciliation

Freshly research **Waihonu Solar Farm** as of **2026-08-16** for **Argo Infrastructure Partners**. This is a manager-level PortCo identity/ownership/list decision, not a full scorecard. Independently search the current web, open direct sources, and search acquisitions plus later exits; treat every repository fact below as an unverified claim.

Production publishes Waihonu (`cmrxpj7ea00krivhepj9wbkhp`) as an active standalone Argo PortCo acquired in 2022 through `AMF Hawaiʻi Investment Holdings`. It also separately publishes the manager-level platform Hawaiʻi Gas (`cmrxpj79f00kiivhewunbegwz`) with current Argo and APG ownership.

Resolve:

- Whether Waihonu North LLC and Waihonu South LLC are only underlying solar-project entities beneath Hawaiʻi Gas, not a separate manager-level PortCo.
- Whether Argo acquired them with Hawaiʻi Gas in July 2022.
- The 2025 disposition. Hawaiʻi Gas' current About page says Waihonu was “acquired in 2025 by a solar energy provider.” EIA-860 names Waihonu North LLC / Waihonu South LLC in 2024 but changes the operator/reporting utility for both plants to `ERCAM LLC` in its 2025 early release; EIA explains that generators absent from its separate owner file are wholly owned by their operator. Determine whether that supports ERCAM LLC as the current legal owner/operator, the most precise public closing date, and an Argo exit in 2025.
- Whether the plants remain operational, whether any later transaction exists, and whether ERCAM is an infrastructure-fund manager or merely the current solar owner/operator.
- The truthful repository disposition. Do not redirect a project to Hawaiʻi Gas unless they are the same identity. If Waihonu was an underlying project and is no longer Argo-owned, prefer archiving its standalone manager-level record without redirect, retiring Argo's owner period, and preserving Hawaiʻi Gas as the canonical manager-level PortCo.

Reopen at least these direct sources and search for anything later:

- https://www.hawaiigas.com/about-us-new
- https://www.hawaiigas.com/clean-energy/diversification
- https://www.hawaiigas.com/posts/acquisition-of-hawai-i-gas-paves-way-for-clean-energy-transformation
- https://www.eia.gov/electricity/data/eia860/
- https://www.eia.gov/electricity/data/eia860/xls/eia8602024.zip?download=1
- https://www.eia.gov/electricity/data/eia860/xls/eia8602025ER.zip?download=1
- https://www.hawaiianelectric.com/documents/products_and_services/customer_renewable_programs/customer_energy_resource_equipment/2025_q4_cer_technical_and_interconnection_report.pdf
- https://www.hawaiipublicradio.org/government-politics/2016-08-25/waihonu-solar-and-sheep-farm-dedicated-in-mililani

Return one complete minified fenced `json` object followed by exactly one short Markdown sentence. No narration before the JSON. Keep the entire response under **4,200 characters**; use short strings and at most six evidence rows. Every key below is mandatory. Exactly one evidence row must have `isRecommendedPrimary:true`.

```json
{
  "asOfDate":"2026-08-16",
  "requestedCompany":"Waihonu Solar Farm",
  "requestedManager":"Argo Infrastructure Partners",
  "decision":"VERIFIED_EXISTING_MATCH | PROPOSED_CORRECTION | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence":"HIGH | MEDIUM | LOW",
  "rationale":"",
  "identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},
  "ownershipResolution":{"managerAliasDecision":"","currentLegalOwners":[],"currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"ercamTreatment":"","duplicateOwnerAction":""},
  "recordDisposition":{"waihonu":"KEEP | RETIRE | CORRECT | DEFER","hawaiiGas":"KEEP | RETIRE | CORRECT | DEFER","canonicalKeepCompanyId":null,"retiredCompanyIds":[],"redirectsAreTruthful":false,"requiredApplicationMechanism":""},
  "operatingResolution":{"sector":"POWER_ET","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE | REALIZED","yearFounded":null,"services":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},
  "acquisitionExitCheck":{"argoEntry":"","waihonuExit":"","currentStatus":"","subsequentExitSearch":""},
  "milestones":[],
  "evidence":[],
  "beforeAfterChanges":[],
  "excludedOrDuplicateCandidates":[],
  "unresolvedQuestions":[],
  "recommendedListAction":""
}
```

Owner rows may use only `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState`; states are `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`. Evidence rows may use only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, and `isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
