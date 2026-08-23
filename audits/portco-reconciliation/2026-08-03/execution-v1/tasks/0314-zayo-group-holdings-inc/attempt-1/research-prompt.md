Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Zayo Group Holdings, Inc.
MANAGERS TO RESOLVE: InfraBridge, DigitalBridge and EQT Infrastructure; identify all actual current/former owners and vehicles
TASK: ledger:0314:zayo-group-holdings-inc:46e9b5e3
CANONICAL KEY: not assigned to this repo-only judgment; candidate existing key zayo-group-holdings-inc|united-states-canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"An InfraBridge repo-only judgment names Zayo but says the investment belongs to DigitalBridge's digital strategy, not InfraBridge. The existing canonical Zayo production/seed record and census identify DigitalBridge and EQT Infrastructure. Verify the manager identity and map/supersede this false InfraBridge task without creating a duplicate or adding an InfraBridge owner.","candidateCanonicalCompany":{"name":"Zayo Group Holdings, Inc.","canonicalKey":"zayo-group-holdings-inc|united-states-canada","productionCompanyId":"cmrxpjded00u3ivhegohk21bs","seedKey":"zayo group holdings, inc.|United States / Canada"},"sourceRepoOnlyId":"058-infrabridge:repo-only:014:zayo-group-holdings-inc","sourceHoldingIds":["036-digitalbridge:holding:018:zayo-group","043-eqt-infrastructure:holding:017:zayo-group-holdings-inc"],"startingEvidence":["https://www.digitalbridge.com/portfolio/zayo-group-holdings","https://eqtgroup.com/en/about/current-portfolio/zayo"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Zayo Group Holdings, Inc.","website":null,"country":"United States / Canada","status":"Active","sector":"Digital","subsector":"Fiber networks and bandwidth infrastructure","yearFounded":2007,"headquarters":"North America and Western Europe","investmentYear":2020,"owners":[{"firm":"DigitalBridge","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":null,"investmentYear":2020,"isActive":true},{"firm":"EQT Infrastructure","vehicle":"EQT Infrastructure IV","stake":null,"investmentYear":2020,"isActive":true}],"descriptionClaim":"Digital Colony/DigitalBridge and EQT announced a take-private in May 2019 and completed it March 9, 2020; Zayo later announced business carve-outs and an acquisition of Crown Castle's fiber business."}

IDENTITY, OWNERSHIP AND MANAGER-ALIAS QUESTIONS
Resolve Zayo's exact legal/canonical identity and any regional/carve-out structure. Reconstruct the 2019 agreement and March 2020 take-private: purchaser entities, DigitalBridge/Digital Colony and EQT funds/vehicles, stakes/control, sellers and current status. Search through the cutoff for sponsor sell-downs, continuation vehicles, recapitalizations, ownership changes, exits and signed pending transactions. Resolve the 2024 announced business carve-outs and 2025 Crown Castle Fiber transaction only insofar as they change Zayo's canonical boundary or current ownership; do not treat acquired fiber assets or regional units as separate manager-level PortCos. Independently test whether InfraBridge, AMP Capital or an InfraBridge-managed fund ever owned Zayo; do not confuse InfraBridge with DigitalBridge because both names contain “Bridge.” Determine whether the existing canonical record needs correction or can remain unchanged, then recommend superseding this repo-only task into that company if no InfraBridge holding exists.

RESEARCH RULES
- Never treat InfraBridge and DigitalBridge as aliases; require direct transaction/portfolio evidence for either manager.
- Do not create another Zayo company or add InfraBridge ownership from this repo-only parsing judgment.
- Require direct evidence for current ownership, fund/vehicle, stake, entry/closing date and exit search. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Zayo, DigitalBridge, EQT, SEC/regulatory materials and InfraBridge's official portfolio. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, SUPERSEDED, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.digitalbridge.com/portfolio/zayo-group-holdings
- https://eqtgroup.com/en/about/current-portfolio/zayo
- https://www.zayo.com/newsroom/zayo-announces-definitive-agreement-to-be-acquired-by-digital-colony-and-eqt/
- https://eqtgroup.com/news/eqt-and-digital-colony-complete-acquisition-of-zayo
- https://infrabridge.com/portfolio/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
