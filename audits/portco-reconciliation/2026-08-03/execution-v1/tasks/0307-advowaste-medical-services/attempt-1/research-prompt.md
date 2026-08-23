Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: AdvoWaste Medical Services
MANAGER TO RESOLVE: Igneo Infrastructure Partners; also resolve Cyntox Biohazard Solutions and the combined medical-waste platform
TASK: ledger:0307:advowaste-medical-services:42ae6d6b
CANONICAL KEY: advowaste-medical-services|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The Igneo census proposed AdvoWaste as a new company from a July 2026 release announcing simultaneous acquisitions of AdvoWaste and Cyntox to form one medical-waste platform. Igneo's current portfolio appears to present the combined platform under Cyntox Biohazard Solutions. Determine whether AdvoWaste is a separate manager-level PortCo or a constituent/brand that should be mapped beneath one Cyntox canonical company.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"056-igneo-infrastructure-partners:holding:001:advowaste-medical-services","relatedQueueTask":"ledger:0309:cyntox-biohazard-solutions:1dc97c03","startingEvidence":["https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"AdvoWaste Medical Services","website":null,"country":"United States","status":"Active","sector":"Utilities","subsector":"Regulated medical waste management","headquarters":null,"investmentYear":2026,"owners":[{"firm":"Igneo Infrastructure Partners","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2026,"isActive":true}],"description":"Igneo announced acquisitions of AdvoWaste and Cyntox on July 14, 2026 to form a new integrated medical-waste platform."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve AdvoWaste's exact legal/trade identity, pre-acquisition owners and operating footprint. Reconstruct Igneo's acquisition: agreement versus legal closing date, exact fund/vehicle, stake/control and transaction state. Determine the post-transaction legal and operating structure—whether AdvoWaste and Cyntox remain separately owned sister companies, were merged legally, operate as brands/divisions, or form a single manager-level platform using Cyntox as the public canonical name. Review Igneo's current portfolio wording, company sites, corporate/state records and leadership announcements. Apply one-company platform boundaries: do not create two PortCos merely because two add-on companies were acquired simultaneously when the manager presents them as one integrated platform. Search through the cutoff for integration/renaming, add-ons, ownership changes, exits and signed pending transactions. Cross-reference task 309 so whichever task establishes the canonical combined platform can supersede the duplicate task without losing AdvoWaste as an alias, subsidiary/brand or acquisition milestone.

RESEARCH RULES
- Count one manager-level platform. Include AdvoWaste separately only if direct evidence proves it remains an independently managed fund investment rather than a constituent of the combined Cyntox platform.
- Require direct evidence for announcement/closing state, Igneo fund/vehicle, stake/control and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Preserve acquired-company history through aliases/subsidiaries and a milestone when consolidating; do not erase AdvoWaste's identity.
- Search through 2026-08-19 for integration, owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Igneo, AdvoWaste, Cyntox, corporate records and transaction releases. Use UNRESOLVED for material platform identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, SUPERSEDED, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html
- https://www.igneoip.com/usa/en/institutional/our-offering/assets.html
- https://advowastemedical.com/
- https://cyntox.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
