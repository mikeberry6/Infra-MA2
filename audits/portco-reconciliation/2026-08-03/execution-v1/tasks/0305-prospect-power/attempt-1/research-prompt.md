Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Prospect Power
MANAGERS TO RESOLVE: IFM Investors and ArcLight Capital Partners; identify Swift Current Energy and Elevate Renewables roles
TASK: ledger:0305:prospect-power:12690790
CANONICAL KEY: prospect-power|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The repo-only reconciliation says IFM exited Prospect Power in 2026 when Swift Current Energy sold the project to Elevate Renewables. Production already contains one active Prospect Power company with an ArcLight period and a former IFM period. Verify the ownership-period retirement without realizing or duplicating the company.","productionCompanyId":"cmrxpj6j700jfivhen42ptow2","seedKey":"prospect power|United States","sourceRepoOnlyId":"055-ifm-investors:repo-only:002:prospect-power","startingEvidence":["https://swiftcurrentenergy.com/swift-current-energy-executes-sale-of-prospect-power-to-elevate/","https://www.businesswire.com/news/home/20260115405115/en/Elevate-Acquires-Prospect-Power-Storage-a-150-MW-Battery-Asset-in-Northern-Virginia"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Prospect Power","website":null,"country":"United States","status":"Active","sector":"Power & ET","subsector":"Battery Energy Storage","headquarters":"Virginia","investmentYear":2026,"owners":[{"firm":"ArcLight Capital Partners","vehicle":"Elevate Renewables / ArcLight","stake":null,"investmentYear":2026,"exitYear":null,"isActive":true},{"firm":"IFM Investors","vehicle":"Prior ownership via Swift Current Energy","stake":null,"investmentYear":2024,"exitYear":2026,"isActive":false}],"descriptionClaim":"A 150 MW / 600 MWh standalone battery storage project in Rockingham County, Virginia, sold by Swift Current Energy to ArcLight's Elevate Renewables in January 2026."}

IDENTITY, OWNERSHIP AND PROJECT-BOUNDARY QUESTIONS
Verify Prospect Power's exact project/legal identity, location, capacity, development/operating status and relationship to Swift Current Energy and Elevate Renewables. Establish whether IFM owned Prospect Power indirectly through equity ownership of Swift Current, and if so when Prospect first entered that platform and when IFM's indirect ownership ended. Reconstruct the Elevate acquisition: announcement and legal closing date, purchaser vehicle, seller, stake/control, transaction state and ArcLight fund/vehicle if disclosed. Determine whether the January 2026 releases describe a signed deal, simultaneous close or later closing; do not convert an announcement into a closed transfer without evidence. Search through the cutoff for construction completion, commercial operation, financing, resale, owner changes, exits and signed pending transactions. Keep Prospect Power active if Elevate/ArcLight remains the current owner while retiring only the IFM-linked period. Distinguish the project from Swift Current and Elevate manager-level platforms and from other battery projects.

RESEARCH RULES
- Apply ownership-period logic: retire IFM only when its indirect interest ended; keep the company active if Elevate/ArcLight currently owns it.
- Require direct evidence for Swift Current/IFM linkage, the Prospect transfer, date/state, purchaser and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference for stake or vehicle.
- Do not treat a portfolio-company asset sale as IFM selling the entire Swift Current platform, or Elevate's acquisition as a separate duplicate PortCo.
- Search through 2026-08-19 for later closings, commercial operation, owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Swift Current, Elevate, ArcLight, IFM, permitting/interconnection records and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://swiftcurrentenergy.com/swift-current-energy-executes-sale-of-prospect-power-to-elevate/
- https://www.businesswire.com/news/home/20260115405115/en/Elevate-Acquires-Prospect-Power-Storage-a-150-MW-Battery-Asset-in-Northern-Virginia
- https://www.prnewswire.com/news-releases/swift-current-energy-executes-sale-of-prospect-power-to-elevate-302661837.html
- https://www.ifminvestors.com/capabilities/infrastructure/our-portfolio/swift-current-energy/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
