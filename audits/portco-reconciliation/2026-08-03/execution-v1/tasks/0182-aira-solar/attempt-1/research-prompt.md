Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Aira Solar
MANAGERS TO RESOLVE: Copenhagen Infrastructure Partners
TASK: ledger:0182:aira-solar:bed31b0f
CANONICAL KEY TO RESOLVE: aira-solar|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"Accepted repo-only judgment says Aira Solar should be consolidated beneath the separately counted Horizon New Energy platform to avoid double-counting an underlying project. The original captured snapshot lacked a match, while the current seed now contains Aira Solar; verify the present canonical boundary.","censusRows":[],"repoOnlyRows":[{"manager":"Copenhagen Infrastructure Partners","disposition":"MATCHED_ELSEWHERE","rationale":"Consolidated beneath Horizon New Energy as an underlying project.","evidenceUrls":["https://www.globenewswire.com/news-release/2023/11/21/2783918/0/en/Copenhagen-Infrastructure-Partners-launches-Horizon-New-Energy-dedicated-to-renewable-energy-in-Canada.html","https://www.horizonnewenergy.ca/projects"]}],"repoRows":[{"seedKey":"aira solar|Canada","note":"Present in current seed but absent from the ledger capture; identity/boundary must be revalidated."}]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Aira Solar","country":"Canada","status":"Active","sector":"Power & ET","subsector":"Solar PV","investmentYear":2023,"headquarters":"Alberta","description":"The repository treats Aira Solar as a 450 MWac utility-scale solar development near Seven Persons and Medicine Hat, Alberta, with approximately 1.15 million panels on roughly 4,480–4,500 acres. It attributes ownership to Copenhagen Infrastructure Partners through CI IV because Aira appears on Horizon New Energy's project list.","owners":[{"firm":"Copenhagen Infrastructure Partners","vehicle":"Copenhagen Infrastructure IV (CI IV)","investmentYear":2023,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"Nov 21, 2023","event":"CIP launched Horizon New Energy as a Canadian renewables platform.","category":"Financing"},{"date":"Feb 28, 2024","event":"AESO approved the Aira Solar Project connection.","category":"Expansion"},{"date":"Mar 21, 2024","event":"Alberta regulators approved the project and substation.","category":"Expansion"}],"sources":[{"url":"https://majorprojects.alberta.ca/details/Aira-Solar-Project/11104"},{"url":"https://www.globenewswire.com/news-release/2023/11/21/2783918/0/en/Copenhagen-Infrastructure-Partners-launches-Horizon-New-Energy-dedicated-to-renewable-energy-in-Canada.html"},{"url":"https://www.horizonnewenergy.ca/projects"},{"url":"https://www.aeso.ca/grid/transmission-projects/aira-solar-project-connection-2461/"}]}

BOUNDARY QUESTION TO RESOLVE
Determine whether Aira Solar is a standalone manager-level CIP investment/platform or an underlying project wholly represented by Horizon New Energy. Resolve the legal project entities, developer/owner, CI IV attribution, ownership/control, project stage and whether Aira has been sold, cancelled, transferred or renamed. Verify whether Horizon is the manager-level platform and Aira should be retained only as project history/asset detail.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, owners and platform-versus-project/SPV boundaries.
- Determine whether one Horizon New Energy platform row should represent the investment. Do not count Aira separately merely because it has a project name and regulatory approvals.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer CI IV, a stake or closing.
- Search through 2026-08-19 for sale, transfer, financial close, construction start, cancellation, permit expiry, rebrand and signed pending transactions.
- Verify geography, capacity, acreage, permitting/construction stage, customers/offtakers and current status.
- Reopen direct pages. Prefer CIP/Horizon, Alberta regulator/AESO, project and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.globenewswire.com/news-release/2023/11/21/2783918/0/en/Copenhagen-Infrastructure-Partners-launches-Horizon-New-Energy-dedicated-to-renewable-energy-in-Canada.html
- https://www.horizonnewenergy.ca/projects
- https://majorprojects.alberta.ca/details/Aira-Solar-Project/11104
- https://www.aeso.ca/grid/transmission-projects/aira-solar-project-connection-2461/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
