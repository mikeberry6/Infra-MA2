Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Epirus
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors needed to determine scope
TASK: ledger:0291:epirus:00b0659d
CANONICAL KEY: epirus|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes Epirus as an I Squared Capital PortCo. The manager census excluded it because I Squared invested through its InfraTech venture/growth strategy and Epirus develops defense-focused power-electronics hardware and software rather than owning or operating infrastructure. Confirm whether only that manager attribution or the entire company falls outside this infrastructure PortCo census.","productionCompanyId":"cmrxpji4n0118ivheb0bo1lts","seedKey":"epirus|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:004:epirus","startingEvidence":["https://isquaredcapital.com/txnm_fund/infratech/","https://www.epirusinc.com/epirus-announces-200m-series-c-funding-round/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Epirus","country":"United States","status":"Active","sector":"Digital","subsector":"High-power electronics and power systems","website":"https://www.epirusinc.com/","yearFounded":null,"investmentYear":2022,"headquarters":"California","owners":[{"firm":"I Squared Capital","vehicle":"ISQ Global InfraTech Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"isActive":true}],"description":"The repository describes a solid-state, software-defined high-power microwave and power-management technology company serving defense and government customers. It says I Squared participated in a February 2022 Series C through its InfraTech strategy and characterizes the business as engineered hardware/software manufacturing rather than regulated infrastructure ownership.","milestones":[{"date":"Nov 2021","event":"Epirus announced a new Torrance, California headquarters.","category":"Expansion"},{"date":"Feb 15, 2022","event":"Epirus announced a $200mm Series C including I Squared Capital.","category":"Financing"},{"date":"Mar 5, 2025","event":"Epirus announced a $250mm Series D and cumulative funding above $550mm.","category":"Financing"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify Epirus' canonical/legal identity, products, customers, physical assets, manufacturing model and operating footprint. Reconstruct I Squared's investment: exact fund/strategy, security type, Series C announcement/closing date, stake if disclosed, whether it participated in or was diluted by later rounds, whether the position remains held, and any later sale, recapitalization or exit through the cutoff. Determine whether I Squared's InfraTech vehicle is a qualifying direct infrastructure mandate or a venture/growth technology strategy outside this census. Apply the scope rule strictly: a factory, headquarters, defense contracts, mission-critical electronics or power-related products do not make a defense-technology manufacturer an infrastructure operating company. Search for any other manager in the supplied 100-manager universe holding Epirus through a qualifying infrastructure equity mandate; if none, state whether the company should be removed from the PortCo list entirely. Distinguish an exclusion from a correction that merely retires one nonqualifying ownership period while another qualifying owner remains.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; venture/growth technology and defense exposure is excluded.
- Verify the operating model and owned-asset base rather than classifying from power, resilience, critical systems or infrastructure-adjacent language alone.
- Verify every security, stake, announcement/closing date, current status and exit; do not assume a Series C participation means control or continuing ownership.
- Search through 2026-08-19 for later financing rounds, cap-table changes, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Epirus, I Squared, fund documents, financing participants, government contracts and regulatory filings. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.epirusinc.com/
- https://www.epirusinc.com/epirus-announces-200m-series-c-funding-round/
- https://www.epirusinc.com/epirus-opens-new-headquarters-in-torrance-california/
- https://isquaredcapital.com/txnm_fund/infratech/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
