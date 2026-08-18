# Commerce Logic — fresh Phase 1 retry

Research **Commerce Logic** for **Astatine Investment Partners** as of **2026-08-18**. This is one manager-level PortCo list decision, not a scorecard refresh. Search the current web, open direct pages, and check both acquisition and every later exit. Treat all supplied claims as unverified.

Repository state: no Commerce Logic company, seed entry, owner or redirect exists. The census called it a current Astatine holding from `https://astatineip.com/investment/cvo-holding-company-llc/`. A prior unusable response suggested Commerce Logic was a Fund III/CVO add-on and Fleetworthy acquired it in 2025; independently verify or reject that claim.

Resolve:

- Canonical legal/display name and relationship among Commerce Logic, Commerce Logic LLC, CVO Holding Company LLC, CVO, Tollogic, Bestpass and Fleetworthy.
- Correct manager-level boundary; do not count a parent, product, acquirer, subsidiary or asset as another PortCo.
- Whether Alinda/Astatine ever directly owned Commerce Logic through an infrastructure fund, with fund, stake and entry date only when disclosed.
- Whether Astatine still owns it. Reopen the Astatine page, but search later sales, asset acquisitions, mergers, dissolution and pending transactions. Establish the exact Fleetworthy transaction date/state and whether it ended Astatine ownership.
- U.S. qualification, concise operations, sector/subsector, location and at most three material milestones.
- List action: `PROPOSED_NEW` only if currently owned by Astatine; `EXCLUDED` if the proposed current holding was realized before the as-of date; otherwise `DEFERRED` for unresolved identity/current ownership.

Return exactly one minified fenced `json` object, then the sentence `Result recorded.` Nothing else. The JSON must be complete, valid, and **under 3,800 characters**. Use at most four direct evidence URLs, exactly one primary, strings under 160 characters, and no prose outside schema values. Every key is mandatory:

```json
{"asOfDate":"2026-08-18","requestedCompany":"Commerce Logic","requestedManager":"Astatine Investment Partners","decision":"PROPOSED_NEW|EXCLUDED|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"TRANSPORTATION|OTHER","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}
```

Owner keys only: `manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState`; states: `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, `REALIZED`. Milestone keys only: `date,event,category,evidenceUrls`. Evidence keys only: `label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
