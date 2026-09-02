Research one previously deferred North American infrastructure portfolio-company decision as of **{{ADJUDICATION_AS_OF_DATE}}**. This is a focused adjudication, not a full company census or scorecard refresh.

TASK: {{TASK_ID}}
SOURCE SEQUENCE: {{TASK_INDEX}}
REQUESTED COMPANY: {{COMPANY_NAME}}
CANONICAL KEY: {{CANONICAL_KEY_OR_NULL}}
APPLICABLE MANAGERS: {{MANAGERS}}

RECORDED MATERIAL BLOCKER
{{EXCEPTION_REASON}}

CURRENT PRODUCTION AND SEED CLAIMS
{{CURRENT_TARGET_AND_DEPENDENCY_SNAPSHOT}}

PRIOR RESEARCH TO REOPEN, NOT TRUST
{{PRIOR_RESEARCH_SUMMARY_AND_HASHES}}

RECIPROCAL OR SAME-COMPANY TASKS
{{RECIPROCAL_TASK_CONTEXT_OR_NONE}}

## Required research

- Open current direct pages and resolve only the recorded blocker: canonical identity, company boundary, current legal ownership, ownership continuity, closing, exit, or the exact missing cap-table fact.
- Reopen the strongest prior primary sources and search for later acquisitions, closings, exits, secondaries, restructurings, bankruptcies, filings and current owner disclosures through the adjudication date.
- Prefer official company, manager, regulatory, government, court and filing sources. Use reliable secondary sources only when primary evidence is unavailable.
- Do not rely on search-result snippets, portfolio-page omission, a dead website or the absence of an exit announcement as proof of current ownership or realization.
- Keep subsidiaries, projects, facilities and SPVs beneath the manager-level platform unless direct evidence establishes a separate investment boundary.
- Signed but unclosed transactions remain pending. Keep the incumbent legal owner active until closing is directly evidenced.
- Use `NOT_PUBLICLY_DISCLOSED` for noncritical gaps. Use `UNRESOLVED` only when canonical identity or active ownership remains materially uncertain.
- Never invent a fund, vehicle, stake, date, owner, co-investor or transaction state.
- If the exact blocker remains unavailable after this focused pass, return `DEFERRED` with the precise missing fact, searches performed and strongest contrary or incomplete evidence.

## Decision contract

Return one of:

- `PROPOSED_MUTATION` — the blocker is resolved and an exact create, correction, merge, redirect, ownership retirement or pending-transaction after-image is supportable.
- `EXCLUDED` — direct evidence resolves the record as out of scope.
- `SUPERSEDED` — direct evidence resolves the task as the same canonical company as an identified target.
- `VERIFIED_NO_CHANGE` — the current production and seed representation is directly supported.
- `DEFERRED` — the material identity or active-ownership blocker remains genuinely unresolved.

Every non-deferred decision must identify exactly one canonical company boundary, every current direct owner relevant to the decision, the transaction state, and one recommended primary citation. Every evidence URL must be a direct HTTPS page that was opened during this adjudication.

## Transport contract

Do not use a code fence, canvas or attachment. Return ordinary plain text between these markers:

BEGIN_JSON
{"asOfDate":"{{ADJUDICATION_AS_OF_DATE}}","taskId":"{{TASK_ID}}","requestedCompany":"{{COMPANY_NAME}}","decision":"PROPOSED_MUTATION|EXCLUDED|SUPERSEDED|VERIFIED_NO_CHANGE|DEFERRED","confidence":"HIGH|MEDIUM|LOW","blockerResolution":{"recordedBlocker":"","resolved":false,"finding":"","missingFact":null},"identityResolution":{"canonicalDisplayName":"","canonicalLegalName":null,"canonicalKey":"","aliases":[],"platformBoundary":"","targetTaskId":null,"targetCompanyId":null},"ownershipResolution":{"currentOwners":[],"formerOwners":[],"pendingTransactions":[],"exitSearch":""},"recommendedAction":{"action":"","afterImageSummary":null,"terminalReason":null},"evidence":[],"unresolvedQuestions":[],"completenessChecks":{"directPrimaryOpened":false,"acquisitionAndExitSearchCompleted":false,"identityResolved":false,"activeOwnershipResolved":false,"exactlyOneRecommendedPrimary":false}}
END_JSON
BEGIN_REVIEW
One concise paragraph stating the blocker, decision, owner treatment and any remaining exception.
END_REVIEW

Owner keys only: `manager`, `organization`, `fund`, `vehicle`, `stake`, `entryDate`, `entryYear`, `exitDate`, `exitYear`, `isActive`, `transactionState`, `evidenceUrls`. Pending-transaction keys only: `direction`, `counterparty`, `announcementDate`, `closingDate`, `state`, `evidenceUrls`. Evidence keys only: `label`, `url`, `purpose`, `sourceTier`, `workingStatus`, `isRecommendedPrimary`. Recommend exactly one primary source unless the decision is `DEFERRED`, in which case identify the strongest source and explain why it is insufficient.

Keep the complete response under 7,000 characters, use no more than eight evidence rows, and do not perform scorecard enrichment beyond facts necessary to resolve the blocker.
