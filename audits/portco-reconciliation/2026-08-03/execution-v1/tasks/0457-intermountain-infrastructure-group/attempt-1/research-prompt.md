Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19 using current direct web sources and acquisition/exit searches. Treat the census as unverified.

REQUESTED COMPANY: Intermountain Infrastructure Group
REQUESTED MANAGERS: Wafra and Post Road Group
TASK: ledger:0457:intermountain-infrastructure-group:66d1e5b0
CANONICAL KEY: intermountain-infrastructure-group|canada

The census proposes a new Wafra-owned company and labels the geography Canada/United States. Reconstruct the February 2023 partnership: canonical legal company, sellers/founders, Wafra and Post Road funds/vehicles, stakes/control, announcement/closing date and current owner table. Verify whether IIG owns fiber routes/conduit/dark-fiber infrastructure or is a development/services business; identify routes, miles, markets and cross-border footprint only where sourced. Resolve whether Canada is truly primary/dedicated or merely part of a U.S. network. Keep routes/projects beneath one platform. Search through 2026-08-19 for financings, ownership transfers, exits and pending transactions.

Prefer IIG, Wafra, Post Road, permitting/regulatory, lender and transaction-party sources. Return PROPOSED_NEW only with resolved current in-scope ownership/geography; PROPOSED_CORRECTION if canonical country/name differs or maps elsewhere; EXCLUDED if out of scope/realized; PROPOSED_MERGE for a duplicate; or DEFERRED for material uncertainty. Research only; no database syntax.

STARTING SOURCES
- https://www.businesswire.com/news/home/20230222005338/en/Wafra-and-Post-Road-Form-Partnership-with-Intermountain-Infrastructure-Group
- https://www.wafra.com/our-people/michael-coleman-2/

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one concise paragraph, END_REVIEW. Keep under 7,500 characters and at most 8 evidence rows/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
