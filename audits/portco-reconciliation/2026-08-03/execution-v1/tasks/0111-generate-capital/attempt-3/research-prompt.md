Research one North American infrastructure portfolio-company record as of 2026-08-18. Use current web research, open direct pages, and search both acquisitions and later exits/secondaries. Treat the repo snapshot as claims to verify.

REQUESTED COMPANY: Generate Capital
MANAGER TASKS: AustralianSuper; CBRE Investment Management; Harbert Management Corp; QIC
CANONICAL TARGET: existing company cmrxpjha100zwivhes4yyec81, Generate Capital, United States

CURRENT REPO CLAIMS
- Active POWER_ET platform; sustainable infrastructure investment and operations; founded 2014.
- Website null; headquarters “Multi-state United States”; aliases empty.
- Active owners: QIC (2019, vehicle n.a., stake unknown); AustralianSuper (2021, AustralianSuper Infrastructure Portfolio); Harbert Management Corp (2021, Harbert Infrastructure); CBRE Investment Management (2021, CBRE Caledon).
- Milestones: 2014 founding; 2019 QIC entry; $2bn July 19, 2021 raise; Nov. 16, 2021 PBC conversion; $1.5bn Jan. 31, 2024 raise; March 24, 2026 Equinox Growers asset sale.
- Queue action ADD_OWNER may be a false positive caused by manager aliases. Do not duplicate an existing owner.

RESEARCH AND DECISION RULES
- Resolve Generate Capital / Generate Capital, Inc. / Generate Capital, PBC / Generate identity and manager-level platform boundary. Exclude funds, subsidiaries, projects and individual assets as separate PortCos.
- Verify geography, infrastructure-strategy basis, official website, headquarters, founding year, operating model and current disclosed scale.
- Determine current/former status, entry timing, disclosed stake, fund and vehicle for each of the four requested manager associations. Resolve Australian Super→AustralianSuper, CBRE Caledon→CBRE Investment Management, Harbert Infrastructure/Gulf Pacific→Harbert Management Corp, and QIC Global Infrastructure→QIC.
- A disclosed asset-level percentage is not a Generate parent-company stake. Never invent a fund, vehicle, stake or exact close date.
- Search explicitly for later exits, secondary transfers, recapitalizations and signed pending platform sales. An asset sale such as Equinox Growers is not a Generate platform exit.
- Do not call Harbert or CBRE current solely because they invested in 2021. Seek a current company/manager/filing source or explain the current-status basis after the exit search. Use UNRESOLVED if active ownership remains materially uncertain.
- Signed transactions remain pending until close. Use CLOSED_ACTIVE, SIGNED_PENDING_INCOMING, SIGNED_PENDING_EXIT or REALIZED.
- Prefer official company, manager, regulatory, government and filing sources. Use direct HTTPS URLs, not search snippets.
- Use NOT_PUBLICLY_DISCLOSED for noncritical gaps. Use UNRESOLVED only for material identity or active-ownership uncertainty; that blocks application.
- Return PROPOSED_CORRECTION if any identity, ownership, date, source or company field needs correction; VERIFIED_NO_CHANGE only if the record is fully supported; DEFERRED only for material unresolved identity/active ownership.

STARTING SOURCES TO REOPEN
- https://generatecapital.com/
- https://www.qic.com/Investment-Capabilities/Infrastructure/Global-Portfolio/Generate
- https://www.businesswire.com/news/home/20210719005233/en/Generate-Closes-%242-Billion-Equity-Raise-from-Global-Institutional-Investors-to-Accelerate-and-Scale-Sustainable-Infrastructure-and-Climate-Solutions
- https://www.harbert.net/news/hif-harbert-infrastructure-to-acquire-interests-in-generate-capital-inc-a-leading-distributed-infrastructure-platform
- https://www.harbert.net/assets/press-releases/harbert-infrastructure-generate-press-release-july-19-2021.pdf
- https://www.businesswire.com/news/home/20240130298422/en/Leading-Global-Institutions-Invest-in-a-Clean-Energy-Future-With-Generate-Capital
- https://www.australiansuper.com/superannuation/superannuation-articles/2021/10/-/media/australian-super/files/about-us/annual-reports/2021-annual-report.pdf

TRANSPORT REQUIREMENT — IMPORTANT
The ChatGPT web interface truncated the prior two answers inside fenced code blocks. Do not use a code fence, backticks, a preformatted block, a canvas, or an attached file. Return the JSON as ordinary plain text between literal markers, followed by a concise Markdown review between separate markers:

BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the decision, owner treatment, and any blocker.
END_REVIEW

Keep the complete response under 7,500 characters, use no more than 8 evidence rows and 4 milestones, and keep strings concise. Every top-level key below is mandatory:

{"asOfDate":"2026-08-18","requestedCompany":"Generate Capital","requestedManager":"AustralianSuper / CBRE Investment Management / Harbert Management Corp / QIC","decision":"PROPOSED_CORRECTION|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","rationale":"","identityResolution":{"canonicalLegalName":"","canonicalDisplayName":"","aliases":[],"officialWebsite":null,"headquartersOrOperatingLocation":null,"country":"United States","platformBoundary":"","duplicateDecision":""},"ownershipResolution":{"managerAliasDecision":"","currentInfrastructureManagerOwners":[],"formerInfrastructureManagerOwners":[],"pendingOwnershipTransactions":[],"duplicateOwnerAction":""},"operatingResolution":{"sector":"POWER_ET","subsector":"Sustainable infrastructure investment and operations","region":"NORTH_AMERICA","countryTags":["United States"],"description":"","companyStatus":"ACTIVE|REALIZED","yearFounded":null,"productsAndServices":"","customersAndEndMarkets":"","footprint":"","disclosedScale":[]},"acquisitionExitCheck":{"entry":"","currentStatus":"","subsequentExitSearch":""},"milestones":[],"evidence":[],"beforeAfterChanges":[],"excludedOrDuplicateCandidates":[],"unresolvedQuestions":[],"recommendedListAction":""}

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Milestone keys only: date,event,category,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
