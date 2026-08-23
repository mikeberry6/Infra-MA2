Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Bayonne Energy Center
MANAGERS TO RESOLVE: Morgan Stanley Infrastructure Partners (MSIP); JERA or named buyer; Macquarie Infrastructure and ArcLight as prior owners where applicable
TASK: ledger:0344:bayonne-energy-center:2a01ade1
CANONICAL KEY: bayonne-energy-center|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact repository asset exists under MSIP. The census identified an announced sale; determine whether it remains pending or legally closed by the cutoff, and preserve the correct current owner until closing.","productionCompanyIds":["cmrxpjlhd016hivheffuojgmg"],"seedKeys":["bayonne energy center|United States"],"sourceHoldingId":"069-morgan-stanley-infrastructure-partners:holding:004:bayonne-energy-center","startingEvidence":["https://www.morganstanley.com/im/en-us/institutional-investor/insights/private-markets/private-infrastructure.html","https://www.reuters.com/business/energy/jera-nj-power-plant-acquisition-2025-03-18/","https://www.morganstanley.com/press-releases/msip-agrees-to-sell-bayonne-energy-center"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published record describes a 660 MW dual-fuel merchant generating facility in Bayonne, New Jersey, serving New York City through a subsea connection. It records ArcLight-to-Macquarie ownership in 2015, MSIP acquisition in October 2018, operation through TigerGenCo and a March 2026 MSIP sale agreement while leaving MSIP active. It has no named MSIP vehicle or stake. Verify whether the sale date/buyer and pending status are accurate, whether any transaction already closed, and whether the facility/company boundary is correct.

OWNERSHIP AND TRANSACTION QUESTIONS
Resolve exact legal owner/project-company names, Bayonne Energy Center I and II/expansion boundaries, operating-company and TigerGenCo relationships. Reconstruct ArcLight, Macquarie and MSIP acquisitions with announcement and legal closing dates, stakes and funds/vehicles. Identify the announced buyer, seller, stake, conditions/approvals, announcement date and exact closing date if completed. Search FERC, NJ regulatory, JERA/transaction-party, financing and company sources for consummation notices or change-in-control approvals. Signed incoming ownership must remain pending until legal close; after close, retire MSIP and activate the buyer rather than retaining a stale pending state.

Search through the cutoff for subsequent sales, closing, refinancing, retirement/deactivation, capacity changes, owner restructurings and signed pending transactions. Verify website/operator, facility capacity and fuel, commercial-operation dates, market/customer, infrastructure-strategy basis and North American qualification. Count one manager-level generating asset/platform and do not double-count expansion units, cable, project subsidiaries or TigerGenCo unless separately owned manager-level holdings.

RESEARCH RULES
- Resolve canonical identity, aliases, facility/unit/project-company/platform boundary and all current/former direct owners.
- Verify each stake, fund/vehicle, announcement date, regulatory approval, legal closing, entry/exit date and transaction state.
- Search through 2026-08-19 for later closing, ownership transfers, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer MSIP, buyer/JERA, FERC, NJ authorities, prior owners and transaction parties. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the current record or ownership state needs updating, VERIFIED_NO_CHANGE only if MSIP remains current and the existing pending state is complete/correct, PROPOSED_MERGE if duplicates are proven, EXCLUDED if it is not an eligible manager-level infrastructure holding, or DEFERRED if current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.morganstanley.com/press-releases/msip-agrees-to-sell-bayonne-energy-center
- https://www.reuters.com/business/energy/jera-nj-power-plant-acquisition-2025-03-18/
- https://www.morganstanley.com/im/en-us/institutional-investor/insights/private-markets/private-infrastructure.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
