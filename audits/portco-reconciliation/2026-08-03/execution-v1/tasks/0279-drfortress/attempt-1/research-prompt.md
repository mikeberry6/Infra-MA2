Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: DRFortress
MANAGERS TO RESOLVE: Harrison Street; FifteenFortySeven Critical Systems Realty / 1547 Critical Systems Realty; GI Partners; founders/management; identify all direct current and former owners
TASK: ledger:0279:drfortress:c7515be2
CANONICAL KEY: drfortress|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":["MERGE_COMPANIES"],"rationale":"The manager census treated DRFortress as acquired and operated within the Harrison Street/1547 data-center relationship and proposed consolidating it into the manager-level 1547 Critical Systems Realty platform. The repository publishes DRFortress as a standalone PortCo. Independently verify the actual platform-versus-asset/company boundary and ownership.","productionCompanyId":"cmrxpjhkp010givheoim63k6q","seedKey":"drfortress|United States","linkedTaskId":"ledger:0273:1547-critical-systems-realty:8e267688","startingEvidence":["https://harrisonst.com/1547-and-harrison-street-acquire-drfortress-hawaiis-leading-carrier-neutral-data-center/","https://www.drfortress.com/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"DRFortress","country":"United States","status":"Active","sector":"Digital","subsector":"Carrier-neutral colocation and interconnection data center","website":"https://www.drfortress.com/","yearFounded":null,"investmentYear":2025,"headquarters":"Hawaii","owners":[{"firm":"Harrison Street","vehicle":"Harrison Street Digital Fund","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2025,"isActive":true}],"description":"The repository describes DRFortress as Hawaii's largest carrier-neutral colocation/interconnection data center, serving enterprise, carrier, cloud, submarine-cable and public-sector customers. It says Harrison Street and 1547 acquired DRFortress from GI Partners in April 2025 through Harrison Street Digital Fund, with founders continuing operations and no disclosed ownership split.","milestones":[{"date":"Jan 2020","event":"GI Partners announced a majority investment in DRFortress alongside the founders.","category":"Acquisition"},{"date":"2020–2025","event":"DRFortress nearly doubled colocation capacity under GI ownership.","category":"Expansion"},{"date":"Apr 3, 2025","event":"Harrison Street and 1547 announced the acquisition from GI Partners.","category":"Acquisition"}]}

IDENTITY AND OWNERSHIP QUESTIONS
Resolve DRFortress's exact legal and brand identity, asset/operator boundary, founders' roles and relationship to 1547 Critical Systems Realty. Reconstruct GI Partners' 2020 entry, founder rollover/retained ownership, the 2025 Harrison Street/1547 transaction, announcement and legal closing dates, sellers, direct acquiring entities, Harrison Street fund/vehicle, stakes and all current/former owners. Determine whether Harrison Street owns DRFortress directly through an asset/company JV, owns the broader 1547 management platform, or both; do not infer platform-level ownership from an asset acquisition. Search for later recapitalization, sale, financing, operator change, ownership transfer or signed pending transaction through the cutoff. Verify current operations, location, facility/campus scope, power/capacity and expansion status. Define whether DRFortress is itself the manager-level operating company/platform that should remain a standalone PortCo, or an underlying asset that belongs only under another canonical holding. State explicitly how task 279 relates to linked task 273 and which record should survive if consolidation is warranted.

RESEARCH RULES
- Resolve canonical identity, aliases, platform/JV/company/facility-SPV boundary, current/former direct owners, and manager/fund/vehicle attribution.
- Verify every stake, announcement date, legal closing/entry date, exit date and transaction state; do not infer equal ownership or the Harrison Street Digital Fund label.
- Search through 2026-08-19 for ownership transfers, recapitalizations, exits and signed pending transactions.
- Count the manager-level investment once, while recognizing that a separately acquired operating company can remain a PortCo even when an operator/partner manages it.
- Reopen direct pages and filings. Prefer DRFortress, Harrison Street, 1547, GI Partners, founder/company releases and transaction parties. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.drfortress.com/
- https://harrisonst.com/1547-and-harrison-street-acquire-drfortress-hawaiis-leading-carrier-neutral-data-center/
- https://www.1547realty.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
