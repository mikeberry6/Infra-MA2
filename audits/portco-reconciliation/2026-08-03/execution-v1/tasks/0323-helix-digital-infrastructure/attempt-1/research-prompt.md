Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Helix Digital Infrastructure
MANAGER TO RESOLVE: KKR; identify Kuwait Investment Authority, NVIDIA, Vistra and all current owners, investors, strategic partners and vehicles
TASK: ledger:0323:helix-digital-infrastructure:89ceeefd
CANONICAL KEY: helix-digital-infrastructure|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"KKR announced the June 2026 launch of Helix as a dedicated AI-infrastructure company with more than $10bn of committed capital and founding investors including KIA, NVIDIA and Vistra. No production or seed company exists. Verify whether this is an operating/development platform rather than a fund/strategy, and resolve ownership before proposing creation.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"064-kkr:holding:020:helix-digital-infrastructure","startingEvidence":["https://www.kkr.com/newsroom/kkr-announces-launch-of-helix-digital-infrastructure"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Helix Digital Infrastructure","website":"https://www.helixdi.com/","country":"United States","status":"Active","sector":"Digital","subsector":"Integrated AI data-center, power and connectivity infrastructure","headquarters":"New York, New York","yearFounded":2026,"investmentYear":2026,"owners":[{"firm":"KKR","vehicle":"Balance sheet and managed vehicles","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2026,"isActive":true}],"otherFoundingParties":["Kuwait Investment Authority","NVIDIA","Vistra"],"descriptionClaim":"A dedicated company led by Adam Selipsky to finance, develop, own/operate and coordinate hyperscale data centers, power, transmission, fiber and connectivity with more than $10bn of long-duration capital commitments."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve Helix's exact legal/canonical identity, formation date, headquarters and operating structure. Determine whether Helix is a true company with dedicated management and development/operating capabilities, an investment fund/strategy, a consortium/JV, or a marketing umbrella over KKR-managed investments. Reconstruct the founding commitments and legal closing: exact KKR balance-sheet and managed vehicles, KIA vehicle, NVIDIA and Vistra capital interests, equity versus commitments, stakes/control/governance and transaction dates. Distinguish NVIDIA's technology partnership and Vistra's preferred-power-provider role from their equity ownership, and do not assume each founding party has comparable equity. Identify any additional investors admitted after launch. Search through the cutoff for initial acquisitions/developments, platform restructurings, owner changes, exits and signed pending transactions. Define one manager-level Helix boundary and prevent double-counting KKR portfolio companies or project assets merely coordinated, financed or partnered through Helix.

RESEARCH RULES
- Include Helix only if direct evidence establishes a dedicated operating/development company; exclude or defer if it is merely a fund, managed-vehicle strategy or capital pool.
- Require direct evidence for each owner/investor, vehicle, capital type, stake, formation/closing date and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Distinguish equity investors from strategic/technology/offtake partners and from future eligible capital commitments.
- Search through 2026-08-19 for later investors, owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Helix, KKR releases/earnings, KIA, NVIDIA, Vistra, corporate records and transaction materials. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.helixdi.com/
- https://www.helixdi.com/about/
- https://www.helixdi.com/news-insights/kkr-launches-helix-digital-infrastructure-to-finance-and-deliver-the-next-generation-of-ai-infrastructure/
- https://www.kkr.com/newsroom/kkr-announces-launch-of-helix-digital-infrastructure

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
