# DataBank — fresh Phase 1 research

Research **DataBank** / **DataBank Holdings Ltd.** as of **2026-08-18** for this one manager-level North American PortCo list decision. Use current web research, open direct pages, and search the original investments plus every later financing, recapitalization, stake sale, manager transfer, and exit. Treat all supplied claims as unverified. This is list reconciliation, not a full scorecard refresh.

Existing canonical company: `DataBank`, United States, production ID `cmrxpj7kw00kzivhenjb9mu5y`. The repo currently shows four active owners: DigitalBridge (2016), Swiss Life (2022), IMCO (2022), and AustralianSuper (2024). It lacks TIAA/Nuveen. Existing descriptions say 65+ data centers in 27 markets and 850+ MW planned; these claims also require current direct support.

Source census tasks to reconcile:

- AustralianSuper: current direct infrastructure holding; 2024 equity raise announced as about $2.0bn, including a $1.5bn AustralianSuper commitment.
- DigitalBridge: acquired DataBank in 2016 and remains shown on its live portfolio page; a January 2025 financing release said it would retain an ownership stake.
- Swiss Life Asset Managers, EDF Invest, and IMCO: 2022 minority recapitalization. Existing repo has Swiss Life and IMCO but not EDF Invest.
- Nuveen Infrastructure task: `DataBank (DataBank Holdings Ltd.)`, based on TIAA's 2021 investment release. Determine whether the direct owner is TIAA's general account, Nuveen-managed capital, a Nuveen infrastructure vehicle, or none; do not attribute TIAA automatically to Nuveen.
- InfraBridge repo-only candidate: currently judged to be a DigitalBridge strategy/name association, not a direct DataBank owner. Add it only with direct equity evidence.

Resolve:

- Whether `DataBank`, `DataBank Holdings Ltd.`, and `DataBank, Ltd.` are one canonical company; include legal/display names and aliases, and do not create a duplicate.
- Every current and former direct infrastructure owner, exact manager/organization, disclosed vehicle/fund, stake, announcement date, legal closing/entry date, exit date, and state. Do not infer manager-level percentages from capital commitments or project/entity percentages.
- Whether EDF Invest and TIAA/Nuveen remain current after the 2022, 2024, and 2025 financings; whether later capital diluted, replaced, or exited any owner; and whether any signed pending sale exists.
- Whether DigitalBridge's pending corporate combination or any manager-level transaction changes the underlying DataBank ownership. Do not treat a manager transaction as a PortCo exit without direct evidence.
- Current U.S. platform boundary: DataBank is the manager-level company; facilities, subsidiaries, data centers, land parcels, and development projects beneath it are not separate PortCos.
- Concise geography, sector/subsector, headquarters, founding year, operations, current disclosed scale, and at most six material list-level milestones.
- Exact list action. Use `PROPOSED_CORRECTION` if the current canonical record needs identity, ownership, date, source, or field corrections; `VERIFIED_NO_CHANGE` only if every existing claim is supported and no owner is missing; `DEFERRED` only if canonical identity or active ownership remains materially unresolved.

Prefer official company, investor, manager, regulatory, and filing sources. Reopen these direct pages and use additional current sources as needed:

- https://www.databank.com/company/investors/
- https://www.databank.com/about-databank/
- https://www.databank.com/resources/press-releases/digital-bridge-acquires-databank-launches-data-center-platform/
- https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/
- https://www.databank.com/resources/press-releases/databank-announces-2-0-billion-equity-raise-led-by-1-5-billion-investment-from-australiansuper/
- https://www.digitalbridge.com/portfolio/databank
- https://www.tiaa.org/public/about-tiaa/news-press/press-releases/2021/2021-10-06-databank

Return exactly one minified fenced `json` object, then the sentence `Result recorded.` Nothing else. The JSON must be valid and **under 6,500 characters**. Use at most ten direct evidence URLs, exactly one recommended primary, strings under 220 characters, and no prose outside schema values. Every key is mandatory:

```json
{"asOfDate":"2026-08-18","requestedCompany":"DataBank","requestedManager":"AustralianSuper / DigitalBridge / IMCO / Nuveen Infrastructure / Swiss Life Asset Managers","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"tiaaNuveenDecision":"","edfInvestDecision":"","infraBridgeDecision":"","duplicateOwnerAction":""},"operatingResolution":{"sector":"DIGITAL","subsector":"Data Centers","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner keys only: `manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState`; states: `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, `REALIZED`. Milestone keys only: `date,event,category,evidenceUrls`. Evidence keys only: `label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
