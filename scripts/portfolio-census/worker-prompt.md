# North American infrastructure portfolio census — {{REQUESTED_MANAGER}}

You are an infrastructure ownership research analyst. As of **{{AS_OF_DATE}}**, identify every in-scope North American portfolio investment associated with **{{REQUESTED_MANAGER}}**, then reconcile the census against the supplied repository snapshot.

This is manager {{MANAGER_INDEX}} of {{MANAGER_COUNT}}. Research only this manager in this chat.

## Scope

Include one row per company, platform, or standalone asset that the manager presents as a direct investment. It must:

1. Be primarily based in or dedicated to the United States, Canada, or Mexico.
2. Be tied by reliable evidence to the manager's infrastructure team, infrastructure fund, managed account, direct infrastructure mandate, or infrastructure co-investment.
3. Represent an equity, minority, majority, joint, or co-investment interest.
4. Have one of these states on the as-of date:
   - `CLOSED_ACTIVE`
   - `SIGNED_PENDING_INCOMING`
   - `SIGNED_PENDING_EXIT`

A signed definitive transaction is in scope before closing, but its pending direction must remain explicit. A signed exit remains in scope until it closes.

Exclude closed exits, debt-only exposure, LP or fund-of-funds exposure, public-market securities, holdings tied only to a non-infrastructure strategy, companies outside North America, and subsidiaries or individual projects beneath an already-counted manager-level platform.

## Evidence and method

- Use current web research. Open the underlying pages; do not rely on search snippets or model memory.
- Resolve the manager's current canonical name, predecessor names, successor platform, and relevant aliases before enumerating holdings.
- Review official portfolio pages and their pagination or alphabetical coverage. Search acquisition announcements and later sale, exit, or closing announcements so a stale portfolio page does not establish current ownership by itself.
- One reliable source is sufficient only when it directly supports the relevant claim. Prefer manager or portfolio-company sources. Use additional sources whenever the first source does not establish infrastructure strategy, North American scope, or ownership state.
- Never infer an undisclosed fund vehicle, stake, date, headquarters, or status. Use `null` and explain the uncertainty.
- Preserve overlapping supplied managers rather than merging them. Record overlaps such as a parent manager and an acquired infrastructure platform.

## Reconciliation rules

Classify each included holding:

- `EXISTING_VERIFIED`: an existing repository company matches and its material ownership facts agree.
- `PROPOSED_NEW`: no existing repository company matches.
- `PROPOSED_CORRECTION`: an existing match has a material identity, ownership, vehicle, geography, or lifecycle discrepancy.
- `POSSIBLE_DUPLICATE`: more than one repository identity could represent the holding.
- `NEEDS_REVIEW`: evidence or attribution remains ambiguous.

For every repository company in the supplied snapshot, either match it to a holding or place it in `repoOnlyRecords`. Do not modify or publish repository data.

`matchedRepoCompany` must be `null` when no repository company matches. When it is non-null, return the strict object shape below using values from the supplied snapshot; do not return a company-name string:

{
  "repoCompanyId": "repository company id or null",
  "name": "repository company name",
  "country": "repository country"
}

`EXISTING_VERIFIED`, `PROPOSED_CORRECTION`, and `POSSIBLE_DUPLICATE` require a non-null `matchedRepoCompany`. `PROPOSED_NEW` requires `matchedRepoCompany: null`.

## Success criteria

Before answering, confirm that:

- every included holding has evidence supporting ownership, infrastructure strategy, North American scope, and ownership state;
- no manager-level holding appears twice;
- pending incoming and pending exit transactions remain visibly pending;
- closed exits and out-of-scope candidates are excluded with reasons;
- all supplied repository records are reconciled; and
- summary counts exactly match the arrays.

If research access or manager identity is genuinely blocked, return `taskStatus: "BLOCKED"` with explicit blockers. Ordinary uncertainty belongs in `unresolvedConflicts` or `NEEDS_REVIEW`, not in a blocked result.

## Required response

Return exactly two marked sections, with no text before or after them. Do not wrap either section in a code fence.

