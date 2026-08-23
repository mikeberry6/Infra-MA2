# PortCo proposal — The AES Corporation

- Task: 154 (ledger:0154:the-aes-corporation:c65cb3c1)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, RETRACT_ERRONEOUS_OWNERSHIP, ADD_OWNER, ADD_PENDING_TRANSACTION
- Proposal SHA-256: 8a442316a28ed122c37919a8acb6aee1df60a79cc696a71e4ad7cd21f079c2ad
- Production snapshot SHA-256: 26289824aa6dad72f6353deac45bc33caccc86ec17fa2df15e239b797040e281
- Current company snapshot SHA-256: 7ccfb8804ae57442095650df2bb04f6ca5381e7261f5c517fcab6fe0fe265e65
- After-image SHA-256: 018db92b4fa0244664602fc7a958dd85107d67bdca7d6ea54e1e838782b1e100

## Recommendation

Retain the canonical AES parent, retract the two erroneous pre-closing GIP and EQT rows that were stored as active ownership, and represent the consortium take-private only as a signed pending incoming transaction. AES remained publicly owned as of August 23, 2026; stockholder approval and HSR expiry did not constitute legal closing, and other regulatory reviews remained open.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Public Market | — | — | Publicly traded; dispersed public shareholders | — | — | CLOSED_ACTIVE |

## Source holdings

- 048-global-infrastructure-partners:holding:003:the-aes-corporation

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

- [Open regulatory review](https://dps.ny.gov/event/comments-period-begins-horizon-merger-sub-inc-and-aes-corporation-petition-seeking) — New York review remained open after the stockholder vote
- [Transaction announcement](https://www.aes.com/energy-insights/consortium-led-global-infrastructure-partners-and-eqt-agrees-acquire-aes) — AES announced the consortium agreement on March 2, 2026
- [Latest completed approvals](https://www.sec.gov/Archives/edgar/data/874761/000114036126026562/ef20076870_8k.htm) — AES stockholders approved the transaction on June 26, 2026, the HSR waiting period expired on June 22, 2026
- [Merger agreement and buyer structure](https://www.sec.gov/Archives/edgar/data/874761/000119312526084157/d100078dex21.htm) — Horizon Parent is jointly controlled by GIP-managed vehicles and EQT Infrastructure VI, the transaction is a signed pending 100% acquisition

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
