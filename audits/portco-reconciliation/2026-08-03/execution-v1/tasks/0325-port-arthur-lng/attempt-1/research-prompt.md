Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census, and Deal Database claim as unverified.

REQUESTED COMPANY: Port Arthur LNG
MANAGERS TO RESOLVE: KKR; Sempra Infrastructure / Sempra; identify every direct current and former owner of the relevant project interests
TASK: ledger:0325:port-arthur-lng:d837cc61
CANONICAL KEY: port-arthur-lng|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The KKR repo-only review asserted that Port Arthur LNG is a project already captured within the broader Sempra Infrastructure Partners platform. The repository nevertheless publishes Port Arthur LNG as a standalone PortCo because KKR also bought a direct indirect interest in Phase 1. Independently determine the manager-level counting boundary; do not assume either the proposed merge or the standalone record is correct.","productionCompanyId":"cmrxpjjwz0142ivhel1oxig89","seedKey":"port arthur lng|United States","possibleKeepCompany":"Sempra Infrastructure Partners, LP","startingEvidence":["https://semprainfrastructure.com/what-we-do/lng/port-arthur-lng/","https://www.sempra.com/newsroom/press-releases/sempra-infrastructure-completes-sale-non-controlling-interest-port-arthur","https://www.kirkland.com/news/press-release/2025/09/kirkland-advises-kkr-on-investment-in-sempra-infrastructure-partners-port-arthur-lng-project"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Port Arthur LNG","country":"United States","status":"Active","sector":"Midstream","subsector":"LNG export terminal","yearFounded":null,"investmentYear":2023,"headquarters":"Texas","owners":[{"firm":"KKR","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2023,"isActive":true}],"description":"Port Arthur LNG is described as a two-phase, four-train LNG export development in Jefferson County, Texas. The seed states Sempra Infrastructure completed a sale of a 42% indirect non-controlling interest in Phase 1 to KKR in September 2023.","milestones":[{"date":"Mar 2023","event":"Phase 1 reached final investment decision.","category":"Financing"},{"date":"Sep 12, 2023","event":"Sempra Infrastructure completed the sale of a 42% indirect non-controlling interest in Phase 1 to KKR.","category":"Acquisition"}],"possibleParentRecord":{"name":"Sempra Infrastructure Partners, LP","owners":"Sempra plus infrastructure investors including KKR and others","boundary":"North American LNG, energy networks and lower-carbon infrastructure platform"}}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact identities and boundaries of Port Arthur LNG, Port Arthur LNG Phase 1, Phase 2, the project companies/SPVs, Sempra Infrastructure, and Sempra Infrastructure Partners, LP. Determine exactly what KKR acquired in 2023, from whom, through which fund/vehicle, the legal closing date, the direct/indirect stake level and entity, and whether the interest is economically separate from KKR's equity stake in Sempra Infrastructure Partners. Investigate the September 2025 KKR financing/investment and any other follow-on capital or ownership transaction: identify whether it changed the Phase 1 stake, added a project-level interest, financed construction without equity ownership, or related only to the parent platform. Establish every current and former direct project owner, Phase 1 owner, and parent-platform owner only as necessary to prevent double counting. Search through the cutoff for sales, dilution, recapitalizations, FID changes, cancellations, ownership transfers, or signed pending exits. Verify project status, operating/development boundary, capacity, phases, location, official website, and North American infrastructure qualification.

COUNTING DECISION REQUIRED
State explicitly whether Port Arthur LNG should remain a standalone manager-level PortCo because KKR holds a separately acquired direct/indirect project interest; merge into Sempra Infrastructure Partners because the only attributable exposure is already captured at the platform level; remain as an underlying asset but be excluded from the manager-level census; or receive a narrower correction. If keeping both records, explain why they are non-duplicative and identify the ownership interests each represents. Do not merge merely because Sempra controls both entities, and do not keep a project merely because it has a branded website.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/project/SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit date, and transaction state. Keep Phase 1, Phase 2, project-company, and parent-platform percentages distinct.
- Search through 2026-08-19 for subsequent ownership transfers, recapitalizations, exits, and signed pending transactions.
- Reopen direct pages and filings. Prefer Sempra, Sempra Infrastructure, KKR, regulatory/DOE/FERC filings, financing documents, and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://semprainfrastructure.com/what-we-do/lng/port-arthur-lng/
- https://portarthurlng.com/
- https://www.sempra.com/newsroom/press-releases/sempra-infrastructure-completes-sale-non-controlling-interest-port-arthur
- https://www.kirkland.com/news/press-release/2025/09/kirkland-advises-kkr-on-investment-in-sempra-infrastructure-partners-port-arthur-lng-project

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
