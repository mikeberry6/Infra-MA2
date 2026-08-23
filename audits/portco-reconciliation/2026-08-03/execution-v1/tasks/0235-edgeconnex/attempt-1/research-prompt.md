Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: EdgeConneX
MANAGERS TO RESOLVE: EQT Infrastructure; Sixth Street; identify any direct CPP Investments co-ownership
TASK: ledger:0235:edgeconnex:0ea39b90
CANONICAL KEY: edgeconnex|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_OWNER"],"rationale":"The exact company identity exists and production records EQT only. Census holdings identify both EQT Infrastructure and Sixth Street, while a CPP Investments/EQT transaction may also affect ownership. Reconstruct the current cap table without duplicating financing or managed-account exposure.","productionCompanyId":"cmrxpjemf00vyivhe4veoijb8","seedKey":"edgeconnex|United States","startingEvidence":["https://eqtgroup.com/about/current-portfolio/edgeconnex","https://eqtgroup.com/news/eqt-announces-investment-in-edgeconnex","https://sixthstreet.com/investment_announce/sixth-street-announces-investment-in-edgeconnex/","https://www.newswire.ca/news-releases/cpp-investments-partners-with-eqt-to-support-global-digital-infrastructure-growth-826226428.html"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"EdgeConneX","country":"United States","status":"Active","sector":"Digital","subsector":"Data centers","investmentYear":2020,"headquarters":"United States","description":"The repository says EdgeConneX develops and operates edge, hyperscale and build-to-suit data centers globally; EQT acquired it in 2020 and remains the sole recorded owner.","owners":[{"firm":"EQT Infrastructure","vehicle":"NOT_PUBLICLY_DISCLOSED","investmentYear":2020,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"missingPotentialOwners":["Sixth Street","CPP Investments"],"milestones":[{"date":"Nov 5, 2020","event":"EdgeConneX completed its acquisition by EQT Infrastructure.","category":"Acquisition"},{"date":"Feb 28, 2026","event":"EdgeConneX acquired a Swedish data-center site.","category":"Acquisition"},{"date":"Apr 21, 2026","event":"EQT presented EdgeConneX as a core AI-infrastructure platform.","category":"Expansion"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify EdgeConneX's canonical legal/display identity and boundary versus subsidiaries, regional platforms, campuses, joint ventures and individual data centers. Reconstruct ownership from EQT's 2020 acquisition through every later Sixth Street and CPP Investments transaction: exact legal buyer/investor entities, managers, funds/vehicles or managed accounts, primary versus secondary capital, stakes/control, announcement and legal closing dates, whether each transaction closed, and current ownership. Search through the as-of date for later syndication, recapitalization, continuation vehicle, stake sale, owner transfer, EQT/Sixth Street/CPP exit, portfolio removal or signed pending transaction. Do not treat debt financing, project-level joint ventures or commitments to EQT funds as direct company equity. Preserve multiple direct owners only when each has current company-level evidence; do not infer percentages.

RESEARCH RULES
- Resolve canonical identity, aliases, current/former owners and platform/subsidiary/campus boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, continuation fund, merger, rebrand, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, geographic footprint, facilities/capacity and disclosed scale.
- Reopen direct pages. Prefer EdgeConneX, EQT, Sixth Street, CPP Investments, regulatory/filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.edgeconnex.com/
- https://eqtgroup.com/about/current-portfolio/edgeconnex
- https://eqtgroup.com/news/eqt-announces-investment-in-edgeconnex
- https://www.edgeconnex.com/news/press-releases/edgeconnex-announces-completion-of-its-acquisition-by-eqt-infrastructure/
- https://sixthstreet.com/investment_announce/sixth-street-announces-investment-in-edgeconnex/
- https://www.newswire.ca/news-releases/cpp-investments-partners-with-eqt-to-support-global-digital-infrastructure-growth-826226428.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
