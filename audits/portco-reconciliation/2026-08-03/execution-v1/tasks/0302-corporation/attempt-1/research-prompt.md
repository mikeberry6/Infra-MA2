Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Corporation
MANAGER TO RESOLVE: IFM Investors; also resolve Ontario Teachers' Pension Plan as co-owner where supported
TASK: ledger:0302:corporation:ac485f35
CANONICAL KEY: not assigned

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"A malformed repo-only record named Corporation appears to duplicate the existing canonical Enwave Energy company because it uses the same IFM/OTPP Canadian district-energy acquisition sources. Verify that mapping and determine whether the malformed row should be superseded without creating, merging or changing any real company record.","productionCompanyId":null,"seedKey":null,"sourceRepoOnlyId":"055-ifm-investors:repo-only:001:corporation","candidateCanonicalCompany":{"name":"Enwave Energy","canonicalKey":"enwave-energy|canada","productionCompanyId":"cmrxpjiln011zivheeuse5tr6","seedKey":"enwave energy|Canada"},"startingEvidence":["https://www.ifminvestors.com/capabilities/infrastructure/our-portfolio/enwave/","https://www.ifminvestors.com/news-and-insights/media-centre/ifm-investors-and-ontario-teachers-pension-plan-board-jointly-acquire-canadian-district-energy-operations-owned-by-enwave-energy-corporation/"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"malformedRecord":{"name":"Corporation","country":"United States","canonicalKey":null,"productionCompanyId":null,"seedKey":null},"candidateExistingCompany":{"name":"Enwave Energy","legalNameClaim":"Enwave Energy Corporation","country":"Canada","sector":"Utilities","subsector":"District energy systems","status":"Active","website":null,"yearFounded":1990,"headquarters":"Ontario","investmentYear":2021,"owners":[{"firm":"IFM Investors","vehicle":"n.a.","stake":null,"investmentYear":2021,"isActive":true},{"firm":"Ontario Teachers' Pension Plan","vehicle":"n.a.","stake":null,"investmentYear":2021,"isActive":true}],"descriptionClaim":"IFM Investors and Ontario Teachers' jointly acquired Enwave's Canadian district-energy business in 2021 and each own 50%."}}

IDENTITY, OWNERSHIP AND DUPLICATE QUESTIONS
Determine whether the source phrase ending in “Enwave Energy Corporation” was incorrectly parsed into the standalone name “Corporation,” and whether every fact/evidence item attributed to that malformed record belongs to the existing canonical Enwave Energy company. Verify the canonical/legal identity and boundary of Enwave Energy, distinguishing its Canadian district-energy operations from Enwave's U.S. business sold separately to QIC and Ullico and from projects/subsidiaries. Reconstruct IFM and Ontario Teachers' announcement and legal closing dates, exact stake, fund/vehicle if publicly disclosed, seller and current ownership through the cutoff. Search for later recapitalizations, owner changes, exits, signed pending transactions and any current manager portfolio confirmation. Determine whether any independent U.S. company actually named “Corporation” is supported by the cited evidence; do not preserve the malformed geography or identity without direct evidence. Recommend superseding the malformed queue task into the existing Enwave canonical record when proved, and state whether the existing Enwave list record itself needs a correction or can remain unchanged.

RESEARCH RULES
- Do not create or merge a company merely to dispose of a parsing artifact; prefer SUPERSEDED/MATCHED_ELSEWHERE when the malformed row has no independent identity.
- Require direct evidence for the Enwave canonical identity, Canadian business boundary, IFM/OTPP stakes, announcement/closing dates and current status. Use NOT_PUBLICLY_DISCLOSED rather than inference for funds or vehicles.
- Distinguish the Canadian Enwave business from the separately sold U.S. district-energy business, individual systems, projects and financing vehicles.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Enwave, IFM, Ontario Teachers', Brookfield, regulatory/competition materials and transaction releases. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE, SUPERSEDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.ifminvestors.com/capabilities/infrastructure/our-portfolio/enwave/
- https://www.ifminvestors.com/news-and-insights/media-centre/ifm-investors-and-ontario-teachers-pension-plan-board-jointly-acquire-canadian-district-energy-operations-owned-by-enwave-energy-corporation/
- https://www.enwave.com/about
- https://www.otpp.com/en-ca/about-us/news-and-insights/2021/enwave-s-new-owners-ignite-next-era-of-growth-for-canadian-sustainable-energy-company/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
