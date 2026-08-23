Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Oriden
MANAGER TO RESOLVE: I Squared Capital; identify all current/former direct owners and sellers
TASK: ledger:0295:oriden:9e2a047b
CANONICAL KEY: oriden|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The manager census identified Oriden as a current North American renewable-development platform acquired by I Squared in April 2026, but no production or seed company exists. Verify the closed acquisition, exact fund/vehicle, former owner, platform boundary and current status before proposing creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"053-i-squared-capital:holding:016:oriden","startingEvidence":["https://isquaredcapital.com/news/oriden-acquisition-renewable-energy/"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Oriden","website":"https://oriden.com/","country":"United States","status":"Active","sector":"Power & ET","subsector":"Renewable energy development","headquarters":"Pittsburgh, Pennsylvania","investmentYear":2026,"owners":[{"firm":"I Squared Capital","vehicle":"ISQ Energy Transition Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2026,"isActive":true}],"description":"The census describes a U.S. solar and battery-storage development platform operating primarily in MISO and PJM, acquired through I Squared's energy-transition infrastructure strategy to build a scaled independent power platform.","milestones":[{"date":"Apr 27, 2026","event":"I Squared announced a completed acquisition of Oriden.","category":"Acquisition"}]}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Verify Oriden's canonical/legal identity, founding, predecessors, subsidiaries, projects, development pipeline, operating assets, headquarters, markets and current activity. Reconstruct the April 2026 transaction: exact seller and former owner, I Squared fund/strategy and acquisition vehicle, stake/control, announcement date, legal closing date, retained interests and current ownership. Do not assume the press-release date is the legal close without direct wording. Search through the cutoff for follow-on investment, project sales, platform recapitalization, merger, exit or signed pending transaction. Determine whether Oriden is one manager-level development platform and whether project SPVs, individual solar/storage projects, development-stage assets and O&M entities are subsidiaries/assets beneath it. Check for duplicate identity with Mitsubishi Power Americas development operations or other I Squared renewable platforms. Verify that the model represents direct infrastructure development/ownership rather than a services-only advisor.

RESEARCH RULES
- Require direct evidence for the completed I Squared ownership and infrastructure-strategy basis; identify the exact fund only when disclosed.
- Verify seller, stake, security, announcement/closing date and current status; use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for subsequent ownership changes, project/platform sales, exits and signed pending transactions.
- Count one manager-level platform; exclude individual projects, project SPVs and former corporate-parent business units unless independently owned at manager level.
- Reopen direct pages and filings. Prefer Oriden, I Squared, the seller/former owner, regulatory records and transaction-party releases. Use UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://oriden.com/
- https://isquaredcapital.com/news/oriden-acquisition-renewable-energy/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
