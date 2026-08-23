Research one North American infrastructure portfolio-company list reconciliation as of 2026-08-19. Use current web research, open direct pages, and search both acquisitions and later closings/exits. Treat every repository, census and deal claim as unverified.

REQUESTED COMPANY: TransAlta Keephills Data Centre JV
MANAGERS TO RESOLVE: CPP Investments
TASK: ledger:0197:transalta-keephills-data-centre-jv:34a62ae3
CANONICAL KEY: transalta-keephills-data-centre-jv|canada

LEDGER ISSUE TO TEST
{"decisionStatus":"READY_FOR_PROPOSAL","recommendedActions":["ADD_PENDING_TRANSACTION"],"rationale":"The exact normalized project identity is established, but the census treatment may overstate a nonbinding development memorandum as ownership. Verify whether a legal joint venture, investment or definitive transaction exists and whether any later closing occurred.","censusRows":[{"manager":"CPP Investments","holdingId":"032-cpp-investments:holding:017:transalta-keephills-data-centre-jv"}],"repoOnlyRows":[],"repoRows":[{"productionCompanyId":"cmrxpjcn500sxivhe3olj5uf3","seedKey":"transalta keephills data centre jv|Canada","sourcePresence":"BOTH"}],"startingEvidence":["https://transalta.com/newsroom/transalta-enters-memorandum-of-understanding-for-data-centre-development-at-keephills-site-with-potential-to-scale-up-to-1-gw/"]}

CURRENT PRODUCTION SCORECARD SNAPSHOT — VERIFY, DO NOT TRUST
{"id":"cmrxpjcn500sxivhe3olj5uf3","name":"TransAlta Keephills Data Centre JV","country":"Canada","status":"Active","sector":"Digital","subsector":"Powered data-center development","yearFounded":2026,"investmentYear":2026,"headquarters":"Alberta","description":"The repository treats a February 2026 TransAlta memorandum with CPP Investments and Brookfield as an active data-center development joint venture for an initial approximately 230 MW project with potential to scale to 1 GW. Publicly disclosed ownership percentages are absent.","owners":[{"firm":"CPP Investments","vehicle":"Real Assets (Infrastructure)","investmentYear":2026,"stake":"NOT_PUBLICLY_DISCLOSED","isActive":true}],"milestones":[{"date":"Feb 27, 2026","event":"TransAlta announced an MOU with CPP Investments and Brookfield for Keephills data-center development.","category":"Financing"},{"date":"2026","event":"The partners described an initial approximately 230 MW project and potential 1 GW scale.","category":"Expansion"}],"sources":[{"url":"https://transalta.com/newsroom/transalta-enters-memorandum-of-understanding-for-data-centre-development-at-keephills-site-with-potential-to-scale-up-to-1-gw/"}]}

TRANSACTION AND OWNERSHIP QUESTIONS
Determine whether the named “JV” is a legally formed manager-level company/investment or only a proposed project under a memorandum of understanding. Verify whether the MOU is binding, parties' precise roles, project/land/power ownership, development vehicle, stakes, committed equity, conditions, expected definitive agreements and transaction state. Search for a subsequent definitive joint-venture agreement, legal formation, investment/financial close, power agreement, permitting event, customer commitment, cancellation, partner change or transfer through the as-of date. Do not treat an MOU, development plan, capacity target or potential financing as closed ownership. If no definitive equity transaction exists, determine whether the active PortCo row should be excluded/deferred and whether a pending transaction is sufficiently definite to record.

RESEARCH RULES
- Resolve canonical legal/display identity, project entities, aliases, owners and platform/project/SPV boundaries.
- Verify whether CPP Investments, Brookfield and TransAlta are direct equity owners, prospective developers/financiers, or counterparties under a nonbinding MOU.
- Verify every organization, fund/vehicle, stake, announcement date, legal closing date, exit date and transaction state. Do not infer a fund, percentage, committed capital or closing.
- Search through 2026-08-19 for definitive agreement, legal formation, investment close, sale, transfer, power agreement, customer commitment, financing, cancellation and signed pending transactions.
- Verify Keephills geography, planned capacity, development stage, power-supply model, end markets and current status.
- Reopen direct pages. Prefer TransAlta, CPP Investments, Brookfield, Alberta regulatory/government and transaction-party sources. Use NOT_PUBLICLY_DISCLOSED for noncritical gaps and UNRESOLVED only for material identity/current ownership uncertainty.
- Return PROPOSED_CORRECTION, PROPOSED_MERGE, EXCLUDED, VERIFIED_NO_CHANGE or DEFERRED. This is a research packet only; do not propose database syntax or change Deal Database records.

STARTING SOURCES TO REOPEN
- https://transalta.com/newsroom/transalta-enters-memorandum-of-understanding-for-data-centre-development-at-keephills-site-with-potential-to-scale-up-to-1-gw/

Return ordinary plain text only, not a code fence:
BEGIN_JSON
{one complete minified JSON object}
END_JSON
BEGIN_REVIEW
One concise decision paragraph.
END_REVIEW

Keep the response under 7,500 characters, with no more than 8 evidence rows and 4 milestones. Mandatory top-level keys: asOfDate,requestedCompany,requestedManagers,decision,confidence,rationale,identityResolution,ownershipResolution,operatingResolution,acquisitionExitCheck,milestones,evidence,beforeAfterChanges,excludedOrDuplicateCandidates,unresolvedQuestions,recommendedListAction. Owner keys only: manager,organization,fund,vehicle,stake,announcementDate,entryDate,entryYear,exitDate,exitYear,isActive,transactionState. Pending transaction keys only: direction,buyer,seller,stake,announcementDate,closingDate,state,evidenceUrls. Evidence keys only: label,url,purpose,sourceTier,workingStatus,isRecommendedPrimary. Recommend exactly one primary source.
