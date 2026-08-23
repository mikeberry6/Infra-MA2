Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Summit Carbon Solutions
REQUESTED MANAGERS: Tiger Infrastructure Partners and TPG; identify Summit Agricultural Group, Continental Resources, SK E&S and other direct owners as needed
TASK: ledger:0443:summit-carbon-solutions:6d14c660
CANONICAL KEY: summit-carbon-solutions|united-states

LEDGER ISSUE TO TEST
The Tiger census treats Summit Carbon Solutions as an active Fund III infrastructure holding. The TPG census classifies TPG Rise Climate’s $300 million investment as OUT_OF_SCOPE private-equity/climate exposure without an infrastructure-strategy link. The repository publishes the company as active and attributes both Tiger and TPG-related financing in narrative, but must distinguish qualifying Tiger infrastructure ownership from any non-infrastructure TPG owner period. Verify the full current owner table, strategy attribution and project status.

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
The record describes a planned roughly 2,000-mile Midwestern CO2 pipeline and sequestration system designed to capture up to 20 million tons per year from ethanol/industrial facilities. It says Tiger Fund III announced an investment in April 2021, TPG Rise Climate invested $300 million in May 2022 as part of a more than $1 billion raise, and SK E&S agreed to buy 10% for $110 million. It records the company as active but does not clearly separate current owners, stakes, funds, legal closing dates or the effect of permit setbacks. Verify every claim.

OWNERSHIP AND STRATEGY QUESTIONS
Reconstruct the company’s formation and equity raises: legal/acquisition entities, Summit Agricultural Group, Tiger Fund III, Continental Resources, TPG Rise Climate, SK E&S and other disclosed investors; announcement and legal close dates; stakes, securities, governance and current status. Determine whether TPG’s investment was made by a qualifying infrastructure strategy/vehicle or ordinary climate private equity; apply owner-specific inclusion without removing a company that remains in scope through Tiger. Search through 2026-08-19 for dilution, follow-ons, transfers, redemptions, sponsor exits and signed pending transactions.

PROJECT STATUS AND BOUNDARY
Establish whether Summit owns/develops one active manager-level CCS platform, individual pipeline/project entities, sequestration sites or only development rights. Verify current route, states, miles, capture partners, designed capacity, permits/approvals, court decisions, construction/financing status, commercial timeline and any cancellation/reconfiguration. A development-stage platform can remain in scope if active and directly owned; do not state that an unbuilt system “operates.” Keep pipeline segments, capture facilities and sequestration sites beneath Summit unless separately manager-held.

RESEARCH RULES
- Resolve canonical identity, current/former owners, funds/vehicles, securities, stakes, announcement/closing/exit dates and transaction states.
- Search both investments and subsequent exit/project-status evidence through 2026-08-19. Open direct pages rather than relying on snippets.
- Prefer Summit, Tiger, TPG, SK/Continental/Summit Agricultural, state utility/land/regulatory, court and financing sources.
- Require manager-specific infrastructure-strategy evidence. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity/current-ownership uncertainty.
- Return PROPOSED_CORRECTION if the company remains through qualifying owners but TPG/other ownership, project status or facts need correction; VERIFIED_NO_CHANGE only if the existing active owner treatment is fully supported; EXCLUDED only if no qualifying direct infrastructure owner/project remains; PROPOSED_MERGE if a duplicate is proven; or DEFERRED if material ownership/project viability remains unresolved.
- Apply inclusion/exclusion at the ownership-period level where appropriate; do not realize the company while a qualifying active owner remains. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.tigerinfrastructure.com/portfolio/Summit-Carbon-Solutions
- https://www.tigerinfrastructure.com/documents/FG/tigerNew/news/611388_SCS_Press_Release___Tiger___2021_04_20.pdf
- https://www.prnewswire.com/news-releases/summit-carbon-solutions-announces-investment-from-tiger-infrastructure-partners-301517587.html
- https://www.prnewswire.com/news-releases/summit-carbon-solutions-announces-successful-completion-of-1-billion-equity-raise-following-300-million-investment-from-tpg-rise-climate-301545158.html
- https://www.summitcarbonsolutions.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
