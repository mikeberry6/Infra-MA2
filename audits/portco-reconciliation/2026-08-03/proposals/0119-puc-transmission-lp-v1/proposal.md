# PortCo proposal — PUC Transmission LP

- Task: 119 (ledger:0119:puc-transmission-lp:5441ac76)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 6c1c7770b52e182e79e6441c631751f620dae3a37494d884ff94484ea395c320
- Production snapshot SHA-256: 611533ecc9cf66d6be4eb78dc82458fc27828f66d0c931fe9b5890d2961b4ded
- Current company snapshot SHA-256: f9ba89ffd7fe8d126275bde677cb7bc056cebc34b5e9b9a32e926d0b66c8307f
- After-image SHA-256: 187ed29245db53534e016529f114f490d77153b68300560d2fc91d832a151c71

## Recommendation

Reject the queued ADD_PENDING_TRANSACTION action and correct the existing PUC Transmission LP record. Axium's September 25, 2024 release states that a managed fund had acquired an 80% equity interest, and the Ontario Energy Board's December 31, 2024 ownership schedule places that interest beneath Axium Infrastructure Canada II Limited Partnership through Axium TransCo GP Inc. and Axium TransCo LP. PUC Inc. retains the 20% balance. The May 2024 municipal reference to a later project close concerns scheduled equity funding for construction, not an unclosed Axium acquisition. Remove the unsupported generic AxInfra Fund I-IV / Axium Managed Funds attribution, preserve AIC II / Axium TransCo as the disclosed vehicle chain, add PUC Inc. as an unlinked municipal co-owner, and create no pending transaction. The OEB granted leave to construct on August 27, 2024 and issued licence ET-2021-0088 on April 10, 2025 after its October 2021 conditional approval. Current company materials report a C$230 million, two-400-MVA-circuit project targeting Q1 2028 completion. No later sale, ownership transfer, signed pending exit, cancellation, abandonment or licence revocation was identified through August 18, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Axium Infrastructure | — | Axium Infrastructure Canada II Limited Partnership / Axium TransCo LP | 80% | 2024 | — | CLOSED_ACTIVE |
| PUC Inc. | — | PUC (Transmission) LP Inc. / PUC (Transmission) GP Inc. | 20% | 2021 | — | CLOSED_ACTIVE |

## Source holdings

- 019-axium-infrastructure:holding:031:puc-transmission-lp

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

- [Current identity, scale, customer and schedule.](https://puctransmissionlp.com/faqs/faqs/) — Construction completion is expected in Q1 2028 and energization in January 2028, The project is approximately C$230 million with two 400 MVA circuits and about 300 MW of new Algoma Steel load
- [Current construction activity and completion schedule.](https://puctransmissionlp.com/news/ViewOneBooking/?id=8) — Construction was expected to begin in spring 2026 and finish in Q1 2028, PUC selected S.&T. Electrical in May 2026
- [PUC Inc. minority equity and project-funding context.](https://saultstemarie.ca/wp-content/uploads/2025/07/2024_05_13-Minutes.pdf) — PUC Inc. was authorized to contribute the 20% equity balance, The later project close refers to scheduled project equity funding rather than an unclosed Axium ownership transfer
- [Completed acquisition, 80% stake, PUC partnership and infrastructure-strategy basis.](https://www.axiuminfra.com/2024/09/25/september-25-2024-axium-infrastructure-acquires-80-equity-interest-in-regulated-transmission-facilities-to-be-built-in-ontario/?lang=en) — Axium said one of its managed funds had acquired an 80% equity interest on September 25, 2024, PUC TransCo was owned in partnership with PUC Inc.
- [Leave-to-construct decision and entity boundary.](https://www.rds.oeb.ca/CMWebDrawer/Record/863301/File/document) — PUC Transmission and Hydro One Sault Ste. Marie LP have distinct project responsibilities, The OEB granted PUC (Transmission) LP leave to construct on August 27, 2024
- [Post-acquisition ownership chain and fund/vehicle attribution.](https://www.rds.oeb.ca/CMWebDrawer/Record/882184/File/document) — Axium TransCo GP Inc. and Axium TransCo LP hold 80% of PUC (Transmission) LP, The December 31, 2024 schedule identifies Axium Infrastructure Canada II Limited Partnership
- [Conditional approval and actual licence issuance.](https://www.rds.oeb.ca/CMWebDrawer/Record/894912/File/document) — The OEB issued electricity transmission licence ET-2021-0088 on April 10, 2025, The October 21, 2021 decision conditionally approved the application

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
