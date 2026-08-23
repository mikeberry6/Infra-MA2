Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Cyntox Biohazard Solutions
MANAGER TO RESOLVE: Igneo Infrastructure Partners; also resolve AdvoWaste Medical Services and the combined medical-waste platform
TASK: ledger:0309:cyntox-biohazard-solutions:1dc97c03
CANONICAL KEY: cyntox-biohazard-solutions|united-states

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","rationale":"The Igneo census proposed Cyntox as a new company from a July 2026 release announcing acquisitions of Cyntox and AdvoWaste to form one medical-waste platform. Igneo's current portfolio appears to present that combined platform under Cyntox Biohazard Solutions. Verify the canonical platform identity and ensure related task 307 for AdvoWaste does not create a duplicate.","productionCompanyId":null,"seedKey":null,"sourceHoldingId":"056-igneo-infrastructure-partners:holding:002:cyntox-biohazard-solutions","relatedQueueTask":"ledger:0307:advowaste-medical-services:42ae6d6b","startingEvidence":["https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html"]}

CURRENT CENSUS SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Cyntox Biohazard Solutions","website":"https://cyntox.com/","country":"United States","status":"Active","sector":"Utilities","subsector":"Regulated medical waste management","headquarters":null,"investmentYear":2026,"owners":[{"firm":"Igneo Infrastructure Partners","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":"NOT_PUBLICLY_DISCLOSED","investmentYear":2026,"isActive":true}],"descriptionClaim":"Igneo announced acquisitions of Cyntox and AdvoWaste on July 14, 2026 to form an integrated collection, treatment and disposal platform; Igneo's live portfolio presents the combined investment under Cyntox Biohazard Solutions."}

IDENTITY, OWNERSHIP AND PLATFORM QUESTIONS
Resolve Cyntox's exact legal/trade identity, predecessor ownership and operating footprint. Reconstruct Igneo's acquisition: agreement versus legal closing date, exact fund/vehicle, stake/control, sellers, rollover ownership and transaction state. Determine the post-transaction legal and operating structure—whether Cyntox is the canonical name for the combined platform, whether a new holdco or brand exists, and how AdvoWaste is retained as a subsidiary, brand or sister company. Review Igneo's live portfolio wording, company sites, corporate/state records and leadership announcements. Verify the combined platform's services, treatment facilities, collection footprint, states served, customers/end markets, headquarters and management. Search through the cutoff for integration/renaming, add-ons, ownership changes, exits and signed pending transactions. Define exactly one manager-level PortCo; retain the acquired companies as aliases/subsidiaries/milestones as supported and cross-reference task 307 as superseded if Cyntox is the canonical platform.

RESEARCH RULES
- Recommend one combined manager-level platform. Do not create separate Cyntox and AdvoWaste PortCos unless direct evidence proves independently managed fund investments.
- Require direct evidence for canonical/platform identity, announcement/closing state, Igneo fund/vehicle, stake/control and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Preserve acquired-company history through aliases/subsidiaries and milestones; do not erase AdvoWaste's identity.
- Search through 2026-08-19 for integration, owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Igneo, Cyntox, AdvoWaste, corporate records and transaction releases. Use UNRESOLVED for material platform identity or current ownership; either blocks application.
- Return PROPOSED_NEW, PROPOSED_CORRECTION, PROPOSED_MERGE, SUPERSEDED, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.igneoip.com/usa/en/institutional/news-and-insights/press/igneo-acquires-two-us-medical-waste-management-businesses.html
- https://www.igneoip.com/usa/en/institutional/our-offering/assets.html
- https://cyntox.com/
- https://advowastemedical.com/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
