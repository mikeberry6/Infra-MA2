Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Vertical Bridge
MANAGERS TO RESOLVE: CDPQ; DigitalBridge; InfraBridge; KKR
TASK: ledger:0174:vertical-bridge:62c32643
CANONICAL KEY: vertical-bridge|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"Accepted manager repo-only judgment requires one consolidated company proposal: InfraBridge MATCHED_ELSEWHERE, attributed to DigitalBridge's digital strategy rather than InfraBridge. Identify the canonical keep record and boundary; do not infer a merger merely from the manager-label correction.","censusRows":[{"manager":"CDPQ","holdingId":"028-cdpq:holding:021:vertical-bridge"},{"manager":"DigitalBridge","holdingId":"036-digitalbridge:holding:016:vertical-bridge"},{"manager":"KKR","holdingId":"064-kkr:holding:019:vertical-bridge"}],"repoOnlyRows":[{"manager":"InfraBridge","disposition":"MATCHED_ELSEWHERE","rationale":"Attributed to DigitalBridge digital strategy rather than InfraBridge."}],"repoRows":[{"productionCompanyId":"cmrxpjbqt00riivhe4i0hbeof","seedKey":"vertical bridge|United States","sourcePresence":"BOTH"}]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjbqt00riivhe4i0hbeof","name":"Vertical Bridge","country":"United States","status":"Active","sector":"Digital","subsector":"Wireless towers and communications infrastructure","yearFounded":2014,"investmentYear":2019,"headquarters":"Multiple US states","description":"The repository describes Vertical Bridge as a private U.S. wireless-tower and communications-infrastructure owner with more than 500,000 sites including more than 18,000 towers. It records CDPQ at 30% from 2019, DigitalBridge from 2014 with a controlling transaction closed in 2021, and KKR from a $1.5 billion strategic equity announcement in 2026.","owners":[{"firm":"CDPQ","vehicle":"n.a.","investmentYear":2019,"stake":"30%","isActive":true},{"firm":"DigitalBridge","vehicle":"DigitalBridge Equity","investmentYear":2014,"stake":"Not publicly disclosed","isActive":true},{"firm":"KKR","vehicle":"KKR core infrastructure strategy","investmentYear":2026,"stake":"Not publicly disclosed","isActive":true}],"milestones":[{"date":"2014","event":"DigitalBridge entered its original Vertical Bridge investment.","category":"Financing"},{"date":"Apr 2, 2019","event":"CDPQ announced an agreement to acquire 30%.","category":"Acquisition"},{"date":"Oct 13, 2021","event":"DigitalBridge announced completion of its controlling-stake acquisition.","category":"Acquisition"},{"date":"Dec 23, 2024","event":"Vertical Bridge closed its Verizon tower-portfolio transaction.","category":"Acquisition"},{"date":"Apr 22, 2026","event":"Vertical Bridge announced a $1.5 billion strategic equity investment from KKR.","category":"Financing"}],"sources":[{"url":"https://www.verticalbridge.com/about"},{"url":"https://www.lacaisse.com/en/news/pressreleases/cdpq-to-acquire-30-stake-in-us-wireless-infrastructure-leader-vertical-bridge"},{"url":"https://www.digitalbridge.com/news/2021-10-13-digitalbridge-completes-acquisition-of-controlling-stake-in-vertical-bridge"},{"url":"https://www.digitalbridge.com/portfolio/vertical-bridge"},{"url":"https://www.verticalbridge.com/press-releases/vertical-bridge-announces-1-5-billion-strategic-equity-investment-from-kkr"}]}

IDENTITY AND OWNERSHIP QUESTIONS TO RESOLVE
Determine whether InfraBridge has ever been a direct owner or whether the repository merely confused InfraBridge with DigitalBridge. Verify each disclosed CDPQ, DigitalBridge and KKR entry, legal closing and current status; distinguish announcements from closes. Test whether KKR's 2026 investment legally closed by the as-of date, whether it diluted or replaced an owner, and whether CDPQ's 30% and DigitalBridge control remained current. Resolve any manager renames, funds, vehicles and exact stake disclosures without inference. A manager-label correction is not a company merger unless a duplicate canonical company actually exists.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, and platform-versus-subsidiary/site boundaries.
- Determine whether Vertical Bridge is one manager-level operating platform. Exclude towers, rooftops, billboard/utility sites, transaction SPVs and acquired portfolios as separate PortCos.
- Verify every current and former direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, stake or closing.
- Search through 2026-08-19 for sale, sold, exit, divestiture, transfer, recapitalization, merger, rebrand, bankruptcy and signed pending transactions.
- Verify geography, official website, headquarters, founding year, products/services, customers/end markets, footprint, scale and current operating status.
- Reopen direct pages. Prefer company, manager, regulator, filing and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.verticalbridge.com/about
- https://www.digitalbridge.com/portfolio/vertical-bridge
- https://www.lacaisse.com/en/news/pressreleases/cdpq-to-acquire-30-stake-in-us-wireless-infrastructure-leader-vertical-bridge
- https://www.digitalbridge.com/news/2021-10-13-digitalbridge-completes-acquisition-of-controlling-stake-in-vertical-bridge
- https://www.verticalbridge.com/press-releases/vertical-bridge-announces-1-5-billion-strategic-equity-investment-from-kkr

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
