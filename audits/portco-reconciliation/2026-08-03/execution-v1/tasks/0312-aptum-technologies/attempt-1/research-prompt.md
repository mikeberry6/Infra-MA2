Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository and census claim as unverified.

REQUESTED COMPANY: Aptum Technologies
MANAGERS TO RESOLVE: InfraBridge and DigitalBridge; identify all actual current/former owners and vehicles
TASK: ledger:0312:aptum-technologies:d1225fa3
CANONICAL KEY: not assigned to this repo-only judgment; candidate existing key aptum-technologies|united-states-canada

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","rationale":"An InfraBridge repo-only judgment names Aptum but says the investment belongs to DigitalBridge's digital strategy, not InfraBridge. The existing canonical Aptum Technologies production/seed record is linked to the DigitalBridge census. Verify the manager identity and map/supersede this false InfraBridge task without creating a duplicate or adding an InfraBridge owner.","candidateCanonicalCompany":{"name":"Aptum Technologies","canonicalKey":"aptum-technologies|united-states-canada","productionCompanyId":"cmrxpjd7s00trivhew4m5dmlk","seedKey":"aptum technologies|United States / Canada"},"sourceRepoOnlyId":"058-infrabridge:repo-only:001:aptum-technologies","digitalBridgeHoldingId":"036-digitalbridge:holding:001:aptum-technologies","startingEvidence":["https://www.digitalbridge.com/portfolio/aptum-technologies/","https://www.globenewswire.com/news-release/2019/05/01/1813583/0/en/Cogeco-Communications-Inc-Announces-the-Completion-of-the-Sale-of-Cogeco-Peer-1-to-Digital-Colony.html"]}

CURRENT REPOSITORY SNAPSHOT — VERIFY, DO NOT TRUST
{"name":"Aptum Technologies","formerNames":["Cogeco Peer 1","Peer 1 Hosting"],"website":null,"country":"United States / Canada","status":"Active","sector":"Digital","subsector":"Data centers, cloud, and managed infrastructure","yearFounded":1996,"headquarters":"Ontario; multiple North American markets; United Kingdom","investmentYear":2019,"owners":[{"firm":"DigitalBridge","vehicle":"NOT_PUBLICLY_DISCLOSED","stake":null,"investmentYear":2019,"isActive":true}],"managerConflict":"A seed headline field says InfraBridge even though its owner row and source evidence say DigitalBridge."}

IDENTITY, OWNERSHIP AND MANAGER-ALIAS QUESTIONS
Resolve Aptum's exact legal/canonical identity and predecessor chain from Peer 1/Cogeco Peer 1. Reconstruct Digital Colony/DigitalBridge's 2019 acquisition: agreement and legal closing date, fund/vehicle, stake/control, seller and current status. Search for any later recapitalization, partial sale, owner change, exit or signed pending transaction through the cutoff. Independently test whether InfraBridge, AMP Capital or any InfraBridge-managed fund ever owned Aptum; do not confuse InfraBridge with DigitalBridge because both names contain “Bridge.” Determine whether the existing canonical record needs a manager/headline correction or merely verification. Verify platform boundary and footprint, distinguishing Aptum from Beanfield's acquisition of Aptum's Canadian metro-fiber network, CloudOps, individual data centers and managed-service subsidiaries. Recommend that this queue task be superseded/mapped to the existing Aptum canonical company when no independent InfraBridge holding exists.

RESEARCH RULES
- Never treat InfraBridge and DigitalBridge as aliases; require direct transaction/portfolio evidence for either manager.
- Do not create another Aptum company or add InfraBridge ownership from this repo-only parsing judgment.
- Require direct evidence for current ownership, fund/vehicle, stake, entry/closing date and exit search. Use NOT_PUBLICLY_DISCLOSED rather than inference.
- Search through 2026-08-19 for later owner changes, exits and signed pending transactions.
- Reopen direct pages and filings. Prefer Aptum, DigitalBridge, Cogeco, transaction filings and InfraBridge's official portfolio. Use UNRESOLVED for material identity or current ownership; either blocks application.
- Return PROPOSED_CORRECTION, VERIFIED_NO_CHANGE, SUPERSEDED, EXCLUDED or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://www.digitalbridge.com/portfolio/aptum-technologies/
- https://www.globenewswire.com/news-release/2019/05/01/1813583/0/en/Cogeco-Communications-Inc-Announces-the-Completion-of-the-Sale-of-Cogeco-Peer-1-to-Digital-Colony.html
- https://aptum.com/our-story/
- https://infrabridge.com/portfolio/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
