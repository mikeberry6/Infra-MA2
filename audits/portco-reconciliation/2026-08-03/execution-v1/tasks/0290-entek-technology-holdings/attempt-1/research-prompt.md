Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: ENTEK Technology Holdings
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors needed to determine scope
TASK: ledger:0290:entek-technology-holdings:3d9d2806
CANONICAL KEY: entek-technology-holdings|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The manager census and repository both identify ENTEK as an I Squared Capital investment, but its classification as infrastructure rather than battery-component manufacturing remains unresolved. Verify the exact ownership transaction and determine whether the entire company belongs in this direct-infrastructure PortCo census.","productionCompanyId":"cmrxpji440117ivheou5ldq15","seedKey":"entek technology holdings|United States","sourceHoldingId":"053-i-squared-capital:holding:015:entek-technology-holdings","startingEvidence":["https://isquaredcapital.com/cpt_news/i-squared-capital-acquires-majority-stake-in-entek-to-reshore-critical-u-s-battery-manufacturing/","https://isquaredcapital.com/txnm_region/north-america/","https://www.energy.gov/lpo/articles/lpo-offers-conditional-commitment-entek-lithium-separators-llc"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"ENTEK Technology Holdings","country":"United States","status":"Active","sector":"Power & ET","subsector":"Battery separator manufacturing","website":"https://entek.com/","yearFounded":null,"investmentYear":2025,"headquarters":"Indiana; Oregon","owners":[{"firm":"I Squared Capital","vehicle":"n.a.","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2025,"isActive":true}],"description":"The repository describes an asset-heavy manufacturer of lithium-ion battery separators and related components, with Oregon operations and Indiana expansion. It says I Squared announced an agreement in September 2025 to acquire a majority interest and support expansion with up to $800mm, while treating the business as energy-transition industrial infrastructure.","milestones":[{"date":"2024","event":"DOE announced a conditional financing commitment for ENTEK's battery-separator expansion.","category":"Financing"},{"date":"2025","event":"I Squared disclosed up to $800mm of support for U.S. manufacturing expansion.","category":"Financing"},{"date":"Sep 17, 2025","event":"I Squared announced an agreement to acquire a majority equity interest in ENTEK.","category":"Acquisition"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify ENTEK's canonical and legal identity, subsidiaries, products, customers, plants, physical assets and operating model. Reconstruct I Squared's investment: exact fund or strategy, acquisition vehicle, security, announcement date, legal closing date, majority percentage if disclosed, sellers or retained holders, capital commitment, current status, and any later financing, recapitalization, sale or exit through the cutoff. Do not treat a signed agreement as closed ownership unless closing evidence exists. Determine whether I Squared invested through a qualifying direct infrastructure mandate and whether ENTEK itself owns or operates infrastructure, as distinct from manufacturing inputs used by infrastructure and energy-transition systems. Apply the boundary consistently: factories, specialized equipment, DOE financing and strategic importance do not by themselves turn a battery-component manufacturer into an infrastructure operating company. Search for any other manager in the supplied 100-manager universe holding ENTEK through a qualifying infrastructure equity mandate. If no qualifying direct-infrastructure ownership exists, state whether the company should be removed from the PortCo list entirely; if ownership is only signed pending, keep the current legal owner and record a pending incoming transaction.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; exclude ordinary manufacturing, private equity, growth or technology exposure.
- Verify ENTEK's asset and revenue model rather than classifying it from battery, reshoring, industrial infrastructure or energy-transition language alone.
- Distinguish ENTEK Technology Holdings, ENTEK International, ENTEK Lithium Separators, ENTEK Manufacturing and individual plants; count only the manager-level investment boundary.
- Verify every stake, security, announcement/closing date, current status and exit; do not infer closing from an acquisition announcement or majority language.
- Search through 2026-08-19 for closing evidence, later rounds, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer ENTEK, I Squared, DOE/LPO, regulatory filings, sellers and financing participants. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://entek.com/
- https://isquaredcapital.com/cpt_news/i-squared-capital-acquires-majority-stake-in-entek-to-reshore-critical-u-s-battery-manufacturing/
- https://isquaredcapital.com/txnm_region/north-america/
- https://www.energy.gov/lpo/articles/lpo-offers-conditional-commitment-entek-lithium-separators-llc

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
