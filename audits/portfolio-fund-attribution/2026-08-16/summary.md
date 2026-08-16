# Portfolio Fund Attribution Ledger — 2026-08-16

This review-only ledger classifies every active ownership row. It does not add funds or mutate Prisma data. Inferred rows are estimates and remain visibly distinct from disclosed assignments.

| Measure | Count |
| --- | ---: |
| Portfolio companies | 1131 |
| Active ownership rows | 1264 |
| Disclosed | 611 |
| Inferred estimates | 595 |
| Direct / program | 58 |
| Unresolved | 0 |
| High-confidence deterministic subset | 216 |
| Full reviewed attribution manifest | 1264 |
| Named funds/vehicles outside curated fund database | 385 |

## Guardrails

- A disclosed vehicle outside the curated fund database stays disclosed without bypassing the approximately $1bn fund-addition gate.
- An inferred assignment always includes a confidence level, rationale, and ranked alternatives.
- Inference is capped at Medium confidence; it is never presented as public disclosure.
- Direct/program classification requires explicit balance-sheet, proprietary-capital, SMA, pension, sovereign, or corporate-capital language.
- Production writes require a separately reviewed, immutable apply manifest.
