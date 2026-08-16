# PortCo proposal — Rover Pipeline

- Task: 91 (ledger:0091:rover-pipeline:32747256)
- As of: 2026-08-15
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 7239da5d04940a4a6fb5d9f3f9418dfaf9e3783338507111ac0fc077a2024ef0
- Production snapshot SHA-256: b9590a3937ac3662b8a69297072c06c23d44b0c81e5266e73c40254274cbb838
- Current company snapshot SHA-256: bc8d6810f4d94679aae997402e0c06cbd039464d027da976776c2217d20d80bb
- After-image SHA-256: 74200458c539a2da8c79dcf8de4d42a0d76e0f694ab86b5e3abf67afe9f4f7e9

## Recommendation

Correct the existing Rover Pipeline record in place after a fresh GPT-5.6 Sol Pro review and independent source verification. The canonical operating company is Rover Pipeline LLC. The 2017 legal ownership bridge shows ET Rover Pipeline LLC owned 65% of Rover, Energy Transfer retained 50.1% of that holding company and Blackstone's BCP Renaissance vehicle acquired 49.9%, producing effective Rover interests of approximately 32.6% and 32.44%, respectively; Traverse held the remaining 35%. Ares Core Infrastructure Fund acquired Blackstone's vehicles on April 28, 2026 and publicly described the acquired Rover stake as 32.4%. ePointZero closed its acquisition of Traverse Midstream Partners, including its 35% Rover interest, on July 14, 2026. Add Energy Transfer LP and ePointZero as current owners, retain Ares as current and Blackstone as realized, and correct the company profile, milestones and sources. Do not create duplicate PortCos for ET Rover Pipeline LLC, BCP Renaissance, Traverse, pipeline segments or the separately owned Ohio River System. No later Rover-level sale or signed pending ownership transfer was identified through August 15, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Ares Management | Ares Core Infrastructure Fund (ACI) | BCP Renaissance Parent L.L.C. / BCP Renaissance L.L.C. | 32.4% indirect interest in Rover Pipeline | 2026 | — | CLOSED_ACTIVE |
| Blackstone | — | BCP Renaissance L.L.C. (guaranteed by Blackstone Energy Partners II L.P. and Blackstone Capital Partners VII L.P.) | 32.44% indirect interest in Rover Pipeline (49.9% of ET Rover Pipeline LLC, which owned 65% of Rover) | 2017 | 2026 | REALIZED |
| Energy Transfer LP | — | ET Rover Pipeline LLC | 32.6% economic interest in Rover Pipeline | — | — | CLOSED_ACTIVE |
| ePointZero | — | Traverse Midstream Partners, LLC | 35% | 2026 | — | CLOSED_ACTIVE |

## Source holdings

- 014-ares-management:holding:015:rover-pipeline

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

- [Current ePointZero ownership through Traverse](https://apigateway.adx.ae/adx/cdn/1.0/content/download/5174320) — The acquired interests include 35% of Rover Pipeline, ePointZero closed its acquisition of Traverse Midstream Partners on July 14, 2026
- [Blackstone legal closing](https://ir.energytransfer.com/news-releases/news-release-details/energy-transfer-announces-closing-previously-announced-sale-3244) — Energy Transfer closed Blackstone's 49.9% holding-company acquisition on October 31, 2017, The holding company continued to own 65% of Rover Pipeline LLC
- [Blackstone transaction announcement](https://ir.energytransfer.com/news-releases/news-release-details/energy-transfer-announces-sale-3244-stake-entity-rover-pipeline) — Energy Transfer announced the Blackstone transaction on July 31, 2017, The official release described the effective Rover stake as 32.44%
- [Ares entry, Blackstone exit and operating scale](https://www.blackstone.com/news/press/ares-acquires-stake-in-rover-pipeline-from-blackstone-energy-transition-partners-to-serve-growing-energy-demand-centers-across-north-america/) — Ares Infrastructure Opportunities acquired Blackstone Energy Transition Partners' 32.4% Rover stake, Blackstone's Rover ownership began in 2017 and ended with the Ares acquisition, Rover spans approximately 700 miles and has 3.425 Bcf per day of capacity
- [Operating profile and current asset page](https://www.energytransfer.com/operations/natural-gas/rover-pipeline/) — Energy Transfer maintains the current official asset page, Rover is an operating interstate natural-gas transmission system across Pennsylvania, West Virginia, Ohio and Michigan
- [2017 legal ownership bridge and Blackstone vehicles](https://www.sec.gov/Archives/edgar/data/1161154/000116115417000037/ex21contributionagreementd.htm) — Blackstone Capital Partners VII and Blackstone Energy Partners II guaranteed the acquisition vehicle, ET Rover Pipeline LLC owned 65% of Rover Pipeline LLC and Traverse Midstream Partners owned 35%, Energy Transfer retained 50.1% of ET Rover Pipeline LLC and BCP Renaissance acquired 49.9%, producing effective Rover interests of approximately 32.6% and 32.44%
- [Current Energy Transfer ownership](https://www.sec.gov/Archives/edgar/data/1276187/000127618726000021/ex991eterq12026.htm) — Energy Transfer reported a 32.6% economic interest in Rover in its May 2026 SEC-filed quarterly results
- [Ares fund, vehicles and legal close](https://www.sec.gov/Archives/edgar/data/2031750/000162828026029840/aci-20260428.htm) — Ares Core Infrastructure Fund acquired BCP Renaissance Parent and BCP Renaissance on April 28, 2026, The acquired vehicle held 49.9% of ET Rover Pipeline LLC

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
