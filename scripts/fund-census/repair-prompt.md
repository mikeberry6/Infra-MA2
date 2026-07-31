Regenerate the complete two-section response. Preserve researched facts and opened source URLs, correct only the validator failures supplied below, recompute every summary count, reconcile every repository legacy ID exactly once, and return no text outside `<fund_census_json>...</fund_census_json>` and `<fund_census_report>...</fund_census_report>`.

Do not replace missing evidence with inference. If a contract failure cannot be repaired from already opened evidence, move the affected item to `NEEDS_REVIEW`, `repoOnlyRecords`, `excludedCandidates`, or `unresolvedConflicts` as appropriate.

For every repository match, return a complete `matchedRepoFunds` object with
`legacyId`, `managerName`, and `fundName` copied exactly from the supplied
repository snapshot.
