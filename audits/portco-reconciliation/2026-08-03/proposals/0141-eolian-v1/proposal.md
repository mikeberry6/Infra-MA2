# PortCo proposal — Eolian

- Task: 141 (ledger:0141:eolian:ae9eb0a5)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: b4ad93574d376c88db93fa40c483ab05f922eef0df4b75fce881a2332abd2b32
- Production snapshot SHA-256: 7fe3b410d74a38f6f34737582e32cac27a33de5e1018c0dd68c514787aadae94
- Current company snapshot SHA-256: fad9b06cc85d5919bb20c94c7b04872f4c3c37dbf2802e1569348b346d71fdba
- After-image SHA-256: 5b026f8949cd8ac754ffd15e08462727531aa2c172a54b554ae506c4452f6fb7

## Recommendation

Retain one Eolian platform record and correct its identity, ownership boundary and Able Grid history. GIP IV acquired MAP Energy's renewable business in 2020 and GIP continues to list Eolian as unrealized. Eolian's July 2026 release identifies both employees and GIP-managed funds as owners, while BlackRock's acquisition of the GIP manager did not create a separate Eolian ownership period. MAP Energy is retained as the former owner that exited in 2020. The 2021 transaction acquired remaining interests in Able Grid-managed development portfolios, not Able Grid Energy Solutions itself.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Eolian employees | — | — | Current employee co-ownership disclosed; percentage not publicly disclosed | — | — | CLOSED_ACTIVE |
| GIP | — | GIP IV | 100% of MAP RE/ES acquired at entry; current percentage not publicly disclosed because employees now co-own | 2020 | — | CLOSED_ACTIVE |
| MAP Energy, LLC | — | MAP RE/ES | 100% of MAP RE/ES announced sold to GIP IV | — | 2020 | REALIZED |

## Source holdings

- 048-global-infrastructure-partners:holding:006:eolian

## Retired company records

- None

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| — | — | — | None |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Entry and predecessor evidence](https://www.eolianenergy.com/press/global-infrastructure-partners-announces-acquisition-of-map-energys-renewable-energy-business) — GIP IV announced the acquisition of 100% of MAP Energy's renewable-energy business in 2020, the acquired business became Eolian
- [Current infrastructure-strategy and ownership-status evidence](https://www.global-infra.com/portfolio-page/eolian/) — Eolian is a U.S. renewable-power and storage platform, GIP identifies Eolian as a current unrealized GIP IV portfolio company
- [Platform-boundary evidence](https://www.prnewswire.com/news-releases/eolian-a-global-infrastructure-partners-portfolio-company-announces-acquisition-of-able-grid-development-interests-301450429.html) — Eolian acquired remaining interests in Able Grid-managed development portfolios, the transaction was not an acquisition of Able Grid Energy Solutions itself
- [Current co-owner and operating-status evidence](https://www.prnewswire.com/news-releases/eolian-announces-1-gwh-flint-grid-bess-pjms-largest-battery-energy-storage-project-now-under-construction-to-support-americas-fastest-growing-data-center-and-industrial-corridor-near-columbus-ohio-302837697.html) — Eolian identified its owners as employees and funds managed by GIP in July 2026, Eolian remained active through the Flint Grid construction announcement

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
