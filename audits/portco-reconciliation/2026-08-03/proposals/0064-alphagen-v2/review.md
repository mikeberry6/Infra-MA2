# PortCo proposal — AlphaGen

- Task: 64 (ledger:0064:alphagen:b9424b11)
- As of: 2026-08-12
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: d157dabd1986e6d798a901b7924d9eaa51b77e7f4ebad8ac0ed4aace55ddab8b
- Production snapshot SHA-256: 5df92677cceb207e628f196678667c5d4bf969a537720b8a34f27cc1d9cf2c57
- Current company snapshot SHA-256: 8d2054ce724377a9fb7f5e51202b7e9c00c6178853edee22c88e53c91473305a
- After-image SHA-256: 1c6543606b43161a99a9ed9da163188ccab62cb22a12afb30cba9f7059a6d000

## Recommendation

Consolidate the duplicate AlphaGen and Alpha Generation, LLC production identities into one canonical legal-company record while preserving the immutable task target and redirecting the previously corrected duplicate. Alpha Generation, LLC is the legal company name and AlphaGen is its operating name. ArcLight Energy Partners Fund VII formed the platform and remains its controlling majority owner; ADIA retains its separately evidenced 16.8% indirect interest through Black Volt B 2024 LLC. CPP Investments announced a US$1.0 billion strategic minority investment on October 2, 2025 and completed it through CPPIB AlphaGen US LLC on March 9, 2026. The New York closing notice, CPPIB's March 17 regulatory report and CPP Investments' fiscal-2026 results establish that the investment closed and remained current. Exact ArcLight and CPP ownership percentages are not publicly disclosed, and no subsequent exit or pending sale was found through August 12, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Abu Dhabi Investment Authority (ADIA) | — | Black Volt B 2024 LLC | 16.8% | 2025 | — | CLOSED_ACTIVE |
| ArcLight Capital Partners | — | ArcLight Energy Partners Fund VII | Controlling majority interest; exact percentage not publicly disclosed | 2024 | — | CLOSED_ACTIVE |
| CPP Investments | — | CPPIB AlphaGen US LLC | Strategic minority interest; exact percentage not publicly disclosed | 2026 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:001:alphagen
- 032-cpp-investments:holding:003:alphagen

## Retired company records

- cmrxpj46m00g5ivhe8bi5r2wb

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkco202ddivhe5bgaekd6 | cmrxplcfs03khivhe26h42zxl | Both rows describe CPP Investments' October 2, 2025 announced strategic minority investment; retain the task-bound milestone and distinguish it from the March 9, 2026 closing. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [ADIA equity-investment closing confirmation](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B005A3297-0000-C375-AEDB-F5A75B5B08B6%7D) — Alpha Generation and Black Volt B 2024 LLC notified New York regulators that ADIA's equity investment closed on May 23, 2025
- [Authoritative transaction closing notice](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B403BFC9C-0000-CA44-9615-25956B0326D0%7D&DocTitle=Notice+of+Transaction+Consummation) — Alpha Generation Topco II, LLC and CPPIB AlphaGen US LLC notified New York regulators that the transaction was consummated on March 9, 2026
- [Pre-closing ownership structure and regulatory approval](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BA01BFB9B-0000-C91F-B9E1-724E88CA2CEF%7D&DocTitle=Declaratory+Ruling+on+Transfer) — ADIA's Black Volt B 2024 LLC held 16.8% of Alpha Generation Super Holdings, ArcLight Energy Partners Fund VII controlled Alpha Generation before the CPP transaction and would retain a majority interest after closing, CPP Investments would acquire a minority interest through CPPIB AlphaGen US LLC
- [Post-closing current ownership evidence](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7BD03EFC9C-0000-C148-94C0-B37A4518CEE4%7D&DocTitle=Redacted+CPPIB+2026+Annual+Report) — CPPIB AlphaGen US LLC filed its required energy-asset report on March 17, 2026, the report identifies Alpha Generation Super Holdings as the developer entity for the AlphaGen assets across NYISO, PJM and ISO-NE
- [Current operating profile, geography and ArcLight relationship](https://www.alphagen.com/about-us/) — AlphaGen owns or operates 26 generation facilities in six U.S. states, the assets are owned by funds managed by ArcLight Capital Partners, the portfolio totals approximately 14,000 MW across PJM, NYISO, ISO-NE and CAISO
- [Formation date and ArcLight infrastructure-strategy basis](https://www.alphagen.com/newsroom/press-releases/arclight-creates-alphagen-to-manage-one-of-the-largest-power-infrastructure-portfolios-in-the-united-states/) — AlphaGen was created to oversee ArcLight's U.S. power infrastructure portfolio, ArcLight formed Alpha Generation, LLC on January 10, 2024, ArcLight identified the platform as part of its value-added electrification infrastructure strategy
- [Canonical legal identity, operating alias and headquarters](https://www.alphagen.com/terms-of-use/) — AlphaGen is the operating name used by the company and its affiliates, the company lists a Houston, Texas corporate address, the legal company is Alpha Generation, LLC
- [CPP Investments transaction announcement and investment mandate](https://www.cppinvestments.com/newsroom/arclight-announces-us1-0-billion-investment-by-cpp-investments-in-alphagen/) — AlphaGen was described as an 11 GW U.S. critical-power infrastructure platform, CPP Investments agreed on October 2, 2025 to invest US$1.0 billion for a strategic minority position, the transaction was subject to regulatory approval and expected to close in the first half of 2026
- [CPP Investments post-closing portfolio confirmation and exit check](https://www.newswire.ca/news-releases/cpp-investments-net-assets-total-793-3-billion-at-2026-fiscal-year-end-814459989.html) — CPP Investments reported that it invested US$1.0 billion for a strategic minority position in AlphaGen alongside ArcLight Capital Partners, the investment was reported as completed activity for the fiscal year ended March 31, 2026
- [ADIA investment announcement and infrastructure-strategy basis](https://www.prnewswire.com/news-releases/arclight-announces-500mm-investment-by-a-wholly-owned-subsidiary-of-adia-in-11-gw-alphagen-power-infrastructure-platform-302348464.html) — ADIA agreed to invest US$500 million in AlphaGen in January 2025, the investment was made by a wholly owned ADIA subsidiary

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
