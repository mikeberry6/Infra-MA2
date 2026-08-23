Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Wecom Fiber
MANAGERS TO RESOLVE: GIC; Searchlight Capital Partners; identify all direct current and former owners of Wecom and Searchlight Fiber Alliance
TASK: ledger:0265:wecom-fiber:efb4f3b9
CANONICAL KEY: wecom-fiber|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The company identity is established, but the ownership structure must be corrected from FCC evidence. Verify Searchlight's 2023 investment, GIC's Epsom Investment interest in the Searchlight Fiber Alliance chain, exact indirect versus direct stakes and current continuity.","productionCompanyId":"cmrxpjggs00ynivheegnza3qj","seedKey":"wecom fiber|United States","startingEvidence":["https://docs.fcc.gov/public/attachments/DA-24-820A1.pdf","https://wecomfiber.com/wecom-and-searchlight-capital-partners/"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Wecom Fiber","country":"United States","status":"Active","sector":"Digital","subsector":"Fiber broadband","investmentYear":2023,"headquarters":"Arizona","owners":[{"firm":"Searchlight","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2023,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},{"firm":"GIC","vehicle":"Epsom Investment Pte. Ltd","investmentYear":2023,"stake":"46.74% of Searchlight Fiber Alliance structure in 2024; exact Wecom look-through stake unverified","isActive":true}],"description":"The repository records an Arizona broadband platform serving residential and business customers. It says Searchlight invested in 2023 and FCC materials later showed GIC's Epsom Investment Pte. Ltd. with 46.74% of the Searchlight Fiber Alliance structure, but it does not establish the exact Wecom-level look-through stake or all intermediate entities.","milestones":[{"date":"May 15, 2023","event":"Searchlight announced a strategic investment in Wecom.","category":"Financing"},{"date":"Aug 14, 2024","event":"FCC materials disclosed Epsom Investment with 46.74% of the Searchlight Fiber Alliance structure.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Wecom's exact legal parent, brand aliases, subsidiaries/network entities and relationship to Searchlight Fiber Alliance. Reconstruct the full ownership chain and transaction chronology using FCC applications/orders and primary deal sources: seller/founders, Searchlight fund/vehicle, GIC's Epsom Investment Pte. Ltd., every intermediate holding company, exact direct and look-through stakes, announcement and legal closing dates, and control rights. Determine whether 46.74% is GIC's share of a parent vehicle rather than Wecom itself and calculate no look-through percentage unless every denominator is directly disclosed. Identify all current direct owners and qualifying manager owners. Search through the cutoff for FCC-approved acquisitions, add-ons, refinancing, recapitalization, stake sale, merger, owner exit or signed pending transaction. Verify current network footprint, locations, customers, buildout/subsidy programs and headquarters.

RESEARCH RULES
- Resolve canonical identity, aliases, parent/holding-company/network boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, announcement date, FCC/legal closing date, entry date, exit date and transaction state. Clearly distinguish parent-vehicle percentage from company-level stake.
- Search through 2026-08-19 for sale, transfer, FCC application/order, refinancing, recapitalization, add-on acquisition and signed pending transactions.
- Verify network route/fiber premises scale, Arizona markets, customers, public funding and current operating status.
- Reopen direct pages and filings. Prefer FCC, Wecom, Searchlight, GIC, legal/transaction-party and state broadband sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://docs.fcc.gov/public/attachments/DA-24-820A1.pdf
- https://wecomfiber.com/wecom-and-searchlight-capital-partners/
- https://www.lw.com/en/news/latham-watkins-advises-searchlight-capital-partners-on-strategic-investment-in-wecom
- https://docs.fcc.gov/public/attachments/DOC-397850A1.pdf

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
