Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: American Student Transportation Partners (ASTP)
MANAGERS TO RESOLVE: CVC DIF
TASK: ledger:0199:american-student-transportation-partners-astp:0eaaa394
CANONICAL KEY: american-student-transportation-partners-astp|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"The production database has one ASTP company, but seed data contains both American Student Transportation Partners and American Student Transportation Partners (ASTP). Resolve whether these are exact duplicates and whether the 2025 CVC DIF acquisition actually closed.","censusRows":[{"manager":"CVC","holdingId":"034-cvc:holding:003:american-student-transportation-partners-astp"},{"manager":"DIF","holdingId":"035-dif:holding:003:american-student-transportation-partners-astp"}],"productionCompanyIds":["cmrxpjct700t4ivhe097ggvuj"],"seedKeys":["american student transportation partners|United States","american student transportation partners (astp)|United States"],"startingEvidence":["https://www.cvc.com/media/news/2025/cvc-dif-agrees-to-acquire-premier-us-student-transportation-operator-astp-from-access-holdings/","https://www.prnewswire.com/news-releases/access-holdings-announces-sale-of-american-student-transportation-partners-to-cvc-dif-302526686.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"production":{"id":"cmrxpjct700t4ivhe097ggvuj","name":"American Student Transportation Partners (ASTP)","country":"United States","status":"Active","sector":"Transportation","subsector":"Student transportation","ownershipVehicle":"DIF Infrastructure VII","investmentYear":2025,"relationCounts":{"ownershipPeriods":1,"milestones":8,"citations":6,"redirects":1}},"seedDuplicateA":{"name":"American Student Transportation Partners","subsector":"Contracted student transportation","yearFounded":2021,"investmentYear":2025,"owner":"CVC DIF / DIF Infrastructure VII","milestones":4},"seedDuplicateB":{"name":"American Student Transportation Partners (ASTP)","subsector":"Student transportation","yearFounded":2021,"investmentYear":2025,"owner":"CVC DIF / DIF Infrastructure VII","milestones":4},"sharedClaims":{"scale":"More than 90,000 students, more than 50 districts and more than 2,300 vehicles","announcementDate":"2025-08-12","seller":"Access Holdings"}}

IDENTITY AND OWNERSHIP QUESTIONS
Prove whether both seed names refer to the same operating company and choose one canonical legal/display name plus aliases. Resolve ASTP against subsidiaries, local bus operators, Assisted Transportation Services and Brandywine routes; keep subsidiaries and acquired route assets beneath the platform unless they are separately manager-level investments. Verify the 2025 buyer, seller, fund, stake, announcement date and legal closing date. Search for a later closing, regulatory approval, portfolio listing, financing, amendment, cancellation, sale or exit. Do not treat an agreement announcement or an article headline using “acquired” as legal-closing evidence unless a party or filing supports it. Determine whether CVC DIF is current, only signed pending incoming, or not completed.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessors, owners and platform/subsidiary boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not invent a percentage or closing.
- Search through 2026-08-19 for closing, regulatory approval, portfolio status, sale, transfer, recapitalization, cancellation and signed pending transactions.
- Verify official website, headquarters, founding year, services, school-district customers, operating footprint, fleet/student/district scale and current status.
- Reopen direct pages. Prefer ASTP, CVC DIF, Access Holdings, regulators and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cvc.com/media/news/2025/cvc-dif-agrees-to-acquire-premier-us-student-transportation-operator-astp-from-access-holdings/
- https://www.prnewswire.com/news-releases/access-holdings-announces-sale-of-american-student-transportation-partners-to-cvc-dif-302526686.html
- https://astpartners.com/
- https://astpartners.com/about-astp/
- https://astpartners.com/2023/09/brandywine/
- https://www.schoolbusfleet.com/news/american-student-transportation-partners-acquired-by-cvc-dif

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
