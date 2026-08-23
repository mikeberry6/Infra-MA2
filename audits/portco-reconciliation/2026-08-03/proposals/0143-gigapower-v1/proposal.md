# PortCo proposal — Gigapower

- Task: 143 (ledger:0143:gigapower:24d5d5d3)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 6cd55636973f236a8c58ccbfc020de43250377d278375f2ec2670d5ca88bb84f
- Production snapshot SHA-256: b17c725d5ca1fa59ab4aa122be14d485fb63595eaa62017b369964919cb19986
- Current company snapshot SHA-256: 55c881d5841f28156f5d6549bd2e2ede6c6022da4fd0065af5d76a7be7ee4002
- After-image SHA-256: ac4e61b585ee104c0bfa868b3179ef65c0fbcfe2fe15d334e0986d40c0f5f55c

## Recommendation

Retain one Gigapower record, add AT&T as the missing 50% co-owner and correct the BlackRock-origin ownership period to the disclosed BGIF IV Neon Acquisition LP vehicle and 50% stake. Regulatory evidence identifies Gigapower, LLC and its predecessor, shows the two partners' aggregate 50/50 ownership and provides the holding vehicles. The joint venture closed and launched in May 2023. Current filings and company releases show continued AT&T ownership and operations. BlackRock's acquisition of the GIP manager did not establish a second GIP economic ownership period, so GIP remains manager context only.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| AT&T Inc. | — | Infrastructure Endeavors Holdings, LLC; Teleport Communications America, LLC | 50% aggregate | 2023 | — | CLOSED_ACTIVE |
| BlackRock | — | BGIF IV Neon Acquisition LP | 50% | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- 023-blackrock:holding:002:gigapower

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

- [Closing and launch evidence](https://about.att.com/story/2023/gigapower.html) — AT&T and BlackRock closed the joint venture on May 11, 2023, Gigapower launched as a wholesale open-access fiber platform
- [Regulatory identity, stake and vehicle evidence](https://dms.psc.sc.gov/Attachments/Matter/65e6a0be-d1d8-4be5-b502-64cab3497284) — AT&T-related vehicles and BGIF IV Neon Acquisition LP hold aggregate 50% interests each, Gigapower, LLC is the successor name of Infrastructure Endeavors, LLC
- [Current AT&T ownership evidence](https://www.sec.gov/Archives/edgar/data/732717/000073271726000120/t-20251231.htm) — AT&T continued to report its 50% Gigapower ownership in its 2025 Form 10-K

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
