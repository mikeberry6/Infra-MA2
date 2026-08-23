Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: CheckSammy
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors needed to determine scope
TASK: ledger:0289:checksammy:c0009a91
CANONICAL KEY: checksammy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes CheckSammy as an I Squared Capital PortCo. The manager census excluded it because I Squared invested through its InfraTech strategy and CheckSammy appears to be an asset-light, software-enabled waste-services network rather than an owner/operator of disposal, transfer, recycling or other infrastructure assets. Confirm whether only that manager attribution or the entire company falls outside this infrastructure PortCo census.","productionCompanyId":"cmrxpji3k0116ivhe3prvbtya","seedKey":"checksammy|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:003:checksammy","startingEvidence":["https://isquaredcapital.com/txnm_fund/infratech/","https://www.prnewswire.com/news-releases/checksammy-secures-45m-strategic-investment-to-expand-waste-diversion-from-landfills-302043315.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"CheckSammy","country":"United States","status":"Active","sector":"Utilities","subsector":"Waste diversion and recycling services","website":"https://www.checksammy.com/","yearFounded":2018,"investmentYear":2024,"headquarters":"North America","owners":[{"firm":"I Squared Capital","vehicle":"ISQ Global InfraTech Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2024,"isActive":true}],"description":"The repository describes a technology-enabled bulk-waste, recycling and sustainability-services network serving more than 25,000 North American facilities. It characterizes the model as software/service orchestration through third-party providers rather than ownership of heavy disposal infrastructure and says I Squared led a $45mm strategic investment in January 2024.","milestones":[{"date":"2018","event":"CheckSammy was founded.","category":"Founding"},{"date":"2020","event":"The company commercialized its offering.","category":"Other"},{"date":"Jan 24, 2024","event":"CheckSammy announced a $45mm investment led by I Squared and launched Veridiant software.","category":"Financing"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify CheckSammy's canonical/legal identity, products/services, physical-asset ownership, service-provider network, customers and operating footprint. Reconstruct I Squared's investment: exact fund/strategy, security type, announcement/closing date, stake if disclosed, whether the position remains held, and any later financing, sale, recapitalization or exit through the cutoff. Determine whether I Squared's InfraTech vehicle is part of its qualifying direct infrastructure mandate or instead a venture/growth technology strategy outside this census. Apply the scope rule strictly: logistics orchestration, waste brokerage, software and outsourced field services do not qualify as direct infrastructure ownership unless CheckSammy owns/operates material waste-transfer, sorting, recycling, landfill or other infrastructure assets. Search for any other manager in the supplied 100-manager universe holding CheckSammy through a qualifying infrastructure equity mandate; if none, state whether the company should be removed from the PortCo list entirely. Distinguish an exclusion from a correction that merely retires one nonqualifying ownership period while another qualifying owner remains.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; InfraTech venture/growth exposure is excluded.
- Verify the operating model and owned-asset base rather than classifying from the word waste alone.
- Verify every security, stake, announcement/closing date, current status and exit; do not assume a strategic financing means control.
- Search through 2026-08-19 for later rounds, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer CheckSammy, I Squared, fund documents, financing participants and regulatory filings. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.checksammy.com/
- https://www.checksammy.com/about-us/
- https://www.prnewswire.com/news-releases/checksammy-secures-45m-strategic-investment-to-expand-waste-diversion-from-landfills-302043315.html
- https://isquaredcapital.com/txnm_fund/infratech/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
