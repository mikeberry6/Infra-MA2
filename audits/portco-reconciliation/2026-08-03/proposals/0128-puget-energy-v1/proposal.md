# PortCo proposal — Puget Energy

- Task: 128 (ledger:0128:puget-energy:f96cd6be)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: c579f09caa89779cb49d9aecada0638377ed8aab7d30989af7357ce54d604036
- Production snapshot SHA-256: 5e94c1d6dfe2f19ca15145ffd18c89c15581ab30aaf594a3264cb1f80900040e
- Current company snapshot SHA-256: 959773e56e2d96ae58e3576433decc82285c7be75fb3db6541da5616c92ed3a0
- After-image SHA-256: 796302af1244bfd24e9c7e5d02d5cfbe8ed1f1ca244e003cbabc27217d07e5b3

## Recommendation

Keep Puget Energy, Inc. as the single canonical manager-level platform and retire Puget Sound Energy as a duplicate PortCo record. Puget Holdings owns Puget Energy, which owns 100% of regulated utility PSE and also owns Puget LNG; PSE therefore remains a subsidiary and operating brand, not a second portfolio company. The six current Puget Holdings investors and two former investor periods are preserved once, using the current 2026 disclosed stakes and verified transition dates.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| AIMCo | AIMCo Direct Infrastructure Investment | — | 13.6% current; 7.6% before the April 2019 increase | 2009 | — | CLOSED_ACTIVE |
| BCI | Infrastructure & Renewable Resources | — | 20.9% current; 16.9% before the April 2019 increase | 2009 | — | CLOSED_ACTIVE |
| CPP Investments | — | CPP Investment Board (USRE II) Inc. | 31.6% | 2009 | 2022 | REALIZED |
| Macquarie Asset Management | — | Original Puget Holdings consortium vehicles | 44.0% rounded | 2009 | 2019 | REALIZED |
| Macquarie Asset Management | — | Macquarie Washington Clean Energy Investment, L.P. (Macquarie Global Infrastructure Fund) | 15.8% | 2022 | — | CLOSED_ACTIVE |
| OMERS Infrastructure | OMERS Infrastructure | — | 23.9% | 2019 | — | CLOSED_ACTIVE |
| Ontario Teachers' Pension Plan | — | — | 15.8% | 2022 | — | CLOSED_ACTIVE |
| PGGM | — | — | 10.0% | 2019 | — | CLOSED_ACTIVE |

## Source holdings

- 021-bci:holding:001:puget-energy

## Retired company records

- cmrxpjkcr014rivhero16klvt

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpm9vl04nzivhenzqnkvhj | cmrxpkds302erivhe7gtyyfay | Both milestones record the February 6, 2009 Puget take-private close. |
| MILESTONE | cmrxpm9wl04o1ivhe9u0z5vnw | cmrxpkdsr02esivhe432860z4 | Both milestones record the 2018 agreement for the OMERS/PGGM entry and BCI/AIMCo increases. |
| MILESTONE | cmrxpm9za04o2ivhe98a0sl3g | cmrxpkdtu02euivhe0k7q35ln | Both milestones record the February 22, 2022 Macquarie Asset Management and Ontario Teachers' close. |
| OWNERSHIP_PERIOD | cmrxpk6h9023sivhes2ip9z2h | cmrxpjpks01d3ivhe9nm9wwth | Both periods represent BCI's same 2009-present Puget Holdings interest. |
| OWNERSHIP_PERIOD | cmrxpk6hr023tivhe66aoa5c5 | cmrxpjpk701d2ivhenespe9dw | Both periods represent AIMCo's same 2009-present Puget Holdings interest. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Legal subsidiary schedule](https://www.sec.gov/Archives/edgar/data/1085392/000108539226000016/exhibit101-pugetenergy2026.htm) — Puget LNG is a separate Puget Energy subsidiary, Puget Sound Energy is 100% owned by Puget Energy
- [Latest current-status and exit check](https://www.sec.gov/Archives/edgar/data/1085392/000108539226000016/psd-20260630.htm) — No later sponsor transfer or pending platform sale was disclosed through July 29, 2026, Puget Energy and PSE remain in the parent-subsidiary structure
- [Current ownership and platform boundary](https://www.sec.gov/Archives/edgar/data/81100/000119312526084011/d109936dex991.htm) — Current regulated utility scale, Puget Energy owns Puget Sound Energy, The six current Puget Holdings owners and their stakes

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
