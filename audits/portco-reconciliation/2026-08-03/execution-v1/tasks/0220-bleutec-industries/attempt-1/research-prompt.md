Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Bleutec Industries
MANAGER TO RESOLVE: EnCap Investments
TASK: ledger:0220:bleutec-industries:3c6b9662
CANONICAL KEY: bleutec-industries|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The 2022 EnCap equity commitment and later Bleutec operating activity were found, but Bleutec was absent from EnCap's current aggregate portfolio page and no explicit EnCap exit was located. Determine whether EnCap remains a current equity owner, has exited, or whether the status is genuinely unresolved.","productionCompanyId":"cmrxpje9300veivhewkxji64b","seedKey":"bleutec industries|United States","startingEvidence":["https://www.encapinvestments.com/news/bleutec-industries-announces-equity-commitment-encap-investments","https://www.pphb.com/bleutec"]}

CURRENT REPOSITORY SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpje9300veivhewkxji64b","name":"Bleutec Industries","country":"United States","status":"Active","sector":"Power & ET","subsector":"Offshore wind installation vessels and marine services","investmentYear":2022,"headquarters":"Texas","website":null,"description":"The repository describes a Houston-based developer of Jones Act-compliant offshore-wind installation vessels and marine services, backed by EnCap in 2022.","owners":[{"firm":"EnCap Investments","vehicle":"EnCap Energy Transition","investmentYear":2022,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"May 2018","event":"Bleutec was founded.","category":"Founding"},{"date":"Nov 30, 2022","event":"Bleutec announced a significant equity commitment from EnCap.","category":"Financing"},{"date":"Dec 2022","event":"Bleutec signed a Wärtsilä MOU for the BMIS vessel concept.","category":"Other"},{"date":"Mar 2023","event":"Bleutec announced ABS Approval in Principle for BMIS designs.","category":"Other"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Verify Bleutec's canonical legal/display identity, aliases, continuing operations and boundary versus BMIS, vessel/project entities, partners and service providers. Reconstruct EnCap's 2022 commitment: exact investing fund or vehicle, announcement and legal closing dates, stake/control if disclosed, and whether the financing actually closed. Search direct company, EnCap, fund, SEC/UCC/court, maritime-regulatory, vessel registry, partner, financing and credible trade sources through the as-of date for later capital raises, insolvency, dissolution, foreclosure, asset or IP transfers, vessel-order cancellation, recapitalization, sale, portfolio removal, EnCap exit or signed pending transaction. Absence from an aggregate portfolio page alone does not prove an exit; likewise, continuing project activity alone does not prove EnCap still owns equity. Decide whether the company should remain active under EnCap, become realized/former, be corrected to another canonical identity/owner, be excluded, or remain deferred.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, current/former owners and platform/subsidiary/project boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing from an announcement.
- Search through 2026-08-19 for sale, transfer, recapitalization, refinancing, insolvency, dissolution, foreclosure, asset disposition, portfolio removal and signed pending transactions.
- Verify official website/status, headquarters, founding year, products/services, customers/end markets, operating footprint, vessel/project status and disclosed scale.
- Reopen direct pages. Prefer Bleutec, EnCap, SEC/regulatory/court/vessel-registry and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.encapinvestments.com/news/bleutec-industries-announces-equity-commitment-encap-investments
- https://www.pphb.com/bleutec
- https://netsco.us/2023/03/netsco-is-proud-to-support-bleutec-industries-in-offshore-wind-projects/
- https://www.offshore-mag.com/renewable-energy/article/14280250/exec-qa-bleutec-ceo-addresses-offshore-wind-turbine-installation-challenges

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
