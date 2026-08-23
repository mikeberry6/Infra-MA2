Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Medical Properties Partnership
MANAGERS TO RESOLVE: Macquarie Asset Management / Macquarie Infrastructure Partners V; Medical Properties Trust; identify all current/former direct owners and the effect of Steward Health Care's bankruptcy and Massachusetts hospital transfers
TASK: ledger:0329:medical-properties-partnership:c29a0cad
CANONICAL KEY: medical-properties-partnership|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"The census found a 2021-announced, March 2022-closed 50/50 partnership for eight Massachusetts hospital properties, but ownership continuity and infrastructure classification were uncertain. Subsequent Steward Health Care distress, bankruptcy, hospital closures, lease changes and asset transfers may have changed or dissolved the original portfolio. Independently determine the current legal and economic state before retaining an active PortCo.","productionCompanyId":"cmrxpjkab014mivhe72i1zmv9","seedKey":"medical properties partnership|United States","sourceHoldingId":"065-macquarie-asset-management:holding:016:medical-properties-partnership","startingEvidence":["https://ir.medicalpropertiestrust.com/news/news-details/2021/Medical-Properties-Trust-and-Macquarie-Infrastructure-Partners-V-Enter-Partnership-for-Eight-Massachusetts-Hospitals-Valued-at-1-78-Billion-09-01-2021/default.aspx","https://s206.q4cdn.com/146646187/files/doc_news/Medical-Properties-Trust-Completes-Hospital-Partnership-With-Macquarie-Asset-Management-03-16-2022-2022.pdf"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Medical Properties Partnership","country":"United States","status":"Active","sector":"Social Infra","subsector":"Acute-care hospital real estate partnership","website":null,"yearFounded":2022,"investmentYear":2022,"headquarters":"Massachusetts","owners":[{"firm":"Macquarie Asset Management","vehicle":"Macquarie Infrastructure Partners V","stake":"50%","investmentYear":2022,"isActive":true}],"description":"The seed describes a 50/50 JV between a MIP V-controlled subsidiary and Medical Properties Trust that owned eight Steward-operated Massachusetts acute-care hospital properties valued at approximately $1.78bn.","milestones":[{"date":"Sep 1, 2021","event":"MIP V and MPT announced the eight-hospital partnership.","category":"Financing"},{"date":"Mar 16, 2022","event":"MPT announced completion of the partnership.","category":"Financing"},{"date":"Mar 30, 2023","event":"MPT reaffirmed the 50/50 structure.","category":"Financing"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve the exact legal identity or identities of the partnership/JV and each disclosed acquisition or property-holding subsidiary. Identify the eight original hospital properties and distinguish ownership of the real estate from hospital operations, leases, operator entities, mortgage/security interests, and any government or nonprofit transferees. Verify announcement and legal close dates, total portfolio value, Macquarie/MIP V and Medical Properties Trust stakes, acquisition vehicles, financing, and infrastructure mandate. Then reconstruct every material event through the cutoff arising from Steward distress/bankruptcy, Massachusetts settlements, lease termination, property sale or transfer, hospital closure, foreclosure, impairment, re-tenanting, recapitalization, or dissolution. Determine exactly which original properties, if any, remain in the 50/50 partnership and whether Macquarie/MIP V still owns an active interest. Search MPT SEC filings, bankruptcy-court records, Massachusetts government sources, Macquarie disclosures and property records; do not assume continued ownership from a 2023 shareholder letter.

COUNTING AND ELIGIBILITY DECISION REQUIRED
State whether a durable manager-level infrastructure partnership remains active, whether it should be realized/retired, whether its assets were split into successor holdings, or whether it should be excluded as conventional healthcare real estate rather than infrastructure. Apply the program's infrastructure test based on asset ownership, long-duration essential-service characteristics and Macquarie infrastructure mandate—not merely the word “hospital.” Do not count hospital operators or individual facilities as separate PortCos unless evidence establishes a new manager-level successor platform. If material ownership cannot be resolved after primary-source research, return DEFERRED rather than inventing continuity.

RESEARCH RULES
- Resolve canonical identity, aliases, JV/property-SPV/operator boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing date, entry date, exit/transfer date, and transaction state. Keep real-estate ownership distinct from clinical operations.
- Search through 2026-08-19 for bankruptcy-related transfers, recapitalizations, exits, closures, and signed pending transactions.
- Reopen direct pages and filings. Prefer Macquarie, MPT SEC/IR, bankruptcy-court, Massachusetts government, property/transaction-party and operator-successor sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.macquarie.com/au/en/about/news/2021/macquarie-infrastructure-partners-v-and-medical-properties-trust-enter-partnership-for-eight-massachusetts-hospitals-valued-at-1-78-billion-usd.html
- https://ir.medicalpropertiestrust.com/news/news-details/2021/Medical-Properties-Trust-and-Macquarie-Infrastructure-Partners-V-Enter-Partnership-for-Eight-Massachusetts-Hospitals-Valued-at-1-78-Billion-09-01-2021/default.aspx
- https://s206.q4cdn.com/146646187/files/doc_news/Medical-Properties-Trust-Completes-Hospital-Partnership-With-Macquarie-Asset-Management-03-16-2022-2022.pdf

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
