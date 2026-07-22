# Portfolio Company Review Ledger

Generated: 2026-07-22T22:50:39.790Z
Database: ep-dawn-sky-amaxdqe4-pooler.c-5.us-east-1.aws.neon.tech / neondb
Published companies accounted for: 1191
Dataset SHA-256: `015c442f04333b78953479d27e6ef33e6cae65b62931ea30e055c6c9b2fe7752`

This is a deterministic evidence review, not a substitute for external research where the outcome says review or research is required. Every published live company appears exactly once in the JSON and CSV ledgers.

## Schema capabilities

- Company.lastVerifiedAt: not deployed
- Citation.isPrimary: not deployed
- CompanyRedirect: not deployed

## Outcome coverage

| Outcome                  | Companies |
| ------------------------ | --------: |
| SEED_SYNC_REQUIRED       |       634 |
| PASS                     |       252 |
| ENRICHMENT_RECOMMENDED   |       241 |
| IDENTITY_REVIEW_REQUIRED |        43 |
| RESEARCH_REQUIRED        |        21 |

## Most common issue codes

| Issue                          | Companies / occurrences |
| ------------------------------ | ----------------------: |
| MISSING_PLATFORM_MANAGEMENT    |                     495 |
| MISSING_WEBSITE                |                     483 |
| SEED_MILESTONE_NOT_LIVE        |                     461 |
| SEED_OWNER_NOT_LIVE            |                     198 |
| MISSING_YEAR_FOUNDED           |                     191 |
| SEED_CORE_FIELD_DRIFT          |                     180 |
| OWNERSHIP_SOURCE_GAP           |                     149 |
| SEED_SOURCE_NOT_LIVE           |                     126 |
| AMBIGUOUS_IDENTITY             |                      43 |
| MISSING_INVESTMENT_YEAR        |                      21 |
| OWNER_ENTRY_MILESTONE_GAP      |                      12 |
| LIVE_COMPANY_MISSING_FROM_SEED |                       9 |
| NO_MILESTONES                  |                       5 |
| MILESTONE_CARD_OVERFLOW        |                       2 |
| UNRESOLVED_DESCRIPTION         |                       2 |
| BLANK_OWNERSHIP_VEHICLE        |                       1 |
| GENERIC_COMPANY_NAME           |                       1 |
| MISSING_HEADQUARTERS           |                       1 |
| NO_CITATIONS                   |                       1 |

## Required interpretation

- `IDENTITY_REVIEW_REQUIRED`: do not merge or update until entity and geographic scope are resolved.
- `RESEARCH_REQUIRED`: the current source trail cannot support an automatic decision.
- `DEAL_SYNC_REQUIRED`: a strong deal/company relationship needs explicit editorial linkage or rejection.
- `DATA_CORRECTION_REQUIRED`: deterministic live-row cleanup is available.
- `SEED_SYNC_REQUIRED`: live and replay state differ and must be reconciled deliberately.
- `ENRICHMENT_RECOMMENDED`: the record is structurally usable but its card can be strengthened.
- `PASS`: no issue was found by the current deterministic standard.
