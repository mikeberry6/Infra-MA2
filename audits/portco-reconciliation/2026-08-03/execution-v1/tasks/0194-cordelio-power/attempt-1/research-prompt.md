Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: Cordelio Power
MANAGERS TO RESOLVE: CPP Investments
TASK: ledger:0194:cordelio-power:08aa08d8
CANONICAL KEY: NOT_ASSIGNED_IN_LEDGER

LEDGER ISSUE TO TEST
{"decisionStatus":"NEEDS_REVIEW","queueKind":"REPO_ONLY_JUDGMENT","recommendedActions":[],"rationale":"The accepted CPP Investments repo-only judgment says Cordelio Power was consolidated beneath Pattern Energy after Pattern completed its acquisition. The captured production/evaluated-seed snapshots had no matching Cordelio record, although the current repository seed now contains one. Prove the canonical boundary and whether a company record should exist before any consolidation or correction.","censusRows":[],"repoOnlyRows":[{"manager":"CPP Investments","disposition":"MATCHED_ELSEWHERE","rationale":"Consolidated beneath Pattern Energy following completion of Pattern Energy's acquisition of Cordelio Power."}],"repoRows":[],"startingEvidence":["https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/","https://www.cppinvestments.com/public-media/headlines/2020/cpp-investments-completes-acquisition-of-pattern-energy-group/"]}

CURRENT REPOSITORY SEED CLAIM — VERIFY, DO NOT TRUST
{"name":"Cordelio Power","country":"United States / Canada","status":"Active","sector":"Power & ET","subsector":"Wind, solar, and energy storage","yearFounded":2018,"investmentYear":2018,"headquarters":"New York; Illinois; Oregon; Ontario; British Columbia","description":"The current seed describes Cordelio as a renewable-power developer/operator formerly wholly owned by CPP Investments. It says Pattern Energy completed its acquisition in April 2026 and that Cordelio sold a 6 GW BrightNight joint-venture interest on April 22, 2026, but still leaves CPP Investments shown as the active direct owner.","owners":[{"firm":"CPP Investments","vehicle":"n.a.","investmentYear":2018,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"Jun 29, 2018","event":"CPP Investments completed a Canadian renewable portfolio acquisition through Cordelio.","category":"Acquisition"},{"date":"Jan 6, 2026","event":"Pattern and Cordelio announced a definitive acquisition agreement.","category":"Acquisition"},{"date":"Apr 2026","event":"Pattern completed the acquisition of Cordelio.","category":"Acquisition"},{"date":"Apr 22, 2026","event":"Cordelio sold its 6 GW BrightNight joint-venture interest.","category":"Divestiture"}],"sources":[{"url":"https://cordeliopower.com/"},{"url":"https://cordeliopower.com/pattern_energy_announces_agreement_to_acquire_cordelio_power/"},{"url":"https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/"},{"url":"https://www.cppinvestments.com/public-media/headlines/2020/cpp-investments-completes-acquisition-of-pattern-energy-group/"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Verify Cordelio's legal identity, current operating brand and relationship to Pattern Energy after the announced acquisition. Establish the exact legal closing date and whether Cordelio remained a separately operated subsidiary/platform, merged legally, or ceased to be a manager-level PortCo. Resolve whether CPP Investments' prior direct Cordelio ownership ended at closing, continued indirectly through Pattern, or was only an internal reorganization among CPP-backed companies; identify Riverstone or other relevant Pattern co-owners only when directly supported. Determine whether the BrightNight joint-venture sale closed before or after the Pattern transaction and whether it was a partial asset sale rather than a Cordelio exit. Search for subsequent sale, rebrand, dissolution, management change, financing or pending ownership transaction through the as-of date.

RESEARCH RULES
- Resolve canonical legal/display identity, aliases, current/former owners and parent/subsidiary/platform boundaries.
- Decide whether Cordelio should be one canonical company subordinate to Pattern, a preserved legal subsidiary/alias, a separate active platform, or an excluded duplicate.
- Verify every direct owner, organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Distinguish direct ownership from indirect exposure through Pattern.
- Search through 2026-08-19 for acquisition close, sale, transfer, asset divestiture, financing, dissolution, rebrand and signed pending transactions.
- Verify operating footprint, owned/operated/development scale, products/end markets and current status after closing.
- Reopen direct pages. Prefer Cordelio, Pattern Energy, CPP Investments, Riverstone, BrightNight and transaction/regulatory sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://patternenergy.com/pattern-energy-announces-completion-of-acquisition-of-cordelio-power/
- https://cordeliopower.com/pattern_energy_announces_agreement_to_acquire_cordelio_power/
- https://www.cppinvestments.com/public-media/headlines/2020/cpp-investments-completes-acquisition-of-pattern-energy-group/
- https://www.prnewswire.com/news-releases/brightnight-acquires-cordelio-powers-joint-venture-interest-adds-6-gw-to-its-independently-controlled-project-portfolio-302747628.html

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
