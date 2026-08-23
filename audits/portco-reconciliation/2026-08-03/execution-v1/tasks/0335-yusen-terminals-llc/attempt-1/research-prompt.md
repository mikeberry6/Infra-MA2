Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Yusen Terminals LLC
MANAGERS TO RESOLVE: Macquarie Asset Management; Ocean Network Express / ONE; NYK / Nippon Yusen Kabushiki Kaisha; identify every current/former direct owner
TASK: ledger:0335:yusen-terminals-llc:b7587254
CANONICAL KEY: yusen-terminals-llc|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["RETIRE_OWNERSHIP"],"rationale":"A Macquarie repo-only judgment asserted that terminal ownership transferred in ONE's 2023 transaction and Macquarie was no longer active. The existing seed instead says MIP III acquired 49% of NYK Ports/Yusen Terminals in 2015, ONE acquired the other 51% in 2023, and Macquarie remained an investor. Independently reconstruct the cap table; do not retire Macquarie merely because ONE acquired control.","productionCompanyId":"cmrxpjkid014xivhe2cjdm9ff","seedKey":"yusen terminals llc|United States","sourceRepoOnlyId":"065-macquarie-asset-management:repo-only:003:yusen-terminals-llc","startingEvidence":["https://www.one-line.com/en/news/one-strengthens-global-presence-terminal-acquisitions-us-west-coast-and-rotterdam","https://yti.com/about-us/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Yusen Terminals LLC","country":"United States","status":"Active","sector":"Transportation","subsector":"Marine container terminal","website":"https://yti.com/","yearFounded":1991,"investmentYear":2015,"headquarters":"California","owners":[{"firm":"Macquarie Asset Management","vehicle":"Macquarie Infrastructure Partners III","stake":"49% at 2015 entry; current stake to verify","investmentYear":2015,"isActive":true}],"description":"The seed describes YTI's Port of Los Angeles berths 212–218 operation. It says MIP III acquired 49% of NYK Ports LLC in February 2015 and ONE completed a 51% acquisition in YTI in November 2023.","milestones":[{"date":"1991","event":"YTI began operations.","category":"Founding"},{"date":"Feb 2015","event":"MIP III acquired 49% of NYK Ports LLC, the holding company for YTI.","category":"Acquisition"},{"date":"Dec 27, 2022","event":"ONE announced an agreement to acquire 51% of YTI.","category":"Acquisition"},{"date":"Nov 6, 2023","event":"ONE announced completion of its 51% acquisition.","category":"Other"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal identities and relationship among Yusen Terminals LLC/YTI, NYK Ports LLC, Macquarie acquisition entities, Port of Los Angeles concession/lease entities, NYK and ONE. Reconstruct the 2015 transaction: announcement and legal close, seller, stake, acquisition vehicle, MIP III attribution, and whether the 49% was at NYK Ports or directly at YTI. Then reconstruct the 2022-announced/2023-closed ONE transaction: exact stake, seller, legal entity acquired, regulatory approvals and whether ONE bought NYK's 51%, Macquarie's 49%, or a combined/other interest. Establish the complete current cap table and every current/former direct owner using transaction documents and current owner evidence. Search through the cutoff for a later Macquarie sale, fund wind-down transfer, refinancing, dilution, recapitalization, concession change, ownership transfer or signed pending exit. A historical Macquarie portfolio mention alone is insufficient, but ONE control alone also does not prove Macquarie exited.

BOUNDARY RULES
Count YTI once as the manager-level Los Angeles terminal operating/concession company. Do not separately count berths, rail assets, cranes, lease SPVs or NYK Ports if it is only the immediate holding company. Keep TraPac, International Transportation Service, Long Beach Container Terminal and Ceres/TraPac Jacksonville separate. Distinguish ONE as a strategic direct owner from Macquarie as an infrastructure fund owner.

Verify official website, founding/operations start, headquarters/location, terminal footprint/capacity, services, customers/end markets, active status, infrastructure-strategy basis and North American qualification. Do not infer a residual 49% without confirming what ONE acquired and who currently holds the balance.

RESEARCH RULES
- Resolve canonical identity, aliases, holding-company/terminal/concession boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, concession changes, and signed pending transactions.
- Reopen direct pages and filings. Prefer YTI, ONE, Macquarie, NYK, competition/regulatory decisions, port records and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://yti.com/
- https://yti.com/about-us/
- https://www.one-line.com/en/news/one-strengthens-global-presence-terminal-acquisitions-us-west-coast-and-rotterdam
- https://www.macquarie.com/au/en/about/company/macquarie-asset-management/our-portfolio.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
