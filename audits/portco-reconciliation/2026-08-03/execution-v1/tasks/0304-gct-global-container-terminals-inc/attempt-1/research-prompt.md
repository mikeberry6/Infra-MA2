Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: GCT Global Container Terminals Inc.
MANAGERS TO RESOLVE: IFM Investors, BCI and Ontario Teachers' Pension Plan; identify all current/former owners and vehicles
TASK: ledger:0304:gct-global-container-terminals-inc:7bd15d5c
CANONICAL KEY: gct-global-container-terminals-inc|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"Production and one seed entry contain GCT Global Container Terminals Inc., while a second seed-only record omits Inc. The census created another heuristic candidate despite matching the same company and evidence. Verify one canonical identity, consolidate the duplicate seed identity and correct ownership/history if needed.","candidateKeep":{"name":"GCT Global Container Terminals Inc.","productionCompanyId":"cmrxpj8l000mmivhe1cfe4xs6","seedKey":"gct global container terminals inc.|Canada"},"candidateDuplicate":{"name":"GCT Global Container Terminals","productionCompanyId":null,"seedKey":"gct global container terminals|Canada"},"sourceHoldingIds":["055-ifm-investors:holding:005:gct-global-container-terminals-inc","076-ontario-teachers-pension-plan:holding:006:gct-global-container-terminals-inc"],"startingEvidence":["https://www.ifminvestors.com/en-gb/capabilities/infrastructure/our-portfolio/gct-global-container-terminals/","https://globalterminals.com/about/about-us/","https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ifm-investors-and-bci-to-join-ontario-teachers-as-equity-partners-in-gct-global-container-terminals-inc-/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"candidateKeep":{"name":"GCT Global Container Terminals Inc.","website":"https://globalterminals.com/","country":"Canada","status":"Active","sector":"Transportation","subsector":"Container terminals / ports","yearFounded":1907,"headquarters":"British Columbia","owners":[{"firm":"Ontario Teachers' Pension Plan","vehicle":"n.a.","stake":"37.5%","investmentYear":2007,"isActive":true},{"firm":"IFM Investors","vehicle":"IFM Global Infrastructure Fund (GIF)","stake":"37.5%","investmentYear":2018,"isActive":true},{"firm":"BCI","vehicle":"Infrastructure & Renewable Resources","stake":"25%","investmentYear":2018,"isActive":true}]},"candidateDuplicate":{"name":"GCT Global Container Terminals","website":null,"country":"Canada","owners":[{"firm":"Ontario Teachers' Pension Plan","stake":"37.5%"},{"firm":"IFM Investors","stake":"37.5%"},{"firm":"BCI","stake":"25%"}]}}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Prove whether both repository names identify the same legal company and operating platform, including the legal suffix and current trade name. Reconstruct Ontario Teachers' 2007 acquisition/formation, IFM and BCI's 2018 entry, exact stakes, announcement and closing dates, funds/vehicles and current ownership. Search through the cutoff for later owner changes, recapitalizations, exits and signed pending transactions. Specifically resolve the sale of GCT's U.S. terminals to CMA CGM and whether that was an asset/segment disposition rather than a sale of the surviving Canadian GCT platform or sponsor equity. Define the current company boundary and asset footprint: distinguish the surviving Canadian GCT Deltaport and GCT Vanterm operations from former GCT Bayonne/New York terminals, individual concession entities and terminal assets. Verify website, headquarters, operating scale and current manager portfolio status. Recommend exactly one canonical company, one seed record and redirect/retirement of the duplicate identity without duplicating any ownership period.

RESEARCH RULES
- Do not treat the optional Inc. suffix as a separate company unless primary evidence proves two legal operating groups.
- Require direct evidence for each current owner, stake, entry/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference for funds, vehicles or dates.
- Distinguish sponsor-equity changes from the 2023 U.S. terminal sale, asset-level transactions, concessions and financings.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer GCT, IFM, BCI, Ontario Teachers', CMA CGM, competition/regulatory materials and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://globalterminals.com/about/about-us/
- https://globalterminals.com/ifm-investors-bci-join-ontario-teachers-equity-partners-gct-global-container-terminals-inc/
- https://www.ifminvestors.com/en-gb/capabilities/infrastructure/our-portfolio/gct-global-container-terminals/
- https://www.otpp.com/en-ca/about-us/news-and-insights/2018/ifm-investors-and-bci-to-join-ontario-teachers-as-equity-partners-in-gct-global-container-terminals-inc-/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
