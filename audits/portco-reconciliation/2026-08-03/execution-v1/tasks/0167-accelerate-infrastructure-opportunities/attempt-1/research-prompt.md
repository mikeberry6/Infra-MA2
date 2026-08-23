Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Accelerate Infrastructure Opportunities
MANAGERS TO RESOLVE: CBRE Investment Management; Mubadala
TASK: ledger:0167:accelerate-infrastructure-opportunities:cc039b14
CANONICAL KEY: accelerate-infrastructure-opportunities|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Mubadala OUT_OF_SCOPE: Fund/LP exposure rather than direct infrastructure ownership.","censusRows":[{"manager":"CBRE Investment Management","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Mubadala OUT_OF_SCOPE: Fund/LP exposure rather than direct infrastructure ownership.","evidenceUrls":["https://www.cbreim.com/press-releases/cbre-im-backed-accelerate-surpasses-1-25-billion-dollars-of-equity-commitments"]}],"repoOnlyRows":[{"manager":"Mubadala","sourceDisposition":"OUT_OF_SCOPE","disposition":"SCOPE_REVIEW","rationale":"Fund/LP exposure rather than direct infrastructure ownership.","evidenceUrls":["https://www.cbreim.com/press-releases/cbre-im-backed-accelerate-surpasses-1-25-billion-dollars-of-equity-commitments"]}],"repoRows":[{"productionCompanyId":"cmrxpjamu00puivhe9q2wp35l","seedKey":"accelerate infrastructure opportunities|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjamu00puivhe9q2wp35l","name":"Accelerate Infrastructure Opportunities","country":"United States","status":"Active","sector":"Digital","subsector":"Infrastructure ground leases","yearFounded":2022,"investmentYear":2022,"headquarters":"38 US states","description":"Accelerate Infrastructure Opportunities acquires and manages infrastructure ground leases in the United States. The repository says CBRE Investment Management and Accelerate launched the partnership in 2022 and that it had acquired more than 200 properties across 38 states by 2024.","owners":[{"firm":"CBRE Investment Management","vehicle":"CBRE Private Infrastructure Funds","investmentYear":2022,"isActive":true}],"milestones":[{"date":"Dec 2022","event":"CBRE Investment Management and Accelerate joined forces to launch the infrastructure site acquisition strategy.","category":"Financing"},{"date":"Mar 30, 2023","event":"Accelerate and CBRE IM announced the launch of their partnership to acquire infrastructure ground leases.","category":"Acquisition"},{"date":"Oct 29, 2024","event":"CBRE IM announced that Accelerate Infrastructure Opportunities had raised $630 million from CBRE IM.","category":"Other"},{"date":"Oct 29, 2024","event":"CBRE IM stated that the platform had acquired more than 200 properties across 38 states.","category":"Acquisition"}],"sources":[{"label":"Accelerate official website","url":"https://we-are-accelerate.com/","purpose":"COMPANY_PROFILE"},{"label":"CBRE IM launch release","url":"https://www.cbreim.com/press-releases/accelerate-and-cbreim-launch-partnership-to-acquire-infrastructure-ground-leases","purpose":"MILESTONE_EVENT"},{"label":"CBRE IM capital release","url":"https://www.cbreim.com/press-releases/accelerate-infrastructure-opportunities-raises-630-million-from-cbre-im","purpose":"OWNERSHIP_INVESTMENT"}]}

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/project boundaries.
- Determine whether the company or asset is a manager-level North American infrastructure PortCo. Exclude debt, public securities, fund/LP exposure, non-infrastructure strategies, and subsidiaries/projects already counted under a platform.
- Resolve CBRE IM's direct manager/platform ownership separately from Mubadala's economic commitment. Do not turn an LP or fund commitment into direct operating-company ownership.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Preserve historical investing-platform identity across manager acquisitions or renames; a parent-manager transaction does not create a new PortCo ownership period unless the underlying investment legally transferred.
- Search through 2026-08-19 for sale, sold, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy and signed pending transactions. A signed buyer is not current until closing; the legal seller remains current during a pending exit.
- Verify North American geography, official website, headquarters, founding year, products/services, customers/end markets, operating footprint, scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator/government, filings and transaction-party releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cbreim.com/press-releases/cbre-im-backed-accelerate-surpasses-1-25-billion-dollars-of-equity-commitments
- https://we-are-accelerate.com/
- https://www.cbreim.com/press-releases/accelerate-and-cbreim-launch-partnership-to-acquire-infrastructure-ground-leases
- https://www.cbreim.com/press-releases/accelerate-infrastructure-opportunities-raises-630-million-from-cbre-im

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
