Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Ambient Photonics
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors needed to determine scope
TASK: ledger:0287:ambient-photonics:ce65fde2
CANONICAL KEY: ambient-photonics|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes Ambient Photonics as an I Squared Capital PortCo. The manager census excluded it because I Squared invested through its InfraTech venture/growth strategy and the company manufactures low-light photovoltaic technology rather than owning or operating infrastructure. Confirm whether only that manager attribution or the entire company falls outside this infrastructure PortCo census.","productionCompanyId":"cmrxpjhzs0113ivhef2kq2td6","seedKey":"ambient photonics|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:002:ambient-photonics","startingEvidence":["https://ambientphotonics.com/ambient-photonics-announces-15-million-series-a-financing/","https://isquaredcapital.com/txnm_fund/infratech/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Ambient Photonics","country":"United States","status":"Active","sector":"Power & ET","subsector":"Low-light photovoltaic technology","website":"https://ambientphotonics.com/","yearFounded":2019,"investmentYear":2022,"headquarters":"California","owners":[{"firm":"I Squared Capital","vehicle":"ISQ Global InfraTech Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"isActive":true}],"description":"The repository describes a low-light photovoltaic cell technology and manufacturing company serving connected-device and consumer-electronics markets. It says I Squared participated in a 2022 Series A through its InfraTech strategy and notes that the business is an energy-transition technology investment rather than conventional infrastructure.","milestones":[{"date":"2019","event":"Ambient Photonics was founded.","category":"Founding"},{"date":"May 10, 2022","event":"The company announced a $31mm Series A including I Squared Capital.","category":"Financing"},{"date":"Apr 24, 2023","event":"The company opened a U.S. low-light solar-cell manufacturing facility.","category":"Expansion"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify Ambient Photonics' canonical identity, operating model, products, manufacturing assets and end markets. Reconstruct I Squared's investment: exact fund/strategy, security type, announcement/closing date, stake if disclosed, whether the position remains held, and any later financing, sale, recapitalization or exit through the cutoff. Determine whether I Squared's InfraTech vehicle is part of its qualifying direct infrastructure mandate or instead a venture/growth technology strategy outside this census. Apply the scope rule strictly: ownership of manufacturing equipment or a factory does not itself make a technology manufacturer an infrastructure operating company. Search for any other manager in the supplied 100-manager universe holding Ambient through a qualifying infrastructure equity mandate; if none, state whether the company should be removed from the PortCo list entirely. Distinguish an exclusion of this company from a correction that merely retires one nonqualifying ownership period while another qualifying owner remains.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; venture/growth technology exposure is excluded.
- Exclude non-infrastructure operating models even when their products support energy transition or connected devices.
- Verify every security, stake, announcement/closing date, current status and exit; do not assume a Series A participation means control.
- Search through 2026-08-19 for later rounds, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Ambient, I Squared, fund documents, financing participants and regulatory filings. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://ambientphotonics.com/
- https://ambientphotonics.com/ambient-photonics-announces-15-million-series-a-financing/
- https://ambientphotonics.com/press-release/ambient-31-million-series-a-financing-co-led-by-amazon-and-eif
- https://isquaredcapital.com/txnm_fund/infratech/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
