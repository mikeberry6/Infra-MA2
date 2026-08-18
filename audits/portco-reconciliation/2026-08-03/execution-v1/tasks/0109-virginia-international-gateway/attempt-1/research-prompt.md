# Virginia International Gateway — fresh Phase 1 research

Research **Virginia International Gateway (VIG)** for **Astatine Investment Partners** as of **2026-08-18**. This is one manager-level PortCo list decision, not a scorecard refresh. Search the current web, open direct pages, and check both the original investment and every later sale, lease change, refinancing, continuation transfer, or exit. Treat all supplied claims as unverified.

Repository state: no VIG company, seed entry, owner, or redirect exists. The census proposed it as a current Astatine holding from `https://astatineip.com/investment/virginia-international-gateway/`, but also found an exited profile at `https://astatineip.com/investment/virginia-international-gateway-exited/`. The earlier census could not resolve whether the active profile reflects a retained interest, continuation vehicle, different investment period, or stale page.

Resolve:

- Canonical legal/display identity and relationships among Virginia International Gateway, VIG, APM Terminals Virginia, Virginia Port Authority, Virginia International Terminals, the Commonwealth of Virginia, and any project/holding companies.
- Correct manager-level boundary: distinguish terminal ownership, land/improvements, operating lease/concession, operator, public authority, fund holding vehicle, and underlying equipment/projects. Do not create duplicate PortCos.
- Every Astatine/Alinda infrastructure ownership period, fund/vehicle, stake, announcement/closing/exit dates, and transaction state—but only when directly disclosed. Explain why Astatine has both active and exited profiles.
- Whether Astatine currently owns a direct infrastructure equity interest as of the date. Search later transfers, sales, lease acquisitions, public-authority purchases, restructurings, continuation funds, and pending transactions. A live portfolio page alone is insufficient if later evidence shows an exit.
- U.S. qualification, concise operations, sector/subsector, location, disclosed scale, and at most four material milestones.
- List action: `PROPOSED_NEW` only if a current direct Astatine infrastructure ownership interest is resolved; `EXCLUDED` if fully realized; `DEFERRED` if identity or current ownership remains materially unresolved.

Return exactly one minified fenced `json` object, then the sentence `Result recorded.` Nothing else. The JSON must be complete, valid, and **under 4,200 characters**. Use at most five direct evidence URLs, exactly one primary, strings under 180 characters, and no prose outside schema values. Every key is mandatory:

```json
{"asOfDate":"2026-08-18","requestedCompany":"Virginia International Gateway","requestedManager":"Astatine Investment Partners","decision":"PROPOSED_NEW|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"activeExitedProfileResolution":"","duplicateOwnerAction":""},"operatingResolution":{"sector":"TRANSPORTATION|OTHER","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner keys only: `manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState`; states: `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, `REALIZED`. Milestone keys only: `date,event,category,evidenceUrls`. Evidence keys only: `label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
