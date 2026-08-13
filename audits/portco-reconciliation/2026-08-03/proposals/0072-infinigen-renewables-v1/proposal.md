# PortCo proposal — Infinigen Renewables

- Task: 72 (ledger:0072:infinigen-renewables:07524184)
- As of: 2026-08-13
- Actions: CORRECT_COMPANY
- Proposal SHA-256: 0152a61370697336f6867cb2e073e1974898529e5cd1db3b9983b39922d73531
- Production snapshot SHA-256: 70eaff2a53b62c1f1e2f0821dc3a607d4a1445450de72285e52b65e75a2e05f0
- Current company snapshot SHA-256: 75cb439ce97e791190ee6e299e1de98e1bda1a30366366cbaae4e92a570eb221
- After-image SHA-256: d01d8229c29ee533c93613c7ad743fcb497284bffdd51d7cb63598dd209e1ad8

## Recommendation

Correct the existing Infinigen ownership period in place rather than adding the duplicate ArcLight owner proposed by the census queue. Production and evaluated seed already map census manager ArcLight Capital to canonical ArcLight Capital Partners. Current primary evidence identifies Infinigen as wholly owned by an ArcLight-managed fund, while ArcLight identifies Infinigen as a current ArcLight Fund VII portfolio company. Link the existing period to the canonical ArcLight Energy Partners Fund VII, L.P. record, record the 100% platform-level stake, retain the 2021 investment year and CLOSED_ACTIVE state, add the legal LLC alias and current website, and refresh direct identity and ownership evidence. Helios Alternative Energy's retained minority interest is limited to the Oriana and Horizon operating-asset portfolio and is not added as a co-owner of the Infinigen platform. No Infinigen-specific sale or pending exit was identified through August 13, 2026; DigitalBridge's conditional agreement to acquire ArcLight is a manager-level transaction rather than a transfer of Infinigen or Fund VII's stake.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| ArcLight Capital Partners | ArcLight Energy Partners Fund VII, L.P. | ArcLight Energy Partners Fund VII, L.P. | 100% | 2021 | — | CLOSED_ACTIVE |

## Source holdings

- 012-arclight-capital:holding:007:infinigen-renewables

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

- [Current portfolio status, investment year and exit search](https://arclight.com/investments/) — ArcLight lists Infinigen as a current renewable investment, The current listing reports a 2021 investment date and no realization date
- [Exact infrastructure-fund attribution and current portfolio relationship](https://arclight.com/portfolio-services/) — ArcLight identifies Infinigen as ArcLight Fund VII's portfolio company, ArcLight's project-services team is currently supporting Infinigen's Yabucoa solar facility
- [Legal identity, company boundary and current Puerto Rico operating footprint](https://energia.pr.gov/wp-content/uploads/sites/7/2026/03/20260330-AP20230004-Infinigen-Peticion_Intervencion.pdf) — A March 2026 Puerto Rico Energy Bureau filing identifies Infinigen Renewables, LLC, The filing identifies Oriana Energy, Horizon Energy, YFN Yabucoa Solar, Infinigen Asset Management and Infinigen O&M as entities beneath the platform boundary, The filing reports two operating solar plants totaling 73.2 MW and a 32.1 MW solar plus 15 MW battery project under development
- [Subsequent transaction and exit-boundary check](https://www.digitalbridge.com/news/2026-05-27-digitalbridge-and-arclight-announce-strategic-combination-to-form-a-leading-alternative-asset-manager-at-the-convergence-of-power-ai-and-digital-infrastructure) — DigitalBridge's agreement to acquire ArcLight remains subject to closing conditions, The announced manager-level transaction does not establish a sale or transfer of Infinigen or ArcLight Fund VII's stake
- [Asset-level minority-interest boundary](https://www.heliosae.com/projects) — Helios reports a minority interest in the Puerto Rico operating solar portfolio, The disclosed interest concerns the Oriana and Horizon projects rather than ownership of the Infinigen Renewables platform
- [Launch, investment date, completed initial acquisition and infrastructure-strategy basis](https://www.prnewswire.com/news-releases/arclight-launches-infinigen-renewables-platform-301447102.html) — ArcLight launched Infinigen on December 16, 2021 with a $400 million capital commitment, Infinigen had completed its initial acquisition of the 73.2 MW Oriana and Horizon operating solar portfolio, The platform develops and operates renewable infrastructure across North America, Central America and the Caribbean
- [Direct current ownership, stake, headquarters and operating-profile evidence](https://www.prnewswire.com/news-releases/infinigen-renewables-announces-strategic-solar-battery-storage-project-in-puerto-rico-302118849.html) — Infinigen described itself as a wholly owned subsidiary of a fund managed by ArcLight, The company develops and operates utility-scale and commercial-and-industrial solar and battery infrastructure, The release places Infinigen in San Juan, Puerto Rico

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
