Research one North American infrastructure portfolio-company reconciliation as of 2026-08-19 using current direct sources and acquisition/exit searches. Treat every repo claim as unverified.

REQUESTED COMPANY: Skyservice US
REQUESTED MANAGER: Instar Asset Management / InstarAGF
TASK: ledger:0492:skyservice-us:444ae080
LINKED DUPLICATE TASK TO COVER: ledger:0493:skyservice-us-formerly-leading-edge-jet-center:49066c79 (Skyservice US (formerly Leading Edge Jet Center))
CANONICAL KEYS: skyservice-us|united-states and skyservice-us-formerly-leading-edge-jet-center|united-states

The repository carries two U.S. records: `Skyservice US` and `Skyservice US (formerly Leading Edge Jet Center)`. Determine whether they are the same operating business and whether either should instead be treated only as the U.S. operations beneath the broader Canadian parent `Skyservice Business Aviation Inc.`. Trace Leading Edge Jet Center's formation, Instar's acquisition or sponsorship, its integration/rebrand into Skyservice, and the exact manager-level company boundary. Do not count individual FBO locations, airport leases, hangars, Kenmore Aero Services, Helena Aviation Services, or later greenfield sites as separate PortCos unless direct evidence establishes a separate manager-held platform.

Establish current ownership through 2026-08-19. Distinguish Instar's September 2017 majority investment in Canadian parent Skyservice from its reported 2019 U.S. platform investment. Verify whether Skyservice US/Leading Edge was directly owned by Instar, acquired by Skyservice, or both at different times; identify the owning fund or vehicle only when directly supported. Do not infer a manager-level stake from a parent-level majority disclosure. Search explicitly for later sales, recapitalizations, sponsor exits, ownership transfers, and signed pending transactions. Determine whether any later rebrand or integration retired the U.S. company as a standalone PortCo while leaving its operations active beneath Skyservice.

Current repo claims to verify:
- `Skyservice US`: founded 2005 through predecessor Leading Edge Jet Center; Instar entry in 2019; active; exact ownership percentage not disclosed; U.S. FBO and aviation-services footprint in Washington, Oregon and Montana; four locations rebranded under Skyservice in November 2021.
- `Skyservice US (formerly Leading Edge Jet Center)`: the same 2005 predecessor and 2019 Instar investment, plus a claimed August 2019 standalone formation, September 2020 Kenmore FBO acquisition and January 2021 Helena Aviation Services acquisition.
- `Skyservice Business Aviation Inc.` is separately carried as the Canadian parent/platform with an InstarAGF Essential Infrastructure Fund majority investment in September 2017.

Prefer current Skyservice, Instar/InstarAGF, airport/regulatory filings, transaction releases and other direct sources. Return PROPOSED_MERGE if the two U.S. records are the same manager-level company; PROPOSED_MERGE with an explicit parent mapping if both U.S. records belong beneath the broader Skyservice company; PROPOSED_CORRECTION if a separate U.S. PortCo remains but material facts are wrong; VERIFIED_NO_CHANGE only if two separate manager-level U.S. companies are independently supported; EXCLUDED if the U.S. record is not a direct infrastructure holding; or DEFERRED if identity/current ownership is unresolved. Cover both task IDs in the identity and recommended-action rationale. Research only; no database syntax.

STARTING SOURCES
- https://www.ainonline.com/aviation-news/business-aviation/2021-11-10/canadas-skyservice-expands-us
- https://www.globenewswire.com/news-release/2020/09/29/2100789/0/en/Leading-Edge-Jet-Center-Expands-its-Business-Aviation-Footprint.html
- https://www.corporatejetinvestor.com/news/skyservice-business-aviation-expands-to-the-united-states/
- https://instarinvest.com/assets/files/strategy/Instar-Fact-Sheet-Q3-2025.pdf
- https://www.skyservice.com/

Return plain text with BEGIN_JSON, one minified JSON object, END_JSON, BEGIN_REVIEW, one paragraph, END_REVIEW. Under 7,500 characters; max 8 evidence/4 milestones. Mandatory keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Exactly one primary.
