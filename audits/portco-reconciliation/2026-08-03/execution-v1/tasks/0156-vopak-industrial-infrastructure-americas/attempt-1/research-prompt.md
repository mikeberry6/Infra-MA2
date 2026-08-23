Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Vopak Industrial Infrastructure Americas
MANAGERS TO RESOLVE: BlackRock, Global Infrastructure Partners
TASK: ledger:0156:vopak-industrial-infrastructure-americas:bef0b093
CANONICAL KEY: vopak-industrial-infrastructure-americas|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","censusRows":[{"manager":"BlackRock","disposition":"VERIFIED_EXISTING","rationale":"Accepted manager repo-only judgment(s) require one consolidated company proposal: Global Infrastructure Partners MATCHED_ELSEWHERE: Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":["https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-acquire-three-industrial-terminals-dow-us-gulf-coast"]}],"repoOnlyRows":[{"manager":"Global Infrastructure Partners","sourceDisposition":"MATCHED_ELSEWHERE","disposition":"CONSOLIDATION_REVIEW","rationale":"Attributable to legacy BlackRock infrastructure vehicles, not GIP","evidenceUrls":[]}],"repoRows":[{"productionCompanyId":"cmrxpj92i00neivheuthp9gpg","seedKey":"vopak industrial infrastructure americas|United States","sourcePresence":"BOTH","disposition":"MATCHED_CENSUS"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpj92i00neivheuthp9gpg","name":"Vopak Industrial Infrastructure Americas","country":"United States","status":"Active","sector":"Midstream","subsector":"Industrial terminals and storage","yearFounded":2020,"headquarters":"Louisiana and Texas","description":"Vopak Industrial Infrastructure Americas is an industrial-terminal platform on the US Gulf Coast. The assets provide storage, logistics, and industrial infrastructure services to a large chemical customer base rather than directly serving consumer end markets. Its operating model is asset-heavy and contracted because value depends on terminal infrastructure and long-term service agreements. Public transaction materials describe three terminals acquired from Dow in Plaquemine, Saint Charles, and Freeport, giving the platform exposure to both Louisiana and Texas. Operations are concentrated on the US Gulf Coast, where the assets are integrated with Dow's industrial footprint. Royal Vopak and BlackRock's Global Energy & Power Infrastructure Fund formed the 50-50 venture in 2020 and completed the acquisition of the terminals the same year.","owners":[{"id":"cmrxpjudc01kvivhe8vpflp22","firm":"BlackRock","vehicle":"Global Energy & Power Infrastructure Fund","investmentYear":2020,"isActive":true}],"milestones":[{"date":"Dec 2, 2020","event":"Vopak and BlackRock's GEPIF successfully completed the acquisition of the three industrial terminals from Dow.","category":"Acquisition"},{"date":"Sep 14, 2020","event":"Vopak and BlackRock's GEPIF announced the acquisition of three industrial terminals from Dow on the U.S. Gulf Coast.","category":"Acquisition"},{"date":"2020","event":"The partners established a 50-50 industrial infrastructure joint venture covering terminals in Louisiana and Texas.","category":"Founding"}],"sources":[{"label":"Announcement date source — BlackRock — Vopak Industrial Infrastructure Americas","url":"https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-acquire-three-industrial-terminals-dow-us-gulf-coast?language_content_entity=en","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Close date source — BlackRock — Vopak Industrial Infrastructure Americas","url":"https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-successfully-completed-acquisition-three-industrial","purpose":"OWNERSHIP_INVESTMENT"},{"label":"Vopak — Vopak Industrial Infrastructure Americas","url":"https://www.vopak.com/system/files/press/2020/12/6175e64e-5ed0-4b2f-8ec7-8f1dc4f5b2b8.pdf","purpose":"SUPPORTING_CONTEXT"}]}

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/project boundaries.
- Determine whether the company or asset is a manager-level North American infrastructure PortCo. Exclude debt, public securities, fund/LP exposure, non-infrastructure strategies, upstream commodity businesses without infrastructure economics, and subsidiaries/projects already counted under a platform.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Preserve historical investing-platform identity across manager acquisitions or renames; a parent-manager transaction does not create a new PortCo ownership period unless the underlying investment legally transferred.
- Search through 2026-08-19 for sale, sold, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy and signed pending transactions. A signed buyer is not current until closing; the legal seller remains current during a pending exit.
- Verify North American geography, official website, headquarters, founding year, products/services, customers/end markets, operating footprint, scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator/government, filings and transaction-party releases. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-acquire-three-industrial-terminals-dow-us-gulf-coast
- https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-acquire-three-industrial-terminals-dow-us-gulf-coast?language_content_entity=en
- https://www.vopak.com/newsroom/news/vopak-and-blackrocks-gepif-successfully-completed-acquisition-three-industrial
- https://www.vopak.com/system/files/press/2020/12/6175e64e-5ed0-4b2f-8ec7-8f1dc4f5b2b8.pdf

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.

