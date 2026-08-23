Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Tonaquint Data Centers / ValorC3
MANAGERS TO RESOLVE: CVC DIF
TASK: ledger:0209:tonaquint-data-centers:c32a57e3
LINKED DUPLICATE TASK TO RESOLVE IN THE SAME CHAT: ledger:0210:valorc3:48b37136
CANONICAL KEYS UNDER REVIEW: tonaquint-data-centers|united-states; valorc3|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES_IF_REBRAND_CONFIRMED"],"rationale":"Production and seed contain separate active Tonaquint and ValorC3 rows, while ValorC3 says Tonaquint launched the new brand in January 2025. Prove whether this is one continuing platform and choose the canonical survivor.","censusRows":[{"manager":"CVC","holdingId":"034-cvc:holding:020:valorc3"},{"manager":"DIF","holdingId":"035-dif:holding:020:valorc3"}],"productionCompanyIds":["cmrxpjd3z00toivhesha276ac","cmrxpjd5200tqivheyj3gg8uj"],"seedKeys":["tonaquint data centers|United States","valorc3|United States"],"startingEvidence":["https://www.cvcdif.com/news-insights/dif-capital-partners-acquires-us-based-data-centre-provider-tonaquint","https://www.valorc3.com/about-us/","https://www.valorc3.com/press-releases/2025/01/17/tonaquint-data-centers-launches-new-brand-valorc3/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"tonaquint":{"id":"cmrxpjd3z00toivhesha276ac","status":"Active","sector":"Digital","subsector":"Colocation and cloud data centers","ownershipVehicle":"DIF CIF III","investmentYear":2023,"yearFounded":2008,"headquarters":"Utah; Idaho; Oklahoma","owner":"CVC DIF","milestones":4,"citations":4},"valorC3":{"id":"cmrxpjd5200tqivheyj3gg8uj","status":"Active","sector":"Digital","subsector":"Colocation, cloud, and data centers","ownershipVehicle":"DIF CIF III","investmentYear":2023,"yearFounded":2008,"headquarters":"Utah; Idaho; Oklahoma","owner":"CVC DIF","milestones":4,"citations":4},"claimedHistory":["DIF acquired Tonaquint through CIF III in January 2023 and said management retained a minority stake.","Tonaquint acquired EdgeX Data Centers in November 2023.","Tonaquint announced the ValorC3 brand on January 17, 2025."]}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether ValorC3 is only Tonaquint's new brand/display identity, a legal rename, a new parent or a distinct platform. Resolve legal names, rebrand effective date, website/domain continuity, facilities, management and which production record should survive. Verify the 2023 DIF acquisition, fund, management's retained minority, announcement and legal closing dates. Search for later acquisitions, recapitalization, sale, transfer or signed pending exit. Keep EdgeX and individual Utah, Idaho and Oklahoma facilities beneath the manager-level platform unless independently held by CVC DIF.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, owners and platform/facility boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not invent exact stakes or closing dates.
- Search through 2026-08-19 for closing, rebrand, sale, transfer, recapitalization, financing, acquisitions and signed pending transactions.
- Verify official website, headquarters, founding year, products/services, customers/end markets, operating footprint, disclosed data-center scale and current status.
- Reopen direct pages. Prefer ValorC3/Tonaquint, CVC DIF, seller, regulatory and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. One complete result must explicitly cover both task IDs so the linked ValorC3 task can be superseded if appropriate. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cvcdif.com/news-insights/dif-capital-partners-acquires-us-based-data-centre-provider-tonaquint
- https://www.cvcdif.com/news-insights/dif-investee-company-tonaquint-acquires-edgex-data-centers-in-oklahoma-city
- https://www.valorc3.com/
- https://www.valorc3.com/about-us/
- https://www.valorc3.com/press-releases/2025/01/17/tonaquint-data-centers-launches-new-brand-valorc3/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
