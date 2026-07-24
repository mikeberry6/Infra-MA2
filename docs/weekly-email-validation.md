# Weekly Email Release Validation

`npm run validate-weekly-email` validates the newest dated file in `public/email-format/`. Pass a dated path to validate a specific issue. The validator never edits an issue, so published historical editions remain immutable.

## Release contract

The validator enforces the weekly publishing rules that can be checked deterministically:

- Active sector sections must omit zero-deal sectors and be ordered by deal count. Count ties use `Power & ET`, `Digital`, `Transportation`, `Utilities`, `Midstream`, then `Social Infra`.
- The count in every sector comment must equal the number of complete cards in that section.
- Every card must contain `Target / Asset | fund manager`, `Sponsor (transaction type) · subsector · region/country`, a substantive overview, and one HTTP(S) link labelled `Source`.
- When U.S. transactions are present, Key Themes must explicitly discuss `U.S. deployment`.
- The hidden preheader and first Previous Editions summary must exactly match the current active-sector counts and order. Every Previous Editions entry must use known sectors once each, have positive counts in the required order, and reconcile to its stated total.
- Sector and region YTD tables must both be descending. Each bar must equal `round(count / leadingCount * 100)`.
- Readable themes, metadata, overview, source, YTD, and footer text is checked using the WCAG relative-luminance formula. Normal text requires 4.5:1; large text requires 3:1. Brand-only accents and hidden preheader copy are not treated as readable body copy.
- The latest issue is compared with the generated weekly static deal projection. A missing current-week record is a release error. A reviewed database export can be supplied with `--coverage-file path.json`; it must be an array, or a `{ "data": [] }` envelope, containing `target` and optional `sector`, `country`, `sourceUrl`, and `id` fields. Forward issues require a country-specific `country` value unless the card itself supplies explicit country evidence.

The stricter editorial contract applies to dated issues beginning `2026-07-24`; published historical issues remain on the legacy compatibility path. Forward issues additionally require a recognized infrastructure fund/fund-manager title suffix, one controlled transaction label, canonical `GSAM` naming, exact preheader/Previous Editions summaries, explicit deal-scale metadata, and the U.S. theme annotations below.

## U.S. theme annotations

Country-specific static coverage is authoritative for identifying U.S. transactions. `US`, `USA`, `U.S.`, and `United States` in the card location are accepted fallbacks, as is explicit U.S. location evidence in the overview when coverage is regional/global. A regional/global country with no specific location evidence is a forward release error rather than being silently classified as non-U.S.

Every forward U.S. card must declare its editorial category and priority on the card table:

```html
<table
  role="presentation"
  data-us-theme-category="platform"
  data-us-theme-priority="1"
>
```

`data-us-theme-category` is `operating-asset`, `platform`, or `portfolio-company`. Priorities are unique and contiguous within each category, with `1` identifying the strongest transaction. Priority order must respect disclosed economic/physical scale when values are comparable; the explicit priority records editorial judgment when units are not comparable. The final Key Themes paragraph must say `U.S. deployment` and name the priority-1 card from every represented U.S. category.

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

## Link checks and exit codes

Network checks are opt-in and bounded:

```bash
npm run validate-weekly-email -- --check-links
npm run validate-weekly-email -- public/email-format/2026-07-17.html --check-links --max-links=80 --link-timeout-ms=5000 --link-budget-ms=30000
```

Every unique HTTP(S) anchor is eligible: editorial Sources, navigation, previous-edition links, and marketing/contact links. URL fragments are removed before de-duplication; non-network anchors such as `mailto:`, `tel:`, and in-document fragments are ignored. Malformed non-Source HTTP(S) anchors are deterministic release errors, while malformed card Sources continue to use the more specific Source-integrity finding.

Only definitive HTTP 404 and 410 responses fail validation. Source failures retain Source-specific finding codes; failures from other anchors use general link finding codes. Every editorial Source is attempted regardless of `--max-links`; that cap applies only to non-Source anchors. If the total-time budget expires before a Source can be attempted, validation fails. Timeouts, DNS failures, bot blocks, rate limits, and inconclusive provider responses from attempted requests remain visible warnings so an offline runner does not falsely classify a link as broken. Link checks use at most four concurrent requests and remain bounded by the total-time budget.

The scheduled weekly verification workflow runs with `--check-links`. Static deploy validation intentionally remains network-independent; editors should run the link-check command before publication, and the scheduled workflow provides the recurring external verification.

The command prints a machine-readable JSON report. Exit code `0` means the issue passes (warnings may remain), `1` means deterministic release errors were found, and `2` means invocation, input, or validator execution failed. `--no-static-coverage` exists only for isolated fixture testing; release and CI runs must keep static coverage enabled.
