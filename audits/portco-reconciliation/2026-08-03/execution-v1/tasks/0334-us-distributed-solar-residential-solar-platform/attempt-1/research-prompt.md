Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: US Distributed Solar / Residential Solar Platform
REQUESTED MANAGER: Macquarie Asset Management
TASK: ledger:0334:us-distributed-solar-residential-solar-platform:d9e011d4
CANONICAL KEY: us-distributed-solar-residential-solar-platform|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The Macquarie census created a generic descriptive holding from Macquarie's portfolio overview, claiming a current MGETS-owned U.S. distributed/residential solar platform without a legal name, website, entry date, stake, or exact source excerpt. No production or seed record matches it. This may be an unnamed asset portfolio, a duplicate of Calibrant or another platform, or an unsupported inference. Identify it conclusively before any creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"065-macquarie-asset-management:holding:030:us-distributed-solar-residential-solar-platform","startingEvidence":["https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio.html"],"censusClaims":{"vehicle":"MGETS","sector":"Distributed solar and energy-as-a-service","country":"United States","state":"CLOSED_ACTIVE"}}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No company with this generic name exists. An existing Macquarie-owned record, Calibrant Energy, is attributed to MGETS and develops, owns and operates on-site solar, storage and energy-as-a-service assets in the United States and Canada. The wider repository also contains many unrelated distributed-solar platforms. Do not create a second Macquarie platform unless direct evidence gives it a distinct identity and ownership boundary.

IDENTIFICATION TASK
Open Macquarie's current and archived portfolio pages and identify the exact tile, company, transaction, portfolio or case study that produced the census label. Search Macquarie Green Energy and Transition Solutions/MGETS disclosures, fund reports, financing releases, regulatory filings and portfolio-company sources for U.S. distributed solar, residential solar, rooftop solar, solar-plus-storage and energy-as-a-service holdings. Test likely matches including Calibrant Energy and any named residential-solar asset portfolio, but do not force a match. Establish the legal/canonical name, website, acquisition/formation/closing date, seller/partner, current owners, stake, fund/vehicle, operating/development asset boundary and current status. If the source only describes an unnamed pool of assets or one-off financing exposure, determine whether it qualifies as a manager-level platform or should be excluded.

DUPLICATE AND ELIGIBILITY DECISION REQUIRED
Return PROPOSED_MERGE if direct evidence proves this is Calibrant or another existing company; PROPOSED_NEW only if a distinct named or durably identifiable manager-level operating platform is supported; EXCLUDED if it is an unnamed asset bundle, debt/financing exposure, project-level holding beneath another platform, non-infrastructure services company, or unsupported census inference; DEFERRED if material identity/ownership remains unresolved after a thorough primary-source search. Do not create a company using the generic requested label. Do not infer MGETS merely because Calibrant uses MGETS elsewhere.

If a distinct platform is identified, verify current/former owners, announcement and legal closing dates, stake, vehicle, infrastructure strategy basis, geography, products/services, customers/end markets, owned/operating scale, headquarters and later exit search through the cutoff. Count the manager-level platform once and exclude projects/SPVs beneath it.

RESEARCH RULES
- Resolve canonical identity, aliases, duplicate/platform/project-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state; do not infer facts from a portfolio-category label.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, and signed pending transactions.
- Reopen direct pages and filings. Prefer Macquarie/MGETS, identified company, regulatory/filing, seller/partner and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio.html
- https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio/calibrant-energy.html
- https://www.calibrantenergy.com/macquarie

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
