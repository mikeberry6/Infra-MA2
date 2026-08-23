Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search acquisitions and later closings/exits. Treat every repo and census claim as unverified.

REQUESTED COMPANY: TeraWatt Infrastructure
REQUESTED MANAGERS: Vision Ridge Partners; also verify Keyframe Capital and Cyrus Capital Partners
TASK: ledger:0452:terawatt-infrastructure:facb72c6
CANONICAL KEY: terawatt-infrastructure|united-states

LEDGER ISSUE TO TEST
The company already exists in the repository, but the Vision Ridge census queues ADD_OWNER. Verify whether Vision Ridge is already represented under an alias, whether its 2022 participation was direct equity in TeraWatt, and the complete current owner table. Do not duplicate an existing owner.

Reconstruct TeraWatt's formation, 2022 $1bn funding, exact investors/funds/vehicles, stakes or disclosure limitations, investment/closing dates, and later ownership changes through 2026-08-19. Confirm its fleet-charging infrastructure model, owned/developed site boundary, current operations, headquarters, website and North American footprint. Search for exits, recapitalizations and signed pending transactions. Distinguish the company from charging-site projects and customers.

Require direct current ownership evidence and manager infrastructure/climate-infrastructure mandate. Prefer TeraWatt, Vision Ridge, co-investors, filings and financing sources. Return PROPOSED_CORRECTION if the existing owner/fields need correction, VERIFIED_NO_CHANGE if Vision Ridge is already correctly represented, EXCLUDED if the exposure is out of scope or realized, PROPOSED_MERGE if a duplicate is proven, or DEFERRED if active ownership remains unresolved. This is research only; no database syntax or Deal Database changes.

STARTING SOURCES
- https://terawattinfrastructure.com/
- https://www.businesswire.com/news/home/20220510005388/en/TeraWatt-Infrastructure-Raises-1-Billion

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one concise paragraph, END_REVIEW. Keep under 7,500 characters and at most 8 evidence rows/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
