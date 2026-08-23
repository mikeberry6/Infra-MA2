Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Tarana Wireless
MANAGER TO RESOLVE: I Squared Capital; identify all current/former investors and financing providers needed to determine scope
TASK: ledger:0297:tarana-wireless:7b60f5b2
CANONICAL KEY: tarana-wireless|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"The repository publishes Tarana Wireless as an I Squared Capital PortCo. The manager census excluded it because I Squared invested through its InfraTech venture/growth strategy and Tarana manufactures fixed-wireless broadband hardware and software rather than owning broadband networks. Confirm whether any current investor holds Tarana through a qualifying direct-infrastructure mandate or the company falls outside this census entirely.","productionCompanyId":"cmrxpjiay011jivhehgsy1djf","seedKey":"tarana wireless|United States","sourceRepoOnlyId":"053-i-squared-capital:repo-only:007:tarana-wireless","startingEvidence":["https://isquaredcapital.com/txnm_fund/infratech/","https://www.taranawireless.com/newsroom/tarana-raises-170m-series-growth-financing-round/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Tarana Wireless","country":"United States","status":"Active","sector":"Digital","subsector":"Fixed wireless broadband equipment","website":"https://www.taranawireless.com/","yearFounded":2009,"investmentYear":2022,"headquarters":"California","owners":[{"firm":"I Squared Capital","vehicle":"ISQ Global InfraTech Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2022,"isActive":true}],"description":"The repository describes a radio-hardware, software and service-provider technology vendor whose customers deploy fixed-wireless broadband networks. It says I Squared participated in a March 2022 growth financing through InfraTech and characterizes Tarana as broadband-enablement technology rather than a network owner.","milestones":[{"date":"2009","event":"Public materials identify Tarana's founding year.","category":"Founding"},{"date":"Mar 23, 2022","event":"Tarana announced a $170mm growth financing including I Squared Capital.","category":"Financing"}]}

IDENTITY, OWNERSHIP AND SCOPE QUESTIONS
Verify Tarana's canonical/legal identity, products, customers, manufacturing model, network deployments, patents, facilities and operating footprint. Reconstruct I Squared's investment: exact InfraTech fund/strategy, security, financing announcement/closing date, stake, current status, dilution and any later sale or exit. Reconstruct later equity and debt financings, including any supplied 100-manager participant, and distinguish direct corporate equity from venture debt, credit facilities and customer/vendor relationships. Determine whether Tarana owns or operates last-mile broadband infrastructure or sells equipment/software to independent network operators; do not attribute customer networks, licensed spectrum or deployed radios to Tarana ownership without direct evidence. Apply the scope rule strictly: critical broadband technology, manufacturing equipment and widespread network deployment do not make an equipment vendor an infrastructure operating company. If no qualifying direct-infrastructure owner or asset platform exists, state whether Tarana should be removed from the PortCo list entirely.

RESEARCH RULES
- Require evidence tying any included owner to a direct infrastructure strategy, vehicle or mandate; InfraTech, venture/growth, corporate venture, credit and public-security exposure is excluded.
- Verify the operating model and owned-asset base rather than classifying from broadband, digital infrastructure or connectivity language alone.
- Verify every security, stake, announcement/closing date, current status and exit; do not assume a financing participant controls the company or remains invested.
- Search through 2026-08-19 for later rounds, debt financings, cap-table changes, ownership changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Tarana, I Squared, fund documents, financing participants, FCC materials and regulatory filings. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.taranawireless.com/
- https://www.taranawireless.com/newsroom/tarana-raises-170m-series-growth-financing-round/
- https://isquaredcapital.com/txnm_fund/infratech/
- https://isquaredcapital.com/txnm_sector/digital/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
