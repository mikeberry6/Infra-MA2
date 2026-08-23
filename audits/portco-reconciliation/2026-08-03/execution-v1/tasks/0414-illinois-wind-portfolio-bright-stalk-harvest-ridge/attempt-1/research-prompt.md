Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Illinois Wind Portfolio (Bright Stalk, Harvest Ridge)
REQUESTED MANAGER: Schroders Greencoat; identify EDPR and every current/former direct owner
TASK: ledger:0414:illinois-wind-portfolio-bright-stalk-harvest-ridge:1410820d
CANONICAL KEY: illinois-wind-portfolio-bright-stalk-harvest-ridge|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"No exact normalized production or seed match exists. The census classified the Bright Stalk and Harvest Ridge wind assets as a Schroders Greencoat North American infrastructure holding. Verify whether they form one list-ready manager-level portfolio, separate holdings, or underlying projects that should not be counted as a standalone PortCo, and whether current ownership remains qualifying.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"087-schroders-greencoat:holding:002:illinois-wind-portfolio-bright-stalk-harvest-ridge","startingEvidence":["https://www.edpr.com/en/news/2021/02/10/edpr-sells-portfolio-us-wind-assets-greencoat-capital","https://www.power-technology.com/news/edpr-sells-us-wind-assets-greencoat/"]}

IDENTITY, TRANSACTION AND BOUNDARY QUESTIONS
Resolve the exact legal entities, asset names, locations and capacity of Bright Stalk and Harvest Ridge; their relationship to EDP Renewables North America, Greencoat Capital/Schroders Greencoat, any co-investment vehicle and any other projects transferred in the same transaction. Establish signing and legal closing dates, purchase structure, exact interests sold/retained, fund/vehicle, seller, co-investors and operators. Determine whether the investable unit was one jointly governed portfolio or two separate project companies, and choose the manager-level canonical boundary that avoids double counting.

Search through 2026-08-19 for later sales, stake transfers, refinancing, tax-equity changes, repowering, decommissioning, operator changes and signed pending transactions. Confirm current ownership from recent primary evidence rather than relying solely on the 2021 sale announcement. Do not treat tax-equity investors, project lenders, power purchasers, turbine suppliers, landowners or O&M providers as direct common-equity owners without explicit evidence.

OPERATING PROFILE
Confirm commercial-operation dates, MW capacity, counties/state, technology, offtake/customers, operating status and current operator for each asset with date-qualified sources. Establish why the combined holding qualifies as North American renewable infrastructure. If the two projects do not share a current manager-level vehicle or governance perimeter, recommend the exact separate-company or exclusion boundary instead of forcing a portfolio.

RESEARCH RULES
- Resolve canonical identity, aliases, portfolio/project/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen EDPR, Schroders Greencoat, project, regulatory, utility and transaction-party pages. Prefer primary sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a missing list-ready canonical portfolio/company and current qualifying ownership are proven; PROPOSED_CORRECTION if the appropriate identity, owner roster, dates, stake or boundary differs from the census; PROPOSED_MERGE if existing duplicate identities are proven; VERIFIED_NO_CHANGE only if no list mutation is warranted; EXCLUDED if the exposure is ineligible or wholly subordinate; or DEFERRED if current identity/ownership remains unresolved. This is a research packet only.

STARTING SOURCES TO REOPEN
- https://www.edpr.com/en/news/2021/02/10/edpr-sells-portfolio-us-wind-assets-greencoat-capital
- https://www.power-technology.com/news/edpr-sells-us-wind-assets-greencoat/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
