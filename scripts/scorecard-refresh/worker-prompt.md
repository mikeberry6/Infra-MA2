# One-company infrastructure scorecard census

Research and return the **entire scorecard** for `{{REQUESTED_COMPANY}}` as of `{{AS_OF_DATE}}`. This is one company in a strictly sequential review. Do not research a second company and do not ask follow-up questions.

## Governing context

The JSON below is the complete task context. Existing scorecard and seed facts are unverified claims, not truth. Manager-census evidence is a lead only: reopen its direct pages before relying on it.

```json
{{CONTEXT_JSON}}
```

## Required fresh web research

- Resolve the canonical legal identity, aliases, predecessors/successors, and platform/subsidiary/project boundary.
- Identify every current and former legal infrastructure owner, infrastructure strategy basis, fund or vehicle, stake, announcement date, legal closing date, investment year, exit date, restructuring, and signed pending transaction.
- Search explicitly for both the original acquisition and every subsequent sale or disposition. Do not treat an announcement as a legal closing.
- Verify the official website, headquarters, founding year, products and services, customers and end markets, geographic footprint, and publicly disclosed scale.
- Select two to six material, non-duplicative historical milestones. Include the initial infrastructure investment and any material ownership transition when supported.
- Verify only current C-suite and President-level management. Exclude vice presidents, directors, controllers, general counsel, and former executives.
- Reconcile the supplied deal records and separately identify plausible missing transactions. Do not propose an automatic Deal Database mutation.

Open direct source pages; never cite search-result snippets. Prefer official company, manager, regulatory, government, and filing sources. Reliable secondary sources are permitted when primary evidence is unavailable. Record source health as `WORKING`, `REDIRECTED`, `BROWSER_BLOCKED_VERIFIED`, or `DEAD`.

Every current legal owner needs direct, usable ownership evidence whose citation purpose includes `OWNERSHIP_CURRENT`. An incoming buyer in a signed but unclosed transaction belongs only in `pendingTransactions`, never in `ownerships`. The incumbent remains current during a signed pending exit. Do not invent a vehicle, stake, date, executive, scale, headquarters, or founding year: use `NOT_PUBLICLY_DISCLOSED`. Use `UNRESOLVED` for an ownership or identity conflict and block application.

## Completion and output contract

- Echo the supplied execution attestation and snapshot hashes exactly. They were verified externally in the ChatGPT UI.
- A `COMPLETE` result must pass every completeness check, contain exactly one non-dead primary citation, and use only source IDs declared in `citations`.
- `recommendedCompany.description` and `overview` must be concise factual synthesis, not marketing language.
- `beforeAfterDifferences` must include retained claims that were materially revalidated as well as additions, corrections, and removals.
- The strict JSON Schema is below. Additional properties are forbidden. Custom rules described in this prompt remain binding even where JSON Schema cannot express them.

```json
{{OUTPUT_JSON_SCHEMA}}
```

Return exactly these two marked sections and no text outside them:

<scorecard_refresh_json>
{strict JSON matching the schema; do not include proposalHash}
</scorecard_refresh_json>
<scorecard_refresh_report>
A concise Markdown review naming the company and covering identity, operating profile, ownership/transaction state, material milestones, management, changes, sources, missing-deal candidates, and unresolved issues.
</scorecard_refresh_report>
