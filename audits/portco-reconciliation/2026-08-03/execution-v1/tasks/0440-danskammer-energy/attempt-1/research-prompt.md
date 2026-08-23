Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Danskammer Energy
REQUESTED MANAGER: Tiger Infrastructure Partners; identify co-owners and prior owners as needed
TASK: ledger:0440:danskammer-energy:5987da36
CANONICAL KEY: danskammer-energy|united-states

LEDGER ISSUE TO TEST
The Tiger census identifies Danskammer Energy as an active U.S. power infrastructure holding, while the repository publishes an active record with Tiger Infrastructure Partners Fund II and a 2017 entry. Verify the exact owner, fund/vehicle, acquisition dates, operating status of the existing plant, fate of the proposed repowering, and any later sale, retirement or sponsor exit.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record describes a roughly 500 MW gas-fired generating facility near Newburgh, New York, says Tiger Fund II agreed to acquire it in September 2017 and closed in December 2017, and notes a redevelopment/repowering proposal. It records Tiger as sole active owner with no stake. Verify every claim, including whether the original plant still operates, its current capacity and market role, and whether the proposed new plant received or lost permits.

IDENTITY, OWNERSHIP AND TRANSACTION QUESTIONS
Resolve Danskammer Energy LLC/project entities, plant owner/operator, founders/sellers and any similarly named redevelopment entity. Reconstruct Tiger’s 2017 transaction: announcement and legal close dates, Fund II/acquisition vehicle, stake, co-investors and governance. Search NYISO, New York PSC/DEC, FERC, EPA/EIA, Tiger, company and financing sources through 2026-08-19 for later ownership transfers, refinancing, mothballing/reactivation, retirement notices, asset sale, sponsor exit and signed pending transactions.

OPERATING AND PROJECT-BOUNDARY QUESTIONS
Distinguish the existing peaking/generation units from the proposed Danskammer Energy Center repowering. Establish current installed and dependable capacity, fuel, dispatch/market participation, generation/retirement status, permits, customers/end markets and site ownership. A denied or abandoned repowering project does not itself eliminate an operating legacy asset; conversely, a permanently retired/non-operating plant may affect active company status. Keep individual units and redevelopment permits beneath the canonical company.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, stakes, announcement/closing/exit dates and transaction states.
- Search both the 2017 acquisition and subsequent exit/retirement/status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer Tiger, Danskammer, NYISO, New York PSC/DEC, FERC/EIA/EPA, financing and transaction-party sources.
- Require direct evidence tying the investment to Tiger’s infrastructure strategy. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Return VERIFIED_NO_CHANGE only if active ownership and an operating/qualifying platform are supported; PROPOSED_CORRECTION if ownership, status, capacity or project boundary needs correction; EXCLUDED if Tiger exited or no qualifying operating/development infrastructure remains; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material current ownership/operating status remains unresolved.
- Keep plant units and repowering project beneath one canonical company unless separate ownership is proven. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.tigerinfrastructure.com/portfolio/Danskammer-Energy
- https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/582611_Danskammer_Press_Release_-_2017_09_14.pdf
- https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/585120_153_-_Danskammer_Press_Release_at_Closing_12-27-17_Final.pdf
- https://danskammerenergy.com/
- https://www.nyiso.com/
- https://dec.ny.gov/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
