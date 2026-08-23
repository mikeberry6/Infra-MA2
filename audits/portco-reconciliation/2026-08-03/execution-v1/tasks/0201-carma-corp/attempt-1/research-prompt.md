Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: CARMA Corp.
MANAGERS TO RESOLVE: CVC DIF
TASK: ledger:0201:carma-corp:7b48e49a
CANONICAL KEY: carma-corp|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The existing CARMA identity is established, but CVC DIF's September 2025 announcement described a definitive agreement rather than a confirmed legal close. Verify the current owner and transaction state.","censusRows":[{"manager":"CVC","holdingId":"034-cvc:holding:007:carma-corp"},{"manager":"DIF","holdingId":"035-dif:holding:007:carma-corp"}],"productionCompanyIds":["cmrxpjcvs00t9ivhes1jkf37g"],"seedKeys":["carma corp.|Canada"],"startingEvidence":["https://www.cvc.com/media/news/2025/cvc-dif-to-acquire-carma-corp-a-leading-canadian-submetering-and-essential-building-services-platform/"]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjcvs00t9ivhes1jkf37g","name":"CARMA Corp.","country":"Canada","status":"Active","sector":"Utilities","subsector":"Submetering and utility billing","yearFounded":1977,"investmentYear":2025,"headquarters":"Ontario; Alberta; British Columbia; Nova Scotia","description":"The repository treats CARMA as a Canadian submetering and building-services platform serving more than 1,000 buildings and approximately 135,000 units. It says CVC DIF signed a definitive agreement in September 2025 through DIF Infrastructure VIII but does not disclose post-closing ownership.","owners":[{"firm":"CVC DIF","vehicle":"DIF Infrastructure VIII","investmentYear":2025,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"1977","event":"CARMA was founded.","category":"Founding"},{"date":"Sep 15, 2025","event":"CVC DIF announced a definitive agreement to acquire CARMA through DIF Infrastructure VIII.","category":"Acquisition"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Verify CARMA's canonical legal/display identity and platform boundary. Reopen the 2025 CVC DIF announcement and identify the seller, stake, fund, signing date, conditions and whether the transaction legally closed. Search through the as-of date for Competition Bureau or other regulatory review, financing, legal close, cancellation, amendment, later sale or exit. If no closing is found, keep the actual pre-closing owner active if identifiable and represent CVC DIF only as a signed pending incoming buyer; do not backdate active ownership to signing. If closing is proved, capture the exact close date and retire the former owner. Do not count installed meters, customer buildings or service entities as separate PortCos.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, owners and platform/subsidiary boundaries.
- Verify every manager, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a closing or percentage.
- Search through 2026-08-19 for closing, regulatory approval, sale, transfer, recapitalization, cancellation and signed pending transactions.
- Verify official website, headquarters, founding-year meaning, services, customers, operating footprint, building/unit scale and current status.
- Reopen direct pages. Prefer CARMA, CVC DIF, seller, Canadian regulatory/government and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.cvc.com/media/news/2025/cvc-dif-to-acquire-carma-corp-a-leading-canadian-submetering-and-essential-building-services-platform/
- https://carmacorp.com/about/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
