Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Andion Global
MANAGER TO RESOLVE: Equitix
TASK: ledger:0237:andion-global:05d3742d
QUEUE TYPE: Repo-only out-of-scope judgment; no production or seed company exists

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"A manager review judged Andion Global out of the North American census after its corporate migration from Canada to Luxembourg and strategic repositioning. Confirm whether the company, the manager ownership, or only this census geography is out of scope.","productionCompanyIds":[],"seedKeys":[],"startingEvidence":["https://www.gsk-lux.com/en/gsk-stockmann-advises-andion-ch4-renewables-on-the-first-capital-raise-after-its-migration-from-canada-to-luxembourg/"]}

IDENTITY, OWNERSHIP AND GEOGRAPHY QUESTIONS
Resolve Andion Global's canonical legal/display identity, aliases, predecessor/successor names and current domicile/headquarters. Reconstruct Equitix's investment: exact investing organization/fund/vehicle, transaction type, stake/control, announcement and legal closing dates, co-investors, and whether Equitix remains a current direct equity owner. Trace the migration from Canada to Luxembourg and any reorganization as Andion CH4 Renewables or another identity. Determine the current operating/development footprint by country and whether the manager-level company is primarily based in or dedicated to the United States, Canada or Mexico under the census definition—not merely whether it owns one North American project. Search through the as-of date for capital raises, recapitalization, sale, owner transfer, Equitix exit, portfolio removal or signed pending transaction. Distinguish underlying biogas/RNG projects from the platform and do not create separate PortCos for projects.

DECISION STANDARD
- EXCLUDED if the current manager-level company is no longer primarily based in or dedicated to the United States, Canada or Mexico, even if it retains individual North American projects.
- PROPOSED_NEW only if direct evidence establishes a qualifying current North American manager-level platform plus current Equitix ownership.
- PROPOSED_CORRECTION if the repo-only judgment needs a different identity, owner or geographic rationale.
- DEFERRED only if material identity/current ownership/geographic qualification remains unresolved after exhaustive search.

RESEARCH RULES
- Verify every manager, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer percentages or closing.
- Search through 2026-08-19 for migration, reorganization, capital raise, sale, transfer, recapitalization, refinancing, merger, rebrand, portfolio removal and signed pending transactions.
- Verify official website/status, domicile, headquarters, founding year, products/services, customers/end markets, project footprint and disclosed scale.
- Reopen direct pages. Prefer Andion, Equitix, Luxembourg/Canadian registries or filings, investor and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership/geographic uncertainty.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCE TO REOPEN
- https://www.gsk-lux.com/en/gsk-stockmann-advises-andion-ch4-renewables-on-the-first-capital-raise-after-its-migration-from-canada-to-luxembourg/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
