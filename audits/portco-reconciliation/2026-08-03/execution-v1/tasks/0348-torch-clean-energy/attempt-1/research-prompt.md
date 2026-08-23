Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Torch Clean Energy
REQUESTED MANAGER: Morgan Stanley Infrastructure Partners (MSIP); identify founders, retained owners, co-investors and every current/former direct owner
TASK: ledger:0348:torch-clean-energy:6be03d62
CANONICAL KEY: torch-clean-energy|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The census classified Torch Clean Energy as a current MSIP renewable-development holding, while the repository already has one Torch Clean Energy record and one active MSIP ownership period. Resolve whether ADD_OWNER is a false positive or whether the existing owner/date/vehicle requires correction.","productionCompanyIds":["cmrxpjlli016pivhe3nj9izvg"],"seedKeys":["torch clean energy|United States"],"sourceHoldingId":"069-morgan-stanley-infrastructure-partners:holding:001:torch-clean-energy","startingEvidence":["https://torchcleanenergy.com/","https://www.morganstanley.com/im/en-us/institutional-investor/insights/private-markets/private-infrastructure.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The published company is Torch Clean Energy, U.S. power and energy-transition infrastructure, active. It describes a development-led platform originating, advancing and selling utility-scale solar, wind and battery-storage projects, with more than 1.2 GW originated/developed/sold and offices or project activity in Colorado, Virginia and Arizona. It records one active MSIP owner with investment year 2025, vehicle “n.a.” and no stake. The narrative says MSIP announced a strategic investment in June 2025, but both existing milestones incorrectly say January 2025; that discrepancy must be resolved from direct sources. Existing sources include Torch’s website, MSIP’s investment release, a KeyBank case study and the Winchester battery project page. The census incorrectly says there was no repository match and recommends PROPOSED_NEW/ADD_OWNER. Test the record from scratch.

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Torch Clean Energy’s canonical legal/brand identity, formation/founding, founders and any predecessor, affiliate or project-development entities. Establish exactly what MSIP acquired or funded, signing/announcement date, legal closing date, acquisition vehicle/fund, stake/control terms, retained founder or management ownership, co-investors and whether the investment was corporate equity, project capital, a development joint venture or another structure. Do not infer a North Haven vehicle. Determine whether the public record supports active ownership when the release is an announcement, and search through 2026-08-19 for close evidence, later capital raises, recapitalizations, project-level monetizations, platform sale, owner changes, exit or signed pending transaction.

If the existing MSIP period already represents the only correct manager-level owner, explain that the queued ADD_OWNER is a census/repository matching false positive and recommend a correction or verified no-change rather than a duplicate owner. Separate equity owners from lenders, tax-equity providers, project buyers, offtakers, EPC contractors and counterparties.

BOUNDARY AND OPERATING PROFILE
Count Torch once at the manager-level developer/platform boundary. Do not separately count Winchester, Torch’s other project SPVs, sold projects, development sites or joint ventures unless a distinct manager-level portfolio company is directly owned. Verify official website, actual headquarters/offices, founding year if public, products/services, development and operating model, technologies, geographic footprint, disclosed pipeline/realized scale with dates, customers/counterparties and current operating status. Do not label project geography as company headquarters.

RESEARCH RULES
- Resolve canonical identity, aliases, predecessor/successor names, platform/project boundary, current/former direct owners and exact manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Torch, MSIP/Morgan Stanley, regulatory filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the existing record or ownership period needs updating, VERIFIED_NO_CHANGE only if all material facts are supported, PROPOSED_MERGE if a duplicate identity is proven, EXCLUDED if MSIP lacks qualifying direct equity ownership, or DEFERRED if current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://torchcleanenergy.com/
- https://www.morganstanley.com/im/en-us/institutional-investor/insights/private-markets/private-infrastructure.html
- https://www.morganstanley.com/press-releases/morgan-stanley-infrastructure-partners--torch-clean-energy
- https://www.key.com/businesses-institutions/industry-expertise/energy/torch-clean-energy.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
