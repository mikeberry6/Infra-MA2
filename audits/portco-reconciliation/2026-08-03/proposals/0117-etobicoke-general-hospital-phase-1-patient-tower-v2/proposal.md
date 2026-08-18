# PortCo proposal — Etobicoke General Hospital (Phase 1 Patient Tower)

- Task: 117 (ledger:0117:etobicoke-general-hospital-phase-1-patient-tower:95d7434e)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: 8cb9daeb6b6c4fae2b559364c81ff4e26f89e4f0aad731a94cb42121a7d78f4f
- Production snapshot SHA-256: f90c96047bfeeac8701499cc95a4f4f67a74b2dbec15a3c095d32c075a63c2ae
- Current company snapshot SHA-256: 382335b362c205ae6774057f5e8f850fa6671eeaeec3a681a5d046a62b0eb8eb
- After-image SHA-256: 8f864492bf3c5f58c39d07a540afbe868e7ed62c75e527f501efa3f73dcdb1b4

## Recommendation

Etobicoke Healthcare Partnership LP is the DBFM project company and concessionaire for the Etobicoke General Hospital Phase 1 Patient Tower; the tower and redevelopment names describe the physical project and are not a second manager-level PortCo. Infrastructure Ontario's current project page identifies Etobicoke Healthcare Partnership as the winning bidder and Axium Infrastructure Canada and DIF Infra 4 Canada Ltd. as developers. The May 2016 Axium release directly identifies Axium Infrastructure Canada II L.P. and DIF Infrastructure IV as the equity sponsors. Lexpert records May 6, 2016 financial close with Etobicoke Healthcare Partnership LP and names DIF Infra 4 Canada Ltd. Exact sponsor percentages are not publicly disclosed. Ontario's official June 28, 2016 release records up to C$358 million of provincial investment in the hospital expansion, so the existing supported milestone is preserved rather than dropped during the merge. William Osler Health System's audited statements for the year ended March 31, 2026 continue to identify Etobicoke Healthcare Partnership as responsible for operating and maintaining the building and state that the project assets transfer to Osler in July 2048. Axium's 2024 PAI statement includes Etobicoke General Hospital among its investee assets. No later project-level sponsor sale, equity transfer, signed pending exit or concession termination was identified through August 18, 2026. CVC's July 2024 acquisition and rebrand of DIF Capital Partners was a manager-level transaction, with individual infrastructure strategies and fund names unchanged. Accordingly, keep the existing Etobicoke Healthcare Partnership company, retire and redirect the phase/project-name duplicate, preserve Axium and CVC DIF once as active 2016 owners with their verified vehicles, preserve the supported Ontario funding milestone, and supersede Task 203 only after release, application and production verification.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Axium Infrastructure | — | Axium Infrastructure Canada II L.P. | — | 2016 | — | CLOSED_ACTIVE |
| CVC DIF | DIF Infrastructure IV | DIF Infra 4 Canada Ltd. | — | 2016 | — | CLOSED_ACTIVE |

## Source holdings

- 019-axium-infrastructure:holding:019:etobicoke-general-hospital-ppp

## Retired company records

- cmrxpj7yf00lkivhen7juixyw

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpks0e02vqivhe4afmjp54 | cmrxplepl03n9ivhe33bwydf6 | The generic 2016 sponsor milestone and canonical May 6 financial-close milestone describe the same entry event. Preserve the canonical milestone with the exact close date and both verified equity sponsors. |
| MILESTONE | cmrxpks0w02vrivheeuwvxd5v | cmrxplepl03n9ivhe33bwydf6 | The May 13 manager announcement describes the same May 6 legal financial close. Consolidate it into the exact canonical close milestone rather than retaining a duplicate announcement event. |
| OWNERSHIP_PERIOD | cmrxpjt1401inivhebczspbl2 | cmrxpjyf201raivhex8v9q5uj | Both periods describe the same current DIF Infrastructure IV investment. Preserve the canonical CVC DIF period, correct its disclosed vehicle to DIF Infra 4 Canada Ltd., and remove the duplicate period from the retired project-name record. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Preserved June 28, 2016 provincial funding milestone](https://news.ontario.ca/en/release/40938/ontario-investing-358-million-in-new-infrastructure-at-etobicoke-general-hospital) — Ontario announced up to C$358 million of investment in the hospital expansion on June 28, 2016, the release identifies the four-storey, approximately 250,000-square-foot project and Etobicoke Healthcare Partnership as the preferred proponent
- [Direct manager evidence for both equity sponsors and the PPP boundary](https://www.axiuminfra.com/wp-content/uploads/2016/12/EN_2016-06-13-Press-Release-Etobicoke_May-2016_website-only_en.pdf) — Axium Infrastructure Canada II L.P. and DIF Infrastructure IV are the equity sponsors, Etobicoke Healthcare Partnership is the project consortium, Walsh and ENGIE/Equans are service providers rather than owners
- [Current Axium investment-universe evidence](https://www.axiuminfra.com/wp-content/uploads/2025/06/Principal-Adverse-Impacts-%E2%80%93-AIC-II-vF.pdf) — Axium's 2024 Principal Adverse Impact Statement includes Etobicoke General Hospital among investee assets
- [Current manager alias and non-project-level transaction treatment](https://www.cvc.com/media/news/2024/2024-07-03-completion-of-cvc-dif-and-acquisition-of-final-stake-in-cvc-secondary-partners/) — DIF Capital Partners was rebranded CVC DIF in July 2024, individual strategies and fund names remained unchanged, the manager transaction does not establish an EHP equity sale
- [Exact May 6, 2016 contract award and financial-close event](https://www.infrastructureontario.ca/en/news-and-media/news/etobicoke-general-hospital-redevelopment---phase-1/contract-awarded-for-etobicoke-general-hospital-redevelopment/) — Infrastructure Ontario and William Osler awarded the DBFM contract to Etobicoke Healthcare Partnership on May 6, 2016, the contract value was C$330 million
- [Current canonical project-company boundary, DBFM structure, developer identities, scale and completion date](https://www.infrastructureontario.ca/en/what-we-do/projectssearch/etobicoke-general-hospital-redevelopment/) — Axium Infrastructure Canada and DIF Infra 4 Canada Ltd. are the developers, Etobicoke Healthcare Partnership is the winning bidder/project company, construction ended on February 19, 2019, the project is a C$330 million, approximately 250,000-square-foot, four-storey patient tower
- [Legal project-company name, exact close date and DIF vehicle](https://www.lexpert.ca/big-deals/etobicoke-general-hospital-phase-1-patient-tower-project-reaches-financial-close/350715) — Etobicoke Healthcare Partnership LP reached financial close on May 6, 2016, equity was provided by Axium Infrastructure Canada II Limited Partnership and DIF Infra 4 Canada Ltd., the project company receives availability payments over a 30-year period
- [Current audited operating and concession evidence](https://www.williamoslerhs.ca/media/erle1yzb/2025-26-financial-statements_aoda.pdf) — as of March 31, 2026 Etobicoke Healthcare Partnership remained responsible for operating and maintaining the building, substantial completion occurred in February 2019, the project assets transfer to William Osler Health System in July 2048

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
