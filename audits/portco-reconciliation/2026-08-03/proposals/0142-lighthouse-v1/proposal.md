# PortCo proposal — Excelsior U.S. Solar & Storage Portfolio

- Task: 142 (ledger:0142:excelsior-u-s-solar-and-storage-portfolio:ec48f1c5)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER, MERGE_COMPANIES
- Proposal SHA-256: 68de232f7ca0c596a042ddaa0df73e94cc329c4283020638c4fbe20ba05ac8b6
- Production snapshot SHA-256: 9c5e1a3ba07b0807208e6db0c2332d1696eb23e2e045ee315d11f30431d707f9
- Current company snapshot SHA-256: ae09df241eb0d5c1c0d4ba0261fdc6ed8ef62346eee2a3f752fa7c89564684ec
- After-image SHA-256: c614aa02bfa4e2034bf7cfa8b13fa36bc865d052f4d0dcab72169dd321b656e7

## Recommendation

Merge the duplicate Lighthouse and Excelsior U.S. Solar & Storage Portfolio records into the existing Excelsior production ID, renamed Lighthouse with the former display name retained as an alias. Buyer, seller and adviser evidence identify one 38-project, 89 MWDC operating solar and solar-plus-storage portfolio across six U.S. states. BlackRock's Evergreen strategy signed the acquisition in November 2023 and closed it in December 2023; Excelsior's March 2024 release was a later disclosure, not the ownership entry date. The duplicate BlackRock ownership periods and signing milestones are consolidated, Excelsior is retained as the former owner, and no GIP ownership period is created because BlackRock's later acquisition of the GIP manager did not transfer the portfolio.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| BlackRock | Evergreen Infrastructure Fund | Evergreen Infrastructure Fund | Acquired 100% of Excelsior's membership interests; total project-level economic percentage not publicly disclosed | 2023 | — | CLOSED_ACTIVE |
| Excelsior Energy Capital | — | Excelsior Renewable Energy Investment Fund I LP | Sold 100% of its membership interests; total project-level economic percentage not publicly disclosed | — | 2023 | REALIZED |

## Source holdings

- 023-blackrock:holding:010:excelsior-u-s-solar-and-storage-portfolio

## Retired company records

- cmrxpj8zq00n9ivhed9tgikrv

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpkwkg031aivheflvs0dd9 | cmrxpkw9x030vivheldsxdx9k | Both milestones describe BlackRock signing the Lighthouse acquisition in November 2023 and are consolidated into one corrected signing milestone. |
| OWNERSHIP_PERIOD | cmrxpjuac01kpivhefe29onwu | cmrxpju7s01kkivheqy4idfr6 | Both rows describe the same BlackRock Evergreen acquisition of the same Lighthouse portfolio; one corrected canonical period preserves the ownership history without double-counting. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Seller exit and portfolio-boundary evidence](https://excelsiorcapital.com/news-insights/excelsior-energy-capital-sells-sub-portfolio-of-solar-and-solar-plus-storage-assets-to-blackrock/) — Excelsior sold the same 38-project 89 MW solar and storage portfolio to BlackRock, the March 2024 page is a disclosure of the completed sale
- [Buyer identity and signing evidence](https://www.businesswire.com/news/home/20231115151975/en/BlackRocks-Evergreen-Infrastructure-Fund-Partners-with-European-Institutional-Investors-to-Invest-in-Energy-Transition-and-Energy-Security) — BlackRock identified the portfolio as Lighthouse, Evergreen signed definitive documentation to acquire the operating portfolio in November 2023
- [Closing, seller, stake and footprint evidence](https://www.key.com/businesses-institutions/our-transactions/deals.excelsior-energy-capital.html) — Excelsior sold 100% of its membership interests, the portfolio comprised 38 operating projects totaling 89 MWDC across six states, the sale closed in December 2023

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
