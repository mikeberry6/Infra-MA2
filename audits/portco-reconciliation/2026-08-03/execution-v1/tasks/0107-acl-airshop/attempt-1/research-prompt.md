# ACL Airshop — Phase 1 list reconciliation

Freshly research **ACL Airshop** as of **2026-08-18** for **Astatine Investment Partners**. This is a manager-level PortCo identity, ownership and list decision—not the later full scorecard refresh. Independently search the current web, open direct source pages, and search acquisitions plus all subsequent exits. Treat every repository statement below as an unverified claim.

The immutable manager census recorded `ACL Airshop` as a proposed new Astatine holding using `https://astatineip.com/investment/acl-airshop/`. Production and seed currently contain no matching company, owner period or redirect. The approved list methodology permits a new company only if direct evidence establishes its canonical identity, U.S./Canada/Mexico qualification, infrastructure-strategy ownership, current status, company boundary, concise description, entry milestone and a primary ownership source.

Resolve:

- The canonical legal/display identity, aliases, official website, headquarters/operating location and North American qualification.
- Whether `ACL Airshop`, `ACL Airshop LLC`, `Airshop`, and any named predecessor/successor are the same manager-level company.
- Whether Astatine Investment Partners is the current infrastructure-fund owner; search both `Astatine Investment Partners` and predecessor name `Alinda Capital Partners` and distinguish a manager rename from a company sale.
- The exact acquisition announcement and closing dates, fund/vehicle if directly disclosed, stake if directly disclosed, and whether the transaction remains active.
- Every later sale, recapitalization, merger, sponsor change or signed pending transaction through the as-of date. Do not infer continued ownership from a stale page if later evidence contradicts it.
- The company boundary: distinguish the manager-level ACL Airshop platform from subsidiaries, operating locations, ULD equipment fleets, repair stations, software/products and customers.
- List-ready classification and profile: infrastructure strategy basis, sector/subsector, description, founding year only if supported, disclosed operating scale, products/services, customers/end markets, and one to four material milestones.
- The truthful repository action: `CREATE_COMPANY` plus one current owner only if identity and current Astatine ownership are resolved. Never create a second owner for an alias or an underlying business unit.

Reopen this direct source and search for current official company, manager, regulatory and transaction sources:

- https://astatineip.com/investment/acl-airshop/

Return one complete minified fenced `json` object followed by exactly one short Markdown sentence. No narration before the JSON. Keep the entire response under **5,200 characters**; use concise strings and at most eight evidence rows. Every key below is mandatory. Exactly one evidence row must have `isRecommendedPrimary:true`.

```json
{
  "asOfDate":"2026-08-18",
  "requestedCompany":"ACL Airshop",
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
