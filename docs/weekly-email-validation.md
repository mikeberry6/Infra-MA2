# Weekly Email Release Validation

`npm run validate-weekly-email` validates the newest dated file in `public/email-format/`. Pass a dated path to validate a specific issue. The validator never edits an issue, so published historical editions remain immutable.

## Release contract

The validator enforces the weekly publishing rules that can be checked deterministically:

- Active sector sections must omit zero-deal sectors and be ordered by deal count. Count ties use `Power & ET`, `Digital`, `Transportation`, `Utilities`, `Midstream`, then `Social Infra`.
- The count in every sector comment must equal the number of complete cards in that section.
- Every card must contain `Target / Asset | fund manager`, `Sponsor (transaction type) · subsector · region/country`, a substantive overview, and one HTTP(S) link labelled `Source`.
- When U.S. transactions are present, Key Themes must explicitly discuss `U.S. deployment`.
- Sector and region YTD tables must both be descending. Each bar must equal `round(count / leadingCount * 100)`.
- Readable themes, metadata, overview, source, YTD, and footer text is checked using the WCAG relative-luminance formula. Normal text requires 4.5:1; large text requires 3:1. Brand-only accents and hidden preheader copy are not treated as readable body copy.
- The latest issue is compared with the generated weekly static deal projection. A missing current-week record is a release error. A reviewed database export can be supplied with `--coverage-file path.json`; it must be an array, or a `{ "data": [] }` envelope, containing `target` and optional `sector`, `sourceUrl`, and `id` fields.

## Explicit deal-scale metadata

For deterministic largest-to-smallest checks, put these attributes on each deal card's inner presentation table:

```html
<table
  role="presentation"
  data-scale-kind="economic"
  data-scale-value="1800"
  data-scale-unit="USD-mm"
  data-scale-rank="1"
  data-scale-note="US$1.8bn purchase price"
>
```

`data-scale-kind` is `economic`, `physical`, or `undisclosed`. Economic and physical cards require a non-negative numeric value and a unit. Use a unique 1-based `data-scale-rank` on every card in a section when currencies or physical units are not directly comparable and editorial judgment determines order. If an older issue has no metadata, the validator performs conservative text inference and emits warnings instead of claiming incomparable metrics are definitive failures. If any card in a section uses explicit metadata, every card in that section must use it.

## Source checks and exit codes

Network checks are opt-in and bounded:

```bash
npm run validate-weekly-email -- --check-links
npm run validate-weekly-email -- public/email-format/2026-07-17.html --check-links --max-links=80 --link-timeout-ms=5000 --link-budget-ms=30000
```

Only definitive HTTP 404 and 410 responses fail validation. Timeouts, DNS failures, rate limits, and inconclusive provider responses are reported as warnings so an offline runner does not falsely classify a source as broken. Link checks use at most four concurrent requests and stop at both the link-count and total-time budgets.

The command prints a machine-readable JSON report. Exit code `0` means the issue passes (warnings may remain), `1` means deterministic release errors were found, and `2` means invocation, input, or validator execution failed. `--no-static-coverage` exists only for isolated fixture testing; release and CI runs must keep static coverage enabled.
