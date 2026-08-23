Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Maverick 7
REQUESTED MANAGER: MEAG; identify the developer/operator, seller, co-investors and every current/former direct owner
TASK: ledger:0338:maverick-7:4af1c5e7
CANONICAL KEY: maverick-7|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The MEAG census identified Maverick 7 as a directly owned California utility-scale solar asset acquired in 2021, with no repository match. Before creating a standalone-asset PortCo, verify the exact project identity, legal owner, MEAG vehicle/stake, commercial-operation status, current ownership and separation from sibling Maverick 6 and any broader project portfolio.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"066-meag:holding:003:maverick-7","startingEvidence":["https://www.meag.com/en/news/meag-invests-in-two-solar-projects-in-the-usa.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
No Maverick 7 record exists. The census says it is a California standalone utility-scale solar asset, MEAG acquired direct infrastructure equity in 2021, the stake and vehicle are not disclosed, and ownership is CLOSED_ACTIVE. A separate queue task covers Maverick 6; do not combine the two simply because they were announced together unless the correct manager-level holding is one legally integrated portfolio.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact project name and number, legal project company/SPV, aliases, county/location, interconnection/market, developer, original sponsor, seller, operator/asset manager, power purchaser/offtaker and commercial-operation date. Establish what MEAG acquired in 2021, announcement and legal closing dates, acquisition vehicle/fund/account, exact stake, co-investors, retained seller interest and whether MEAG invested directly in the project company or through a portfolio/holding vehicle containing Maverick 7 and Maverick 6. Search FERC, EIA, CEC, CAISO, financing, tax-equity and transaction-party records as needed. Reconstruct any financing, tax-equity, refinancing, partial sale, ownership transfer, operator change, repowering, signed pending exit or full disposition through the cutoff. Verify current ownership with current regulatory/manager/asset evidence, not only the 2021 MEAG release.

COUNTING AND BOUNDARY DECISION REQUIRED
State whether Maverick 7 should remain a separate standalone-asset PortCo, be combined with Maverick 6 as one legally owned two-project portfolio, map beneath an existing manager-level platform, or be excluded as an underlying project. The program allows a standalone asset when the infrastructure manager directly owns the asset and no broader counted platform subsumes it. Do not separately count the same project SPV, generating facility, interconnection facilities or tax-equity partnership. Distinguish Maverick 7 from similarly named Maverick solar projects and from the larger Eland/Maverick development portfolios.

Verify technology, capacity in MWdc/MWac with units, operating status, PPA/offtaker, site footprint where public, official site if any, asset geography, infrastructure-strategy basis and North American qualification. Do not invent headquarters, founding year, website, fund, vehicle or stake for a project asset.

NEW-ASSET MINIMUM
If recommending PROPOSED_NEW, provide verified canonical identity, geography, classification, current ownership, concise asset description, at least one attributable investment/closing milestone, exactly one primary ownership source, and a clear boundary excluding project subsidiaries and sibling assets.

RESEARCH RULES
- Resolve canonical identity, aliases, project/SPV/portfolio boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state.
- Search through 2026-08-19 for subsequent ownership transfers, refinancings, tax-equity changes, exits, and signed pending transactions.
- Reopen direct pages and filings. Prefer MEAG, project/developer/operator, FERC/EIA/CEC/CAISO, financing, offtaker and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.meag.com/en/news/meag-invests-in-two-solar-projects-in-the-usa.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
