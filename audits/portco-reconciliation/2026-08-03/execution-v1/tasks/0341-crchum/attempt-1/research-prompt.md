Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: CRCHUM
MANAGERS TO RESOLVE: Meridiam; identify all consortium members, lenders only when relevant, and every current/former direct equity owner
TASK: ledger:0341:crchum:38aca414
CANONICAL KEY: crchum|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","recommendedActions":[],"rationale":"The census matched CRCHUM while the repository contains a second published record named Montreal University Hospital Research Center (CRCHUM). Establish the one canonical PPP asset and exact keep/merge boundary before any correction.","productionCompanyIds":["cmrxpjl0x015rivhelfa10iff"],"seedKeys":["crchum|Canada"],"reciprocalTask":"ledger:0342:montreal-university-hospital-research-center-crchum:8cde81e2","startingEvidence":["https://www.meridiam.com/assets/montreal-university-hospital-research-center-crchum-canada/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
Two records appear to describe the same Centre hospitalier de l'Universite de Montreal research-centre PPP in Montreal: "CRCHUM" and "Montreal University Hospital Research Center (CRCHUM)." Determine the correct public/canonical English or French name, legal project-company identity, aliases, asset boundary, Meridiam ownership and whether one record can safely absorb the other. Treat task 342 as a potential reciprocal duplicate that may be superseded only if this research fully covers its identity and ownership judgment.

IDENTITY, PPP AND OWNERSHIP QUESTIONS
Resolve the distinction among CHUM, CRCHUM, Centre de recherche du CHUM, the hospital/research facility, project company, concessionaire and operating/maintenance counterparties. Reconstruct procurement, financial close, construction completion, opening, concession term, any refinancing and every ownership transfer. Identify Meridiam's exact fund/vehicle, consortium partners, stake, announcement/financial close dates, current ownership and any exit. Do not count lenders, contractors, facilities managers, public authorities or the broader hospital system as direct equity owners. Determine whether the current portfolio label proves ongoing ownership or merely legacy participation.

Search through the cutoff for later sales, refinancings, concession changes, restructurings, termination, signed transfers or exits. Verify location, facility function, concession/availability-payment structure, infrastructure-strategy basis, scale and current operating status. Count one manager-level PPP asset; exclude the hospital institution, project-company subsidiaries and duplicate English/French labels.

RESEARCH RULES
- Resolve canonical identity, legal entity and all aliases; explicitly decide whether the two repository records are the same asset and which should be canonical.
- Verify current/former direct owners, funds/vehicles, stakes, announcement/financial-close/entry/exit dates and transaction state.
- Search through 2026-08-19 for later ownership transfers, exits and signed pending transactions.
- Reopen direct pages. Prefer Meridiam, Quebec/CHUM procurement or financial records, project-company, regulatory and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED for material identity or current-ownership uncertainty.
- Return PROPOSED_MERGE if one canonical record should absorb the duplicate, PROPOSED_CORRECTION if the duplicate is handled elsewhere but this record needs changes, VERIFIED_NO_CHANGE only if the record is already correct and no duplicate remains, EXCLUDED if it is not an eligible manager-level infrastructure holding, or DEFERRED if identity/current ownership remains unresolved. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.meridiam.com/assets/montreal-university-hospital-research-center-crchum-canada/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
