# PortCo proposal — Rio Grande LNG

- Task: 151 (ledger:0151:rio-grande-lng:e7985cce)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: e882f7bce6a6ab08a71eb270bacd169040e9fcb925fc55a5423cf48beb4d4ab3
- Production snapshot SHA-256: 1436894b0ee2c6c670665780fbf31f1707fa649ceb0f8588780690ba4359e7bf
- Current company snapshot SHA-256: e8465b2d7afc902882bed28c72b3a33a5018dae45496d0c43db5429e3499c9a9
- After-image SHA-256: 3c5ae10865937e7cbd4bdf1979a9fa89ea1dbf7f70fb5d7aa7a18b11136174b3

## Recommendation

Retain one Rio Grande LNG terminal record and correct its multi-vehicle ownership. GIP, GIC and Mubadala acquired Phase 1 interests at the July 12, 2023 closing and reinvested in Trains 4 and 5. NextDecade and TotalEnergies remain project equity partners, and XRG acquired partial interests from GIP in transactions that closed in September 2025 and July 2026. Those were partial sell-downs, not a GIP exit. BlackRock's acquisition of GIP changed the manager's corporate parent but did not create a separate BlackRock or GEPIF III terminal stake. Train and holding entities remain subordinate project vehicles within the one terminal record.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| GIC | — | Devonshire Investment Pte. Ltd. | Phase 1 minimum 9.85%; Train 4 7.9%; Train 5 included in 13.2% combined GIC/Mubadala interest | 2023 | — | CLOSED_ACTIVE |
| GIP | — | GIP V Velocity Acquisition Partners, L.P.; GIM Participation Velocity, L.P.; GIP V Velocity Aggregator, L.P.; Train 4 and Train 5 analogues | Phase 1 minimum 46.12% and Trains 4/5 36.9% at entry; current residual not publicly disclosed after XRG partial sell-downs | 2023 | — | CLOSED_ACTIVE |
| Mubadala | — | MIC TI Holding Company 2 RSC Limited | Phase 1 minimum 6.57%; Train 4 5.2%; Train 5 included in 13.2% combined GIC/Mubadala interest | 2023 | — | CLOSED_ACTIVE |
| NextDecade Corporation | — | NextDecade LNG, LLC and project affiliates | Phase 1 up to 20.79%; Train 4 40%; Train 5 50% at entry | 2023 | — | CLOSED_ACTIVE |
| TotalEnergies | — | TotalEnergies project investment affiliates | Phase 1 16.67%; Train 4 10% | 2023 | — | CLOSED_ACTIVE |
| XRG P.J.S.C. | — | Raven Holding Company LLC and Train 4/5 acquisition affiliate | Phase 1 11.7%; Trains 4/5 7.6% aggregate | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- 047-gic:holding:010:rio-grande-lng
- 048-global-infrastructure-partners:holding:007:rio-grande-lng

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

- [Train 4 equity split](https://corporate.totalenergies.us/news/totalenergies-reaches-final-investment-decision-its-partners-rio-grande-lng-train-4-10-direct) — Train 4's disclosed entry split included 36.9% GIP, 7.9% GIC, 5.2% Mubadala, 10% TotalEnergies and 40% NextDecade
- [Train 5 vehicles and ownership split](https://www.energy.gov/sites/default/files/2025-11/RGLNG%205%20CIC.pdf) — Train 5's disclosed entry split included 36.9% GIP and 13.2% combined GIC and Mubadala interests
- [Train 4, Train 5 and XRG Phase 1 transaction evidence](https://www.energy.gov/sites/default/files/2026-01/Rio%20Grande%20LNG%202026%20CIC%20Response%20Letter%20-%20FINAL.pdf) — XRG's 11.7% Phase 1 acquisition from GIP closed on September 22, 2025, the Train 4 and Train 5 ownership transactions closed in 2025
- [Phase 1 closing, owners, vehicles and stakes](https://www.federalregister.gov/documents/2023/09/05/2023-19051/change-in-control-rio-grande-lng-llc) — GIP, GIC and Mubadala invested through the disclosed vehicles and percentages, the Phase 1 ownership transaction closed on July 12, 2023
- [Second XRG partial sell-down closing](https://xrg.com/en/news/XRG-Strengthens-US-LNG-Position-with-Second-Rio-Grande-LNG-Transaction-Completion) — XRG completed a 7.6% acquisition across Trains 4 and 5 from a GIP vehicle on July 2, 2026, the transaction was a partial GIP sell-down rather than a complete exit

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
