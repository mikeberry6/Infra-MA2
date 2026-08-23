Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Enbridge Gas Ohio
MANAGER TO RESOLVE: IFM Investors; also identify the actual legal owner(s)
TASK: ledger:0303:enbridge-gas-ohio:8007deaa
CANONICAL KEY: enbridge-gas-ohio|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The IFM census proposed Enbridge Gas Ohio as a new IFM infrastructure holding, but the captured evidence was only the operating-company website and IFM's generic homepage. No production or seed company exists. Direct Enbridge and SEC materials instead appear to identify Enbridge Inc. as the buyer and owner. Test the manager attribution before any creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"055-ifm-investors:holding:010:enbridge-gas-ohio","startingEvidence":["https://www.enbridgegas.com/ohio","https://www.ifminvestors.com/"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Enbridge Gas Ohio","formerName":"The East Ohio Gas Company / Dominion Energy Ohio","website":"https://www.enbridgegas.com/ohio","country":"United States","status":"Active","sector":"Utilities","subsector":"Regulated natural-gas distribution utility","headquarters":null,"investmentYear":null,"owners":[{"firm":"IFM Investors","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":null,"isActive":true}],"description":"The census treated Enbridge Gas Ohio as an IFM holding without direct manager-level ownership evidence."}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Resolve the exact legal identity and name history of Enbridge Gas Ohio / The East Ohio Gas Company / Dominion Energy Ohio. Reconstruct Dominion Energy's sale: agreement date, legal closing date, purchaser entity, consideration, percentage acquired and whether Enbridge Inc. or any co-investor owns it. Search IFM's current portfolio, releases, filings, reports and credible transaction sources for any direct IFM infrastructure equity, co-investment, managed-account stake, acquisition financing or later purchase in Enbridge Gas Ohio. Do not infer ownership from an IFM homepage, sector eligibility, lending exposure or unrelated Enbridge assets. Search through the cutoff for later minority sales, joint ventures, recapitalizations, owner changes, exits and signed pending transactions. Verify whether the utility remains wholly owned or controlled by Enbridge and whether public-company subsidiary ownership excludes it from this infrastructure-fund PortCo census. Define the company boundary: the regulated Ohio utility is one operating company; do not count service territories, pipelines, storage fields, rate-base projects or financing subsidiaries separately.

RESEARCH RULES
- Require direct evidence tying IFM Investors to equity ownership under an infrastructure mandate. If no such evidence exists and Enbridge remains the owner, recommend EXCLUDED and explicitly reverse the census's CREATE_COMPANY/ADD_OWNER recommendation.
- Distinguish Enbridge Inc. (a public strategic utility company) from an infrastructure fund manager and from IFM Investors.
- Require direct evidence for legal identity, purchaser, closing date, stake and current ownership. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Enbridge, Dominion Energy, SEC, Ohio regulatory records and IFM's official portfolio. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.enbridgegas.com/ohio
- https://www.enbridge.com/media-center/news/details?id=123807
- https://www.sec.gov/Archives/edgar/data/715957/000119312524061495/d762900d8k.htm
- https://www.ifminvestors.com/capabilities/infrastructure/our-portfolio/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
