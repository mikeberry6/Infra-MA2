Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Fibernow
MANAGERS TO RESOLVE: DigitalBridge; InfraBridge
TASK: ledger:0214:fibernow:ea7c2ad3
CANONICAL KEY: fibernow|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The ledger has one production/seed Fibernow record and one InfraBridge repo-only MATCHED_ELSEWHERE judgment attributed to DigitalBridge. It nevertheless generated a merge scope even though no second production company was identified. Determine whether this is one continuing OpticalTel/Fibernow platform that needs correction only, a true duplicate merge, verified no change, exclusion, or deferral.","censusHolding":"036-digitalbridge:holding:008:fibernow","repoOnlyJudgment":"058-infrabridge:repo-only:006:fibernow","productionCompanyIds":["cmrxpjdb400txivhexf162x1c"],"seedNames":["Fibernow"],"startingEvidence":["https://www.digitalbridge.com/portfolio/fibernow","https://www.fibernow.com/","https://fibernow.com/aboutus/","https://www.paulweiss.com/insights/client-news/digitalbridge-backed-opticaltel-becomes-fibernow"]}

CURRENT PRODUCTION/SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdb400txivhexf162x1c","name":"Fibernow","country":"United States","status":"Active","sector":"Digital","subsector":"Fiber broadband","website":null,"lastVerifiedAt":null,"owner":{"firm":"DigitalBridge","vehicle":"DigitalBridge Fund III","investmentYear":2024,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},"descriptionClaims":["Fibernow provides fiber broadband, managed Wi-Fi, television and voice services to communities and institutions.","The company serves residential communities, businesses, homeowners associations, student housing and assisted-living facilities.","DigitalBridge materials identify 2024 as the investment year through DigitalBridge Partners III."],"claimedHistory":["DigitalBridge-backed OpticalTel became Fibernow on October 23, 2024 after DigitalBridge's investment in OpticalTel.","Fibernow serves communities across Florida and beyond."],"relationCounts":{"ownershipPeriods":1,"pendingOwnershipTransactions":0,"milestones":3,"citations":4}}

IDENTITY AND OWNERSHIP QUESTIONS
- Prove whether OpticalTel and Fibernow are one continuing legal/platform company and choose one canonical display/legal identity plus aliases. Determine whether any separate OpticalTel production or seed record exists conceptually or whether the ledger's MERGE_COMPANIES action is a false positive with only one record.
- Verify DigitalBridge's actual acquisition/investment announcement and legal closing date, the exact fund/vehicle, stake or control status, and whether 2024 is the true entry year rather than merely the rebrand year.
- Determine whether InfraBridge ever held direct Fibernow/OpticalTel equity, or whether it must be excluded as a manager-label/portfolio-attribution error.
- Search through 2026-08-19 for a sale, transfer, recapitalization, refinancing, rebrand, portfolio removal, signed pending exit, or manager-level transaction. Do not treat a transaction involving DigitalBridge itself as a direct Fibernow ownership transfer without company-level evidence.
- Resolve the manager-level platform boundary. Keep local networks, bulk-service contracts, communities, customer properties and acquired operating assets beneath Fibernow unless separately held by an infrastructure manager.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessor/successor names, current/former owners and platform/subsidiary boundaries.
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer an exact stake or close date from a rebrand announcement.
- Verify official website, headquarters, founding year, products/services, customers/end markets, operating footprint, disclosed scale and current status.
- Reopen direct pages. Prefer Fibernow/OpticalTel, DigitalBridge, InfraBridge, regulatory filings and transaction-party or counsel sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones.

Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction.

Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState.

Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls.

Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary.

Recommend exactly one primary source.