<portfolio_census_json>
{
  "schemaVersion": 1,
  "artifactType": "PORTFOLIO_CENSUS_RESULT",
  "methodologyVersion": "NA_INFRA_CENSUS_V1",
  "asOfDate": "{{AS_OF_DATE}}",
  "requestedManager": "{{REQUESTED_MANAGER}}",
  "canonicalManager": "current canonical manager name",
  "aliasesResearched": ["name or alias"],
  "overlappingSuppliedManagers": ["other supplied manager, if applicable"],
  "taskStatus": "COMPLETE",
  "blockers": [],
  "repoSnapshotSource": "{{REPO_SNAPSHOT_SOURCE}}",
  "sourceStandard": "ONE_RELIABLE_SOURCE_MINIMUM",
  "holdings": [
    {
      "companyName": "portfolio company, platform, or standalone asset",
      "website": "https://example.com/",
      "parentPlatform": null,
      "investmentLevel": "COMPANY",
      "sector": "Power & ET",
      "subsector": "specific infrastructure subsector",
      "region": "North America",
      "countries": ["United States"],
      "headquarters": "City, State",
      "ownershipVehicle": null,
      "stake": null,
      "investmentYear": null,
      "ownershipState": "CLOSED_ACTIVE",
      "infrastructureStrategyBasis": "why this belongs to the manager's infrastructure strategy",
      "northAmericaBasis": "why this is a North American operating company, platform, or asset",
      "evidence": [
        {
          "url": "https://example.com/source",
          "title": "source title",
          "publisher": "publisher",
          "sourceTier": "PRIMARY",
          "publishedAt": null,
          "retrievedAt": "{{AS_OF_DATE}}",
          "evidenceSummary": "claims supported by this source",
          "supports": [
            "OWNERSHIP",
            "INFRASTRUCTURE_STRATEGY",
            "NORTH_AMERICA",
            "OWNERSHIP_STATE"
          ]
        }
      ],
      "repoDisposition": "PROPOSED_NEW",
      "matchedRepoCompany": null,
      "repoDispositionRationale": "why this reconciliation classification applies",
      "confidence": "HIGH"
    }
  ],
  "excludedCandidates": [
    {
      "companyName": "candidate name",
      "reasonCode": "REALIZED",
      "rationale": "why it is excluded",
      "sourceUrl": "https://example.com/exit-source"
    }
  ],
  "repoOnlyRecords": [
    {
      "repoCompanyName": "repository company",
      "repoCountry": "United States",
      "disposition": "UNVERIFIED_EXISTING",
      "rationale": "why it was not matched",
      "evidenceUrls": []
    }
  ],
  "unresolvedConflicts": [
    {
      "subject": "company or manager identity",
      "issue": "specific conflict",
      "sourceUrls": ["https://example.com/source"],
      "recommendedResolution": "specific next review step"
    }
  ],
  "completenessChecks": {
    "officialPortfolioReviewed": true,
    "dispositionsSearched": true,
    "managerAliasesSearched": true,
    "paginationOrAlphabeticCoverageChecked": true,
    "sourcesOpened": 0,
    "searchQueriesRun": 0,
    "notes": ["coverage note"]
  },
  "summary": {
    "includedHoldings": 1,
    "closedActive": 1,
    "signedPendingIncoming": 0,
    "signedPendingExit": 0,
    "proposedNew": 1,
    "excludedCandidates": 1,
    "repoOnlyRecords": 1,
    "unresolvedConflicts": 1
  }
}
</portfolio_census_json>
<portfolio_census_report>
# {{REQUESTED_MANAGER}} — North American portfolio census

## Conclusion

State the census result and material caveats.

## Included holdings

Provide a compact table with ownership state, vehicle/stake, geography, repo disposition, and direct evidence links.

## Repository reconciliation

Summarize verified, proposed-new, correction, duplicate, and review items.

## Exclusions and unresolved issues

Summarize meaningful exclusions, conflicts, manager overlaps, and pending transactions.

## Completeness

Report the portfolio coverage, alias search, disposition search, and any inaccessible sources.
</portfolio_census_report>

Allowed `sourceTier` values: `PRIMARY`, `INSTITUTIONAL`, `RELIABLE_MEDIA`.

Allowed evidence `supports` values: `OWNERSHIP`, `INFRASTRUCTURE_STRATEGY`, `NORTH_AMERICA`, `OWNERSHIP_STATE`.

Allowed sectors: `Power & ET`, `Utilities`, `Digital`, `Midstream`, `Transportation`, `Social Infra`.

Allowed `investmentLevel` values: `COMPANY`, `PLATFORM`, `STANDALONE_ASSET`.

Allowed exclusion reason codes: `REALIZED`, `NON_INFRASTRUCTURE_STRATEGY`, `OUTSIDE_NORTH_AMERICA`, `DEBT_ONLY`, `FUND_OR_LP_EXPOSURE`, `PUBLIC_MARKET_SECURITY`, `SUBSIDIARY_OR_PROJECT`, `DUPLICATE_PLATFORM`, `INSUFFICIENT_EVIDENCE`, `OTHER`.

Allowed repo-only dispositions: `UNVERIFIED_EXISTING`, `PROPOSED_RETIRE`, `OUT_OF_SCOPE`, `MATCHED_ELSEWHERE`, `NEEDS_REVIEW`.

The JSON example shows field shape, not expected facts or array lengths. Replace every example value with researched facts and use empty arrays when appropriate.

## Existing repository snapshot

Treat this as reconciliation context, not proof that a record is correct:

{{EXISTING_REPO_SNAPSHOT_JSON}}

## Supplied manager universe

Use this only to flag overlapping manager identities:

{{SUPPLIED_MANAGER_UNIVERSE_JSON}}
