Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: GridPoint
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors, including Goldman Sachs Asset Management, needed to determine scope
TASK: ledger:0293:gridpoint:326d6d5b
CANONICAL KEY: gridpoint|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes GridPoint as an I Squared Capital PortCo. The manager census excluded it because I Squared invested through its InfraTech venture/growth strategy and GridPoint appears to provide software, controls and energy-management services rather than own infrastructure. Confirm whether any current investor holds GridPoint through a qualifying direct infrastructure mandate or the company falls outside this census entirely.","productionCompanyId":"cmrxpji6e011bivhena1i4gjh","seedKey":"gridpoint|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:005:gridpoint","startingEvidence":["https://isquaredcapital.com/txnm_fund/infratech/","https://www.gridpoint.com/news/gridpoint-secures-45-million-to-accelerate-commercial-building-electrification/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"GridPoint","country":"United States","status":"Active","sector":"Power & ET","subsector":"Distributed energy management software and controls","website":"https://www.gridpoint.com/","yearFounded":2003,"investmentYear":2021,"headquarters":"United States","owners":[{"firm":"I Squared Capital","vehicle":"ISQ Global InfraTech Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2021,"isActive":true}],"description":"The repository describes a software-, controls- and analytics-based commercial-building energy-management platform serving more than 15,000 sites. It identifies GridPoint as the first investment of I Squared's Global InfraTech Fund and notes later capital from Goldman Sachs Asset Management and Shell Ventures, while characterizing the business as asset-light rather than utility ownership.","milestones":[{"date":"2003","event":"Public materials identify GridPoint's founding year.","category":"Founding"},{"date":"2021","event":"I Squared's Global InfraTech Fund made GridPoint its first investment.","category":"Financing"},{"date":"Mar 1, 2022","event":"GridPoint announced a $75mm strategic capital raise from GSAM and Shell Ventures.","category":"Financing"},{"date":"2025","event":"GridPoint announced additional financing for commercial-building electrification growth.","category":"Financing"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify GridPoint's canonical/legal identity, products, customers, deployed devices, ownership of customer-site equipment, revenue model and operating footprint. Reconstruct I Squared's investment: exact InfraTech fund/strategy, security, first-investment announcement/closing date, stake, current status, later dilution, sale or exit. Reconstruct the 2022 and later financings, including exact GSAM vehicle/strategy and whether Goldman obtained a controlling, minority or merely growth-equity interest; do the same for any other manager in the supplied 100-manager universe. Determine whether any investor's position is through a qualifying direct infrastructure mandate. Apply the scope rule strictly: energy-efficiency software, controls hardware, SaaS, demand-response enablement and customer-site devices do not qualify as ownership of an infrastructure operating company unless GridPoint owns/operates material infrastructure assets rather than selling technology/services. If no qualifying owner remains, state whether GridPoint should be removed from the PortCo list entirely; if one qualifying owner exists, correct only the nonqualifying ownership periods.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; InfraTech, climate-growth, venture and corporate-venture exposure is excluded.
- Verify the operating model and owned-asset base rather than classifying from grid, electrification, energy or infrastructure-adjacent language.
- Verify every security, stake, announcement/closing date, current status and exit; do not assume participation in a financing means control or current ownership.
- Search through 2026-08-19 for later rounds, cap-table changes, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer GridPoint, I Squared, Goldman Sachs Asset Management, fund documents, financing participants and regulatory filings. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.gridpoint.com/
- https://isquaredcapital.com/who-we-are/
- https://isquaredcapital.com/txnm_fund/infratech/
- https://www.gridpoint.com/news/gridpoint-closes-75m-strategic-investment-from-goldman-sachs-asset-management-and-shell-ventures/
- https://www.gridpoint.com/news/gridpoint-secures-45-million-to-accelerate-commercial-building-electrification/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
