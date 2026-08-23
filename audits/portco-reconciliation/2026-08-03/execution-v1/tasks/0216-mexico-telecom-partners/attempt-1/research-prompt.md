Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Mexico Telecom Partners (MTP)
MANAGERS TO RESOLVE: DigitalBridge; Macquarie Asset Management; InfraBridge
TASK: ledger:0216:mexico-telecom-partners:4a74c013
CANONICAL KEY: mexico-telecom-partners|mexico

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The ledger has one production/seed MTP record, two census holdings attributed to DigitalBridge and Macquarie, and one InfraBridge repo-only MATCHED_ELSEWHERE judgment. It generated a merge action even though no second production company or candidate canonical key exists. Determine whether the merge is false-positive, whether the current owner periods are accurate, and whether Mexico Tower Partners and Mexico Telecom Partners are aliases, a rename, or separate entities.","sourceHoldingIds":["036-digitalbridge:holding:011:mexico-telecom-partners","065-macquarie-asset-management:holding:017:mexico-telecom-partners"],"sourceRepoOnlyId":"058-infrabridge:repo-only:008:mexico-telecom-partners","productionCompanyIds":["cmrxpjdbm00tyivher2rzd195"],"seedKeys":["mexico telecom partners|Mexico"]}

CURRENT PRODUCTION/SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjdbm00tyivher2rzd195","name":"Mexico Telecom Partners","country":"Mexico","status":"Active","sector":"Digital","subsector":"Wireless towers and edge digital infrastructure","website":null,"yearFounded":2014,"investmentYear":2014,"headquarters":"Mexico","owners":[{"firm":"DigitalBridge","vehicle":"DigitalBridge Equity","investmentYear":2014,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true},{"firm":"Macquarie Asset Management","vehicle":"MMIF","investmentYear":2014,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"descriptionClaims":["MTP owns and operates wireless towers and adjacent digital infrastructure in Mexico.","MTP was created in 2014 by combining existing Mexican tower portfolios backed by Digital Bridge and Macquarie Mexican Infrastructure Fund.","MTP later added edge data-center activity."],"claimedHistory":["May 21, 2014 formation of Mexico Tower Partners.","June 19, 2023 Mexico City data-center inauguration."],"relationCounts":{"ownershipPeriods":2,"pendingOwnershipTransactions":0,"milestones":2,"citations":5}}

IDENTITY AND OWNERSHIP QUESTIONS
- Prove whether Mexico Tower Partners, Mexico Telecom Partners, MTP and any legal Spanish/holding-company names refer to one continuing platform. Choose one canonical display identity and aliases. Determine whether any duplicate record exists conceptually; do not recommend a merge merely because multiple managers co-own one company.
- Verify the original 2014 formation/closing, which portfolios or assets were combined, the exact DigitalBridge and Macquarie funds/vehicles, control and stake disclosures, and whether both sponsors remain current owners as of the as-of date.
- Determine whether InfraBridge ever held direct MTP equity or whether the repo-only row is solely a DigitalBridge/InfraBridge attribution error.
- Search through 2026-08-19 for ownership transfers, fund realizations, continuation transactions, recapitalizations, sales of either sponsor's stake, regulatory approvals, signed pending exits, or portfolio removal. Distinguish a manager-level corporate transaction from an MTP equity transfer.
- Resolve the platform boundary. Keep individual towers, edge facilities, data centers, site portfolios and subsidiaries beneath MTP unless separately held by an infrastructure manager.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, predecessors/successors, current/former owners and platform/subsidiary boundaries.
- Verify every manager, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer current ownership from a stale portfolio page without an exit search.
- Verify official website, headquarters, founding year, services, customer/end markets, geographic footprint, disclosed tower/site and edge-data-center scale, and current operating status.
- Reopen direct pages. Prefer MTP, DigitalBridge, Macquarie, Mexican regulatory/competition filings and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.digitalbridge.com/portfolio/mexico-telecom-partners
- https://www.macquarie.com/us/en/about/company/macquarie-asset-management/our-portfolio/mexico-telecom-partners.html
- https://www.mtpsites.com/ourcompany.html
- https://www.marketscreener.com/quote/stock/MACQUARIE-GROUP-LIMITED-6491460/news/Macquarie-Mexican-Infrastructure-Fund-Partners-with-Digital-Bridge-to-Form-Second-Largest-Independ-18475031/
- https://www.datacenterdynamics.com/en/news/mtp-inaugurates-data-center-in-mexico-city/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
