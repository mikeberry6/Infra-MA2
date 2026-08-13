# PortCo proposal — Natural Gas Pipeline Company of America (NGPL)

- Task: 77 (ledger:0077:natural-gas-pipeline-company-of-america-ngpl:d3c7cddc)
- As of: 2026-08-13
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: a03fc2601429b63235ad90999fe132a92b9fedce2b9ea8da71b9aff4ffa63ccd
- Production snapshot SHA-256: e57843f21a1e61d0d8925814388be69c1c28ef8e6edae7031088956df5908e20
- Current company snapshot SHA-256: 2f54f38284969476d18426e195025cd852071141d5746a4cd937f39a193f841b
- After-image SHA-256: 0b0131cada25d409d2616112cff7bdd2653303f60702eb50bf2f4b2fca5c0609

## Recommendation

Resolve the census holding Natural Gas Pipeline Company of America (NGPL) into the existing Natural Gas Pipeline Co. of America production and seed record rather than creating a duplicate. Correct the canonical display to the full legal operating-company name and retain the supported short-form, census and NGPL aliases. Replace the single unspecified ArcLight ownership row with the supported Fund VII 37.5% period, add ArcLight's separate 25% 2025 acquisition without inferring an undisclosed fund or holding vehicle, and add Kinder Morgan's continuing 37.5% operated interest without inferring its legal vehicle. Preserve Brookfield as a realized former owner through May 13, 2025 while leaving its original entry year and holding vehicle undisclosed. Update the four existing milestones to distinguish the initial ArcLight close, 2023 follow-on, 2025 signed Brookfield exit and 2025 closing. Current direct ownership totals 100%; no NGPL-specific pending sale or subsequent exit was identified through August 13, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | ArcLight Energy Partners Fund VII, L.P. | — | 37.5% | 2021 | — | CLOSED_ACTIVE |
| ArcLight Capital Partners | — | — | 25% aggregate; fund and vehicle split not publicly disclosed | 2025 | — | CLOSED_ACTIVE |
| Brookfield Asset Management | — | — | 25% at exit; previously 50% | — | 2025 | REALIZED |
| Kinder Morgan, Inc. | — | — | 37.5% | 1999 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:010:natural-gas-pipeline-company-of-america-ngpl

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

- [ArcLight fund and infrastructure-strategy attribution](https://arclight.com/wp-content/uploads/2025/10/2025-ArcLight-ESG-Report.pdf) — ArcLight attributes NGPL to Fund VII, ArcLight classifies NGPL within its strategic-gas infrastructure investments
- [Brookfield's signed exit and ownership history](https://bip.brookfield.com/press-releases/bipc/brookfield-infrastructure-announces-sale-ngpl-amidst-strong-capital-recycling) — Brookfield characterized the sale as its complete exit, Brookfield had previously increased its interest to 50% in 2015, Brookfield signed the sale of its remaining 25% on March 21, 2025
- [Brookfield's subsequent completed-exit confirmation](https://bip.brookfield.com/reports-filings/letters-shareholders/q2-2025-letter-shareholders) — Brookfield reported completing the sale of its remaining U.S. gas-pipeline interest
- [Current company identity, operating boundary, services and ownership](https://pipeline2.kindermorgan.com/Documents/NGPL/NGPL_CI_Cpny_Overview-20250702070807.pdf) — ArcLight-controlled funds own the remaining 62.5%, Kinder Morgan indirectly owns 37.5% and operates the company, Natural Gas Pipeline Company of America is a limited liability company owned beneath NGPL PipeCo LLC
- [Kinder Morgan's entry year and continuing operated interest](https://www.kindermorgan.com/About-Us/History) — Kinder Morgan acquired NGPL as part of the 1999 KN Energy transaction, Kinder Morgan currently owns 37.5% and operates NGPL
- [ArcLight's 2023 follow-on acquisition](https://www.prnewswire.com/news-releases/arclight-acquires-an-incremental-interest-in-natural-gas-pipeline-company-of-america-llc-from-brookfield-infrastructure-301852235.html) — ArcLight acquired an additional 12.5% from Brookfield on June 15, 2023, ArcLight's total interest increased to 37.5%
- [ArcLight's completed 2025 acquisition](https://www.prnewswire.com/news-releases/arclight-acquires-interest-in-natural-gas-pipeline-company-of-america-one-of-the-largest-natural-gas-infrastructure-assets-in-north-america-302453172.html) — ArcLight completed the acquisition of Brookfield's remaining 25% on May 13, 2025, ArcLight-controlled ownership increased to 62.5%, Kinder Morgan continued to own 37.5% and operate NGPL
- [Initial ArcLight acquisition closing](https://www.sec.gov/Archives/edgar/data/1506307/000150630723000023/kmi-20221231.htm) — ArcLight's initial 25% NGPL acquisition closed March 8, 2021, Kinder Morgan and Brookfield each retained 37.5% after the close
- [Current audited Kinder Morgan ownership and system scale](https://www.sec.gov/Archives/edgar/data/1506307/000150630726000011/kmi-20251231.htm) — Kinder Morgan reported a 37.5% NGPL interest as of December 31, 2025, The system included 9,105 miles of pipeline and 288 Bcf of storage capacity

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
