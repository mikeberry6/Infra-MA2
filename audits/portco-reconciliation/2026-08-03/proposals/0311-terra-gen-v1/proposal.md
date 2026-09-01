# PortCo proposal — Terra-Gen

- Task: 311 (ledger:0311:terra-gen:621138d4)
- As of: 2026-09-01
- Actions: CORRECT_COMPANY, ADD_OWNER, ADD_PENDING_TRANSACTION
- Proposal SHA-256: e284db073d19172fb4b7527510a8434bbb1a9a4c2665c56c0456541c0684675f
- Production snapshot SHA-256: 5f93fae945d03934e8fb080b0526c23373a860a4cf2d86486946025f3c5c36c2
- Current company snapshot SHA-256: c97215363975b779874e2d5286e746c74204c3fcb63c91aeaf346c24944dcfdd
- After-image SHA-256: fe13fd08c2bd155e4f7e30faebc25e94832b857e04a1be75659d084196ecbea3

## Recommendation

Correct Terra-Gen to preserve its full ownership history and current 50/50 legal ownership. Regulatory and company sources establish Igneo's GDIF chain at 50% and Masdar at 50%, with ArcLight, Global Infrastructure Partners and Energy Capital Partners as former sponsors. Pantheon Infrastructure Plc committed to a Terra-Gen-specific co-investment through an Igneo-managed vehicle in June 2026, but no public source establishes closing, funding, a stake or a reduction of Igneo's 50%; it is therefore recorded only as a signed pending incoming transaction. No later corporate ownership change or exit was identified through August 19, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | — | — | Controlling former sponsor; exact percentage not publicly disclosed | 2007 | 2015 | REALIZED |
| Energy Capital Partners | — | ECP III | 100% before Igneo's 2020 entry; 60% until March 2021 | 2015 | 2021 | REALIZED |
| Energy Capital Partners | — | ECP Terra-Gen Growth Fund, LP / Fund B, LP | 50% | 2021 | 2024 | REALIZED |
| Global Infrastructure Partners | — | Convertible preferred investment | Up to 40% | 2009 | 2015 | REALIZED |
| Igneo Infrastructure Partners | Global Diversified Infrastructure Fund (GDIF) | Golden NA Power Hold Co. LLC > Golden NA Power Holdings LLC | 50% | 2020 | — | CLOSED_ACTIVE |
| Masdar | — | Masdar TG Holding LLC + Masdar TG Merger Corporation | 50% | 2024 | — | CLOSED_ACTIVE |

## Source holdings

- 056-igneo-infrastructure-partners:holding:009:terra-gen
- 077-pantheon-ventures:holding:001:terra-gen

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

- [Current legal chain, cap table and platform boundary](https://documents.dps.ny.gov/public/Common/ViewDoc.aspx?DocRefId=%7B90212793-0000-CC39-A8FF-DBA29A84F19B%7D) — Igneo's GDIF ownership chain holds 50% of Terra-Gen, Masdar's acquisition chain holds the other 50%, Project SPVs remain beneath the Terra-Gen platform
- [Masdar closing and retained Igneo ownership](https://terra-gen.com/masdar-accelerates-u-s-renewables-expansion-closes-acquisition-of-50-stake-in-terra-gen/) — Igneo retained its 50% interest, Masdar closed its 50% acquisition on October 1, 2024
- [ECP ownership history and 2021 continuation transaction](https://www.ecpgp.com/about/news-and-insights/press-releases/2021/ecp-announces-successful-closing-of-12-billion-continuation-fund-for-renewables-platform-terra-gen) — ECP III acquired Terra-Gen in 2015 and exited in the 2021 continuation transaction, The continuation vehicle held 50% after Igneo increased to 50%
- [Pantheon company-specific co-investment commitment](https://www.londonstockexchange.com/news-article/PINT/investment-in-us-renewable-energy-company/17649609) — Pantheon Infrastructure committed to a Terra-Gen investment through an Igneo-managed vehicle, The announcement does not establish closing, funding or a percentage stake

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
