# PortCo proposal — Longroad Energy

- Task: 317 (ledger:0317:longroad-energy:c89b5c17)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, RETRACT_ERRONEOUS_OWNERSHIP
- Proposal SHA-256: 130295e627ed972fac6cb1f22e9ecc189b83940bff10f04649362e6ad0a79cb4
- Production snapshot SHA-256: cb0bfe10cdb0b2d66a1622b8c13289150fc6c5538decdfc951a17917d8e42a2b
- Current company snapshot SHA-256: 9318917ff46a37e0330be83a2cc5e0351f699583b36f13a5b4f55fa9f62b6a03
- After-image SHA-256: ef9e32291043807ea910c0d4f816127e0113649aa9776398a5decfbf34565c46

## Recommendation

Correct Longroad Energy's ownership ledger by removing two erroneous Morrison/Infratil rows and recording the four current economic ownership groups. Infratil's March 2026 reporting supports a 42.5% economic interest, while its live page reports 42.0%; the live page also reports New Zealand Super Fund at 34.8%, Longroad management at 13.0% and Munich Re at 9.7%. Morrison is Infratil's manager and adviser rather than a beneficial owner. MEAG manages Munich Re's interest through MR Hunu LP. No later company-level owner exit or signed ownership change was identified through September 1, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Infratil | — | Infratil US Renewables, Inc. | 42.5% at Mar 31, 2026; current live page reports 42.0% | 2016 | — | CLOSED_ACTIVE |
| MEAG | — | MR Hunu LP (Munich Re beneficial interest managed by MEAG) | 9.7% | 2022 | — | CLOSED_ACTIVE |

## Source holdings

- 061-infratil:holding:001:longroad-energy
- 066-meag:holding:001:longroad-energy

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

- [Audited current ownership and 2026 capital context](https://infratil.com/for-investors/financial-reports/annual-report-2026/) — Infratil remains invested in Longroad, Infratil reports a 42.5% economic interest at March 31, 2026
- [Current economic ownership split](https://infratil.com/our-investments/renewables/) — Infratil reports 42.0% on its live page, Management is reported at 13.0%, Munich Re is reported at 9.7%, New Zealand Super Fund is reported at 34.8%
- [Latest company confirmation of the current owner group](https://www.longroadenergy.com/longroad-energy-broadens-executive-leadership-team-to-capitalize-on-market-momentum-and-accelerate-next-phase-of-growth/) — Longroad identifies Infratil, New Zealand Super Fund, Munich Re and management as its current owners, The company remains an active U.S. renewable-development and operating platform

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
