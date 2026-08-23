Research one North American infrastructure portfolio-company reconciliation as of 2026-08-19 using current direct sources and acquisition/exit searches. Treat every repo/census claim as unverified.

REQUESTED COMPANY: QSP (Northern Virginia Data Center JV)
REQUESTED MANAGERS: Wren House Infrastructure and QTS/Blackstone as applicable
TASK: ledger:0462:qsp-northern-virginia-data-center-jv:3a29bbb8
CANONICAL KEY: qsp-northern-virginia-data-center-jv|united-states

The census proposes QSP as a Wren House Northern Virginia data-center JV, while the repository already contains canonical `QSP`. Determine whether they are exactly the same manager-level investment and whether later task 491 `QSP` should be covered by this decision. Resolve the legal JV/holdco name, Wren House fund/vehicle, QTS/Blackstone role, stakes, formation/closing date, governance, campuses/assets and current status. Do not count the JV, its holdcos and individual campuses separately. Verify owned versus planned capacity and search through 2026-08-19 for transfers, recapitalizations, exits and pending transactions.

Prefer Wren House, QTS, Blackstone, planning/utility/regulatory and financing sources. Return PROPOSED_MERGE if the requested label and existing QSP are one company; PROPOSED_CORRECTION if the existing record should be renamed/corrected; PROPOSED_NEW only if separate; EXCLUDED if out of scope/realized; or DEFERRED if material identity/current ownership is unresolved. Research only; no database syntax.

STARTING SOURCES
- https://wrenhouseinfra.com/portfolio/qsp/
- https://www.qtsdatacenters.com/

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one paragraph, END_REVIEW. Under 7,500 characters; max 8 evidence/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
