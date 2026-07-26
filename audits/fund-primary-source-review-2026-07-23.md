# Fund Primary-Source Review Queue — 2026-07-23

> **REVIEW-ONLY CONTROL:** This audit is a triage aid, not an approval file, a
> `FundRefreshProposal`, or evidence that a candidate URL supports every fact
> on a Fund record. It does not select any `primarySourceUrl`, authorize a data
> mutation, or change publication state. Research must open and evaluate every
> selected source before producing a hash-bound approval.

## Exact validation provenance

This review is bound to:

- draft pull request [#223](https://github.com/mikeberry6/Infra-MA2/pull/223);
- branch head `bf05e5d582d795037c098ffb0fabb6b4e7705d20`;
- documentation-only Release Gate [30048515397](https://github.com/mikeberry6/Infra-MA2/actions/runs/30048515397);
- retained artifact `validation-evidence-30048515397`, artifact ID `8580178919`,
  ZIP digest
  `sha256:8009e8e7870ec4d06cb862e9d4a292d923af42019ca115e23423d21b7dd15694`,
  retained through `2026-08-22T22:08:06Z`; and
- artifact member `fund-primary-source-approval-template.json`, generated at
  `2026-07-23T22:04:05.974Z`, byte size `104638`, SHA-256
  `b55d2917462603838099a8ddf29eb63fa35f43598ae16ca1c4775adfed9a08d2`.

The template is a workload snapshot from the isolated validation database. It
is not a trusted production fingerprint or a fund-refresh baseline. Any Fund,
source, or supporting fact change requires a regenerated template and renewed
review.

## Population and candidate shape

| Measure | Count |
| --- | ---: |
| Published Funds requiring a primary-source decision | 150 |
| Rows with one candidate | 25 |
| Rows with two candidates | 110 |
| Rows with three candidates | 13 |
| Rows with four candidates | 1 |
| Rows with six candidates | 1 |
| Candidate uses after within-row URL deduplication | 294 |
| Unique candidate URLs | 226 |
| URLs shared across Funds | 38 |
| Funds affected by shared URLs | 94 |
| Existing primary-source selections | 0 |

The candidates exactly equal each row's current `sourceUrls + strategyUrl`
union in [`docs/fund-source-audit.csv`](../docs/fund-source-audit.csv). Candidate
order is lexical and is not a quality ranking. The template reorganizes the
May audit; it does not add new evidence.

Candidate provenance contains 172 `SOURCE_URLS` uses and 150 `STRATEGY_URL`
uses, with 28 URLs present in both fields. URL/domain heuristics classify 228
uses as first-party manager, issuer, vehicle, or program pages; 45 as SEC Form
D filings across 41 Funds; two as other SEC issuer filings; seven as
institutional, regulator, or LP sources; and 12 as wire, adviser, or secondary
sources. Those classifications require page-level confirmation.

Every row technically has a first-party candidate because every strategy URL
enters the pool. A manager homepage or strategy page does not necessarily
support the named vehicle, final-close status, size, vintage, or amount basis.

## Single-candidate queue

The approval format cannot express “none of the listed candidates is
adequate.” These 25 rows therefore require source-suitability review before
any selection.

### Explicit program-level exceptions — 13

`FUND-003`, `FUND-004`, `FUND-010`, `FUND-026`, `FUND-030`, `FUND-058`,
`FUND-082`, `FUND-110`, `FUND-123`, `FUND-127`, `FUND-128`, `FUND-129`,
`FUND-143`

These are direct-investment, pension, or sovereign programs. If Research keeps
them, the evidence and record must state the program-level exception rather
than implying a named closed-end Fund.

### Known unresolved manager fallbacks — 2

- `FUND-027` — AxInfra Fund I–IV: only `https://axiuminfra.com/`.
- `FUND-067` — ECP Fund VI: only ECP's generic About page.

The existing audit rates both Low confidence. Do not approve either row without
vehicle-specific evidence or a reviewed record correction followed by
template regeneration.

### Generic medium-confidence pages — 2

- `FUND-096` — IFM CETF: generic knowledge/capability page.
- `FUND-109` — Wren House Infrastructure: generic company page.

### Previously rated High, still requiring direct inspection — 8

`FUND-005`, `FUND-054`, `FUND-064`, `FUND-081`, `FUND-095`, `FUND-121`,
`FUND-147`, `FUND-148`

INPP, Generate, and Ullico appear naturally vehicle/program-specific. CBRE GIF,
Duration, iCON, Morrison, and Vauban rely on broader pages whose support for
the exact named vehicle and claimed close facts must be confirmed. Prior audit
confidence is triage metadata, not approval.

## P0 — do not approve as currently presented

### Apparent wrong-vehicle or wrong-purpose candidates

| Fund | Review issue |
| --- | --- |
| `FUND-002` — 3i North America Infrastructure Fund | A candidate concerns 3i Infrastructure plc, a different listed vehicle. |
| `FUND-012` — Apollo Clean Transition Equity Partners I | A firmwide clean-transition strategy launch does not plainly establish the claimed Fund I final close. |
| `FUND-023` — Argo Series 3 | Apollo's acquisition of the Argo manager does not establish Series 3 close or size. |
| `FUND-032` — BlackRock GIF IV | Candidate wording supports a first close, while the row claims a later/larger financial close. |
| `FUND-077` — Fengate Infrastructure Yield Fund | The listed close release is explicitly for Fengate Fund IV. |
| `FUND-078` — Fiera Digital Fund | The candidate concerns the AssetCo exit from Fiera's infrastructure-management business. |
| `FUND-093` — ISQ Energy Transition Infrastructure Fund | Transaction evidence supports investment activity, not a Fund close. |
| `FUND-135` — Searchlight Fiber Alliance | Candidates concern a portfolio transaction, thought piece, and manager homepage rather than a named closed-end Fund. |
| `FUND-145` — TPG Peppertree Fund X | Rise Climate strategy material is the wrong strategy; Form D and issuer filings require independent assessment. |
| `FUND-148` — Vauban CIF IV | A generic About page does not establish the claimed final close. |
| `FUND-149` — Vision Ridge SAF IV | The pool contains a manager homepage and syndicated release copy but not the direct manager release. |

### Fund-versus-program or aggregate-amount ambiguity

| Fund | Review issue |
| --- | --- |
| `FUND-044` — Brookfield BAIIF | The Fund claim and broader AI-infrastructure program amount must not be conflated. |
| `FUND-046` — Brookfield BIF V | Distinguish Fund-only capital from broader “flagship strategy” capital. |
| `FUND-059` / `FUND-060` — CVC DIF vehicles | One aggregate release is reused for two separate vehicles. |
| `FUND-066` — ECP Fund V | Distinguish Fund V size from an aggregate fundraising announcement. |
| `FUND-115` — Macquarie MIP VI | Distinguish Fund commitments from combined Fund and co-investment commitments. |

### Financial-close rows relying on Form D semantics

The following 13 financial-close rows contain Form D evidence but no obvious
fund-specific close release in the candidate title/URL set:

`FUND-014`, `FUND-025`, `FUND-031`, `FUND-033`, `FUND-036`, `FUND-049`,
`FUND-053`, `FUND-055`, `FUND-068`, `FUND-070`, `FUND-099`, `FUND-103`,
`FUND-145`

Form D may support offering identity, target, and amount sold. It does not by
itself prove final-close status or committed capital. Amounts on `FUND-033`,
`FUND-068`, and `FUND-103` require particular target-versus-close review.

If no listed candidate supports the exact vehicle and current facts, correct
the source/Fund data and regenerate the neutral template. Do not select an
inadequate URL merely to satisfy the one-selection schema.

## P1 — manual scope or exception adjudication

- The 13 program-level exception rows listed above.
- `FUND-096` and `FUND-109` generic program pages.
- `FUND-104` — J.P. Morgan IIF: transaction evidence may support
  participation without establishing program status or size.
- `FUND-125` — Northleaf NEIF: the candidate is an adviser release rather than
  a first-party Fund source.
- `FUND-150` — Partners Group Direct Infrastructure Fund IV: six mixed
  candidates span manager material, Form D, and secondary reporting; map every
  claimed critical field to specific evidence.

## P2 — normal source confirmation

The lower-risk cohort includes direct manager close releases or
vehicle/product pages, including `FUND-006`–`FUND-009`, `FUND-017`, `FUND-041`,
`FUND-043`, `FUND-045`, `FUND-073`, `FUND-080`, `FUND-086`–`FUND-087`,
`FUND-118`–`FUND-119`, `FUND-126`, `FUND-131`, and `FUND-147`.

These are not auto-approvable. Confirm exact vehicle identity, amount
semantics, date, status, and strategy before selection.

## Shared-source risk

Generic pages are reused across multiple rows:

- Brookfield infrastructure page: seven Funds.
- Macquarie infrastructure capability page: six Funds.
- GIP homepage: five Funds.
- Goldman Sachs, EQT, Blackstone, KKR, Apollo, and Stonepeak program/home
  pages: approximately four Funds each.

Shared pages may be valid strategy context but generally cannot independently
prove several distinct vehicles' close dates and sizes. The highest-risk
specific reuses are Fengate Fund IV evidence attached to the Yield Fund and TPG
Rise Climate evidence attached to Peppertree Fund X.

## Required Research record

For every Fund, record:

1. Exact URL, issuer, page title, and publication date.
2. Whether the source supports the exact vehicle or only a manager/program.
3. Supported fields: identity, strategy, status, close date, and size.
4. Amount semantics: target, amount sold, first close, final close, Fund-only,
   or Fund-plus-co-investment.
5. Source tier and any program-exception rationale.
6. A correction-and-regeneration outcome when no candidate is adequate.

Only after all 150 rows have passed that review should Research select exactly
one listed URL per row. A second reviewer should verify the exact reviewed
bytes and SHA-256, followed by protected validation proving zero missing Fund
primary sources.

## Fund-refresh skill boundary

The `refresh-infrastructure-funds` skill cannot safely create a
`FundRefreshProposal` from this branch because the required contract is absent:

- `prisma/seed-data/funds.manifest.json`;
- `prisma/seed-data/fund-evidence.manifest.json`;
- `src/modules/funds/refresh-schema.ts`; and
- the `funds:audit`, `funds:proposal:finalize`,
  `funds:proposal:validate`, and `funds:audit:generate` commands.

The skill also requires a clean isolated worktree based on the protected
default branch and an authenticated successful production audit fingerprint.
The validation template cannot substitute for those controls. This audit
therefore remains non-executable and review-only.
