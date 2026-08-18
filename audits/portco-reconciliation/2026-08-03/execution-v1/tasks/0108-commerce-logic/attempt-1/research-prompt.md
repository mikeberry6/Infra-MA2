# Commerce Logic — Phase 1 list reconciliation

Freshly research **Commerce Logic** as of **2026-08-18** for **Astatine Investment Partners**. This is a manager-level PortCo identity, ownership and list decision—not the later full scorecard refresh. Independently search the current web, open direct source pages, and search acquisitions plus all subsequent exits. Treat every repository statement below as an unverified claim.

The immutable manager census recorded `Commerce Logic` as a proposed new Astatine holding using `https://astatineip.com/investment/cvo-holding-company-llc/`. Production and evaluated seed currently contain no matching company, owner period or redirect. The approved list methodology permits a new company only if direct evidence establishes its canonical identity, U.S./Canada/Mexico qualification, infrastructure-strategy ownership, current status, company boundary, concise description, entry milestone and a primary ownership source.

Resolve:

- The canonical legal/display identity, aliases, official website, headquarters/operating location and North American qualification.
- The exact relationship among `Commerce Logic`, `CVO Holding Company, LLC`, `CVO Holding Company`, `CVO`, and any operating brands, subsidiaries, predecessors or successors. Decide which name belongs at the manager-level PortCo boundary.
- Whether Astatine Investment Partners is the current infrastructure-fund owner; search both `Astatine Investment Partners` and predecessor name `Alinda Capital Partners` and distinguish a manager rename from a company sale.
- The acquisition announcement and closing dates, fund/vehicle if directly disclosed, stake if directly disclosed, and whether the transaction remains active.
- Every later sale, recapitalization, merger, sponsor change, bankruptcy, dissolution or signed pending transaction through the as-of date. Do not infer continued ownership from a stale page if later evidence contradicts it.
- The company boundary: do not separately count subsidiaries, facilities, service lines, customers, assets or brands beneath the one manager-level platform.
- List-ready classification and profile: infrastructure strategy basis, sector/subsector, description, founding year only if supported, disclosed scale, products/services, customers/end markets, footprint, and one to four material milestones.
- The truthful repository action: `CREATE_COMPANY` plus one current owner only if identity and current Astatine ownership are resolved. Never create separate companies or owners for aliases, holding companies, operating brands or underlying assets.

Reopen this direct source and find current official company, manager, regulatory and transaction sources:

- https://astatineip.com/investment/cvo-holding-company-llc/

Return one complete minified fenced `json` object followed by exactly one short Markdown sentence. No narration before the JSON. Keep the entire response under **5,200 characters**; use concise strings and at most eight evidence rows. Every key below is mandatory. Exactly one evidence row must have `isRecommendedPrimary:true`.

```json
{
  "asOfDate":"2026-08-18",
  "requestedCompany":"Commerce Logic",
  "requestedManager":"Astatine Investment Partners",
  "decision":"PROPOSED_NEW | PROPOSED_CORRECTION | SUPERSEDED_OR_DUPLICATE | EXCLUDED | DEFERRED",
  "confidence":"HIGH | MEDIUM | LOW",
  "rationale":"",
  "identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},
  "ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},
  "operatingResolution":{"sector":"TRANSPORTATION | OTHER","subsector":"","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE | REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},
  "acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},
  "milestones":[],
  "evidence":[],
  "beforeAfterChanges":[],
  "excludedOrDuplicateCandidates":[],
  "unresolvedQuestions":[],
  "recommendedListAction":""
}
```

Owner rows may use only `manager`, `organization`, `fund`, `vehicle`, `stake`, `announcementDate`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, and `transactionState`; states are `CLOSED_ACTIVE`, `SIGNED_PENDING_INCOMING`, `SIGNED_PENDING_EXIT`, or `REALIZED`. Milestone rows may use only `date`, `event`, `category`, and `evidenceUrls`. Evidence rows may use only `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, and `isRecommendedPrimary`. Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps and `UNRESOLVED` only for material identity/current-ownership uncertainty.
