# PortCo proposal — Wecom Fiber

- Task: 265 (ledger:0265:wecom-fiber:efb4f3b9)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: c91bfab4be037d9a9bd22b5c135a5e4ccb29614449a5ae694af1dc4fe6fb5ee3
- Production snapshot SHA-256: f8c09518492dda5243f3a7b22cc947b9d386a9a3759f52c9b6651c35cb38d2f1
- Current company snapshot SHA-256: 233bf66589aa6775677e5182e3907bbe4da3ee2befa7cba7b560abeb11edbef5
- After-image SHA-256: c32ed4ed9c9da682eec1e43ac652c71e9a11a467fdd34cbdae9e4ce471ef92c2

## Recommendation

Correct Wecom's upstream ownership chain without treating GIC's 46.74% interest in Searchlight Fiber Alliance as a direct company-level percentage. Searchlight controls Wecom through the SFA, WCM Topco and WCM Holdco chain. GIC and ADIA hold insulated nonvoting interests in SFA, while Simple Broadband II and the founders retain minority Topco interests. Preserve one Wecom operating-company boundary and keep the exact GIC and ADIA entry dates as not publicly disclosed.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Abu Dhabi Investment Authority (ADIA) | — | Platinum Compass B 2018 RSC Ltd. via Searchlight Fiber Alliance LLC | 46.74% nonvoting interest in SFA; FCC-calculated 36.38% indirect Holdco equity | — | — | CLOSED_ACTIVE |
| ArmaVir Partners / Simple Networks | — | Simple Broadband II LLC via Simple Broadband LLC | 17.65% of Topco equity and 16.67% of its vote | 2023 | — | CLOSED_ACTIVE |
| GIC | — | Epsom Investment Pte. Ltd. via Searchlight Fiber Alliance LLC | 46.74% nonvoting interest in SFA; FCC-calculated 36.38% indirect Holdco equity | — | — | CLOSED_ACTIVE |
| Searchlight Capital Partners | — | Searchlight Fiber Alliance LLC; SFA GP; WCM Topco and WCM Holdco | SFA holds 77.83% of Topco equity and 66.67% of its vote; Holdco owns 100% of Wecom | 2023 | — | CLOSED_ACTIVE |
| Wecom founders | — | Wecom Newco Inc. / LicenseCo rollover | 4.52% of Topco equity and 16.67% of its vote | 2023 | — | CLOSED_ACTIVE |

## Source holdings

- 047-gic:holding:013:wecom-fiber

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

- [Final ownership chain and control](https://docs.fcc.gov/public/attachments/DA-24-820A1.pdf) — GIC and ADIA each hold a 46.74% nonvoting interest in SFA, Searchlight controls Wecom through the SFA and WCM holding-company chain, The FCC calculated each institutional chain at 36.38% indirect Holdco equity
- [Legal identity, subsidiaries and financing](https://public.destinyhosted.com/yavapdocs/2025/BOS/20250917_1986/19761_Financial_Statements_-_Wecom_and_Subsidiaries.pdf) — The May 2023 acquisition and later financing did not establish a subsequent ownership exit, Wecom LLC is the operating company and the identified entities are subsidiaries
- [Searchlight investment announcement](https://wecomfiber.com/wecom-and-searchlight-capital-partners/) — Founder participation continued through the transaction, Searchlight announced its strategic investment in Wecom on May 15, 2023

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
