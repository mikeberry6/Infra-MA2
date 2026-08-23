Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Network FiberCo
REQUESTED MANAGER: PSP Investments; identify every current/former direct owner
TASK: ledger:0389:network-fiberco:3f7436bc
CANONICAL KEY: network-fiberco|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["CREATE_COMPANY","ADD_OWNER"],"rationale":"The census treated Network FiberCo as a current 2025 PSP/BCE U.S. fiber joint-venture platform, but no canonical record exists and the only evidence was BCE's general website. Verify whether Network FiberCo is an investable operating platform, a transaction holdco for Ziply Fiber or another network, the exact close and current economic owner set before creation.","productionCompanyIds":[],"seedKeys":[],"sourceHoldingId":"081-psp-investments:holding:005:network-fiberco","startingEvidence":["https://www.bce.ca/"]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the canonical legal/commercial relationship among Network FiberCo, BCE/Bell Canada, PSP Investments, Ziply Fiber, Northwest Fiber and any acquisition or partnership vehicles. Determine whether Network FiberCo is the manager-level owner/operator of U.S. fiber assets, an intermediate joint-venture holdco, or merely a financing/investment vehicle that should map to the underlying Ziply Fiber operating platform. Do not create both a holding vehicle and its wholly controlled operating company unless each is a distinct manager-level business.

Verify the original transaction announcement and exact legal closing date, every investor, seller, acquisition target, vehicle/account, contributed capital, exact comparable stake and governance/control rights. Determine PSP's direct or look-through economic interest and BCE's retained/control stake. Search through 2026-08-19 for regulatory approvals, later capital contributions, stake changes, new investors, recapitalizations, exits and signed pending ownership transactions.

Distinguish company equity from acquisition debt, fiber build financing, commercial agreements and vendor/customer relationships. If the census name is only a holdco, recommend the correct canonical operating-company identity and describe Network FiberCo as the ownership vehicle rather than a separate PortCo.

BOUNDARY AND OPERATING PROFILE
Confirm official website if any, headquarters, formation year, operating brand, products/services, states/markets served, fiber-route/premises scale, customer/end markets and two to four material milestones. Preserve the boundary between the fiber platform and BCE's Canadian telecom operations.

RESEARCH RULES
- Resolve canonical identity, aliases, holdco/JV/operating-company boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry/exit date and transaction state.
- Search through 2026-08-19 for later ownership transfers, recapitalizations, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer BCE/Bell, PSP, Ziply/Northwest Fiber, U.S./Canadian regulatory filings, financing documents and transaction releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW only if a qualifying distinct canonical platform should be created; PROPOSED_CORRECTION if the task should map to an existing operating-company record; PROPOSED_MERGE if duplicate identities are proven; EXCLUDED if PSP's exposure is debt-only/LP-only or Network FiberCo is a non-operating vehicle beneath an already-counted company; DEFERRED if identity/current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.bce.ca/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
