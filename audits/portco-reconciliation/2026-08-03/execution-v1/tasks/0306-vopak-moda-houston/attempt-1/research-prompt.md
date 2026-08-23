Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Vopak Moda Houston
MANAGER TO RESOLVE: IFM Investors; also identify the actual direct owners and their parent/platform relationships
TASK: ledger:0306:vopak-moda-houston:8614eb7b
CANONICAL KEY: vopak-moda-houston|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The IFM census proposed Vopak Moda Houston as a new IFM infrastructure holding, but the captured evidence was only IFM's generic homepage and the terminal website. Primary sources instead describe a 50/50 Royal Vopak/Moda Midstream joint venture and a 2024 transfer of Moda's stake to Exolum. Test IFM attribution and the manager-level company boundary before any creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"055-ifm-investors:holding:011:vopak-moda-houston","startingEvidence":["https://www.ifminvestors.com/","https://www.vopak.com/terminals/north-america/vopak-moda-houston"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Vopak Moda Houston","legalNameClaim":"Vopak Moda Houston LLC","website":"https://www.vopak.com/terminals/north-america/vopak-moda-houston","country":"United States","status":"Active","sector":"Midstream","subsector":"Ammonia and NGL marine terminal","headquarters":"Houston, Texas","investmentYear":null,"owners":[{"firm":"IFM Investors","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":null,"isActive":true}],"description":"The census treated the terminal as a direct IFM holding without transaction or portfolio evidence."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve the legal and operating identity of Vopak Moda Houston LLC and the terminal/holdco structure. Reconstruct its formation, Royal Vopak's investment, initial 50/50 ownership with Moda Midstream, and Moda/EnCap Flatrock's sale of its 50% interest to Exolum: agreement date, legal closing date, vehicle and current stake. Search through the cutoff for later owner changes, renaming, recapitalizations, exits and signed pending transactions. Search IFM's official portfolio, releases, reports and filings for any direct or indirect infrastructure-equity ownership; do not infer an IFM holding from a generic homepage, sector fit, lending exposure or unrelated terminal investment. Determine whether Vopak Moda Houston is a standalone manager-level PortCo or an underlying terminal/JV beneath the larger Exolum or Royal Vopak operating platforms. Apply the census rule against double-counting subsidiaries/projects beneath an already-counted manager platform. Identify whether Exolum itself is represented elsewhere in the manager universe or repository, but do not turn indirect ownership of Exolum into a separate direct manager stake in this terminal.

RESEARCH RULES
- Require direct evidence tying IFM Investors to equity ownership under an infrastructure mandate. If none exists, explicitly reverse the census's CREATE_COMPANY/ADD_OWNER recommendation.
- Distinguish direct terminal equity (Royal Vopak/Moda/Exolum) from upstream fund ownership of a parent platform, project finance and customer contracts.
- Exclude an underlying asset/JV when the manager-level platform is the proper canonical PortCo boundary; explain any cross-reference needed.
- Require direct evidence for agreement/closing dates, stakes and current owners. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Vopak, Exolum, Moda/EnCap, Port Houston, corporate filings and IFM's official portfolio. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, EXCLUDED, SUPERSEDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.vopak.com/terminals/north-america/vopak-moda-houston
- https://www.vopak.com/newsroom/news/news-vopak-moda-houston-commissions-its-fully-operational-marine-terminal-port?language_content_entity=en
- https://www.encapinvestments.com/news/exolum-announces-agreement-acquire-50-leading-ammonia-and-ngl-storage-terminal-houston-moda
- https://www.encapinvestments.com/about/midstream/portfolio/realized/moda-midstream
- https://www.ifminvestors.com/capabilities/infrastructure/our-portfolio/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
