# Portfolio Fund Attribution Ledger — 2026-08-18

This review-only ledger classifies every active ownership row. It does not add funds or mutate Prisma data. Inferred rows are estimates and remain visibly distinct from disclosed assignments.

| Measure | Count |
| --- | ---: |
| Portfolio companies | 1131 |
| Active ownership rows | 1273 |
| Disclosed | 618 |
| Inferred estimates | 590 |
| Direct / program | 59 |
| Unresolved | 6 |
| High-confidence deterministic subset | 221 |
| Full reviewed attribution manifest | 1273 |
| Named funds/vehicles outside curated fund database | 386 |

## Guardrails

- A disclosed vehicle outside the curated fund database stays disclosed without bypassing the approximately $1bn fund-addition gate.
- An inferred assignment always includes a confidence level, rationale, and ranked alternatives.
- Inference is capped at Medium confidence; it is never presented as public disclosure.
- Direct/program classification requires explicit balance-sheet, proprietary-capital, SMA, pension, sovereign, or corporate-capital language.
- Production writes require a separately reviewed, immutable apply manifest.
