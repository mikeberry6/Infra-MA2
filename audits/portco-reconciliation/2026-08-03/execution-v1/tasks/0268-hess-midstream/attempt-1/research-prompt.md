Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Hess Midstream
MANAGERS TO RESOLVE: Global Infrastructure Partners / BlackRock; Hess Corporation / Chevron; identify all direct current and former owners
TASK: ledger:0268:hess-midstream:b85ab916
CANONICAL KEY: hess-midstream|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The census proposed a new canonical PortCo because no exact production or seed match exists. It attributed Hess Midstream to GIP through Hess Infrastructure Partners, while acknowledging the public listing. Verify whether GIP still holds a direct sponsor/GP equity interest rather than only public-market exposure and whether the manager-level company belongs in the PortCo list.","productionCompanyId":null,"seedKey":null,"startingEvidence":["https://www.hessmidstream.com/","https://www.sec.gov/ix?doc=/Archives/edgar/data/1545654/000154565426000010/hessmidstream-20251231.htm"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Hess Midstream","country":"United States","status":"Active","sector":"Midstream","subsector":"Oil and gas gathering, processing, and transportation","yearFounded":null,"investmentYear":2015,"headquarters":"Houston, Texas","owners":[{"firm":"Global Infrastructure Partners","vehicle":"Hess Infrastructure Partners LP (GIP sponsor/GP interest)","investmentYear":2015,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"description":"The census describes a U.S. midstream infrastructure platform operating primarily in North Dakota. It says Hess Infrastructure Partners, backed by GIP and Hess, controls the general-partner and sponsor interest despite Hess Midstream's public listing.","milestones":[]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve Hess Midstream LP, Hess Midstream Operations LP, Hess Infrastructure Partners LP, the general partner, sponsor entities and operating subsidiaries. Reconstruct the 2015 GIP/Hess formation, 2017 IPO, 2019 simplification, sponsor-unit sales or repurchases, Chevron's acquisition of Hess, and every later ownership or control change. Determine the exact current economic and voting/control interests held by GIP/BlackRock and Hess/Chevron, the public float, and whether any relevant GIP fund or managed vehicle is disclosed. Distinguish direct sponsor/GP ownership from passive public securities. Establish whether BlackRock's acquisition of GIP and Chevron's acquisition of Hess changed only manager/corporate identity or transferred the underlying interests. Search through the cutoff for secondary offerings, unit buybacks, sponsor exits, take-private plans, recapitalizations, signed sales or other pending ownership changes. Verify headquarters, asset footprint, customers/contracts, and current operating scale.

RESEARCH RULES
- Resolve canonical legal identity, aliases, parent/GP/operating-subsidiary boundary, current/former direct owners and manager/fund/vehicle attribution.
- Verify every stake, voting/control right, announcement date, legal closing date, entry date, exit date and transaction state. Do not infer percentages from stale filings or conflate public float with sponsor ownership.
- Search through 2026-08-19 for sponsor sales, unit repurchases, public offerings, control transfers, take-private, recapitalization, owner exit and signed pending transactions.
- Decide explicitly whether this belongs as a direct infrastructure PortCo despite being publicly traded. Exclude it if GIP/BlackRock no longer has a qualifying direct ownership/control interest.
- Reopen direct pages and filings. Prefer Hess Midstream, SEC filings, GIP/BlackRock, Hess/Chevron and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.hessmidstream.com/
- https://investors.hessmidstream.com/
- https://www.sec.gov/ix?doc=/Archives/edgar/data/1545654/000154565426000010/hessmidstream-20251231.htm
- https://www.global-infra.com/
- https://www.chevron.com/newsroom/2025/q3/chevron-completes-acquisition-of-hess-corporation

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
