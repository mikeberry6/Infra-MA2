# Generate Capital — fresh Phase 1 research

Research **Generate Capital, PBC** as of **2026-08-18** for this one manager-level North American PortCo list decision. Use current web research, open direct pages, and search the original investments plus every later financing, recapitalization, ownership transfer, restructuring, stake sale, and exit. Treat every supplied claim as unverified. This is list reconciliation, not a full scorecard refresh.

Existing canonical company: `Generate Capital`, United States, production ID `cmrxpjha100zwivhes4yyec81`. The repo currently shows four active owners:

- QIC, entry year 2019, vehicle and stake not publicly disclosed.
- AustralianSuper, 2021, linked to AustralianSuper Infrastructure Portfolio, stake not publicly disclosed.
- Harbert Management Corp (Harbert Infrastructure / Gulf Pacific), 2021, vehicle `Harbert Infrastructure`, stake not publicly disclosed.
- CBRE Investment Management, 2021, vehicle `CBRE Caledon`, stake not publicly disclosed.

The queue aggregates four manager census holdings: Australian Super, CBRE Investment Management, Harbert Management Corp, and QIC Global Infrastructure. Resolve aliases without adding duplicate owners. Existing repo facts say Generate was founded in 2014; QIC invested in 2019; a $2bn July 2021 equity raise added Harbert and CBRE Caledon alongside AustralianSuper and QIC; Generate converted to a public benefit corporation in November 2021; and a $1.5bn January 2024 raise included QIC. These are claims to reopen and verify.

Resolve:

- Whether `Generate Capital`, `Generate Capital, PBC`, and related legal/display variants are one canonical company. Do not create subsidiaries, projects, funds, or assets as separate PortCos.
- Whether Generate remains an in-scope manager-level operating/investment platform rather than a fund, lender-only exposure, or fund-of-funds position.
- Every current and former direct owner relevant to the supplied 100-manager universe, with exact manager alias, organization, disclosed fund/vehicle, stake, announcement date, legal closing/entry date, exit date, and transaction state. Do not infer ownership percentages from raise size, commitments, or project/entity interests.
- Whether QIC, AustralianSuper, Harbert, and CBRE Investment Management / CBRE Caledon remain current after the 2024 raise and any later financing, recapitalization, restructuring, or sale. Search each owner plus Generate with `sale`, `sold`, `exit`, `divest`, `secondary`, `recapitalization`, and `restructuring`.
- Whether the July 2021 event was closed or only announced, whether CBRE Caledon maps to CBRE Investment Management, whether `Australian Super` maps to `AustralianSuper`, and whether `QIC Global Infrastructure` maps to `QIC`.
- Any later signed pending ownership transaction. Keep a current legal owner active during a signed pending exit; do not treat asset-level sales such as Equinox Growers as a platform exit.
- Concise geography, sector/subsector, headquarters, founding year, operating model, current disclosed scale, and at most six material list-level milestones.
- Exact list action. Use `PROPOSED_CORRECTION` if identity, ownership, dates, sources, or fields require correction; `VERIFIED_NO_CHANGE` only if every existing owner and key field is supported and no owner is missing; `DEFERRED` only if canonical identity or active ownership remains materially unresolved.

Prefer official company, investor, manager, regulatory, government, and filing sources. Reopen these direct pages and use additional current sources as needed:

- https://generatecapital.com/
- https://www.generatecapital.com/about
- https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions
- https://www.harbert.net/news/harbert-management-corporation-announces-agreement-to-acquire-generate-capital/
- https://www.harbert.net/assets/press-releases/harbert-infrastructure-generate-press-release-july-19-2021.pdf
- https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/Generate
- https://www.qic.com/what-we-do/infrastructure/global-portfolio/generate-capital/

Return exactly one minified fenced `json` object, then the sentence `Result recorded.` Nothing else. The JSON must be valid and **under 7,000 characters**. Use at most twelve direct evidence URLs, exactly one recommended primary, strings under 240 characters, and no prose outside schema values. Every key is mandatory:

```json
{"asOfDate":"2026-08-18","requestedCompany":"Generate Capital","requestedManager":"AustralianSuper / CBRE Investment Management / Harbert Management Corp / QIC","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"POWER_ET","subsector":"Sustainable infrastructure investment and operations","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner keys only: `manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState`; states: `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, `REALIZED`. Milestone keys only: `date,event,category,evidenceUrls`. Evidence keys only: `label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
