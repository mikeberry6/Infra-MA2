# PortCo proposal — DataBank

- Task: 110 (ledger:0110:databank:4928f3e2)
- As of: 2026-08-18
- Actions: CORRECT_COMPANY, ADD_OWNER
- Proposal SHA-256: 620469277d740d5970323532ca551d5f88e00b4b7cc27755fc41f86cc5f664f5
- Production snapshot SHA-256: fd9ccd896abeec99e6b39f98e29eb1dd9ddadfa73488e2c5df030fab7291b75c
- Current company snapshot SHA-256: 0f7651728803ed929b34a92aa43eecf6c44c717c91ab37db25e4bbe6f173ea5c
- After-image SHA-256: bf10acdea941085dc0e9a0eb853e87da533aa0749034d8241ce6be4532f7f2c5

## Recommendation

Correct the existing DataBank record in place and resolve the reciprocal DataBank Holdings candidate to the same canonical company. DataBank's live investor page, transaction releases and current filings support seven current manager-universe associations: DigitalBridge, Swiss Life Asset Managers, IMCO, AustralianSuper, Northleaf Capital Partners, Ardian and CBRE Investment Management. Northleaf, Ardian and CBRE Investment Management are omitted from the current record and must be added; the existing Swiss Life period must be corrected to Swiss Life Asset Managers. DigitalBridge directly disclosed a continuing 7.8% stake after the January 2025 secondary. The 2022 consortium acquired a collective 35% interest, but individual percentages were not disclosed, so that aggregate is not allocated among Swiss Life, Northleaf or Ardian. DataBank brands TIAA's investment manager as Nuveen, while the TIAA Real Estate Account directly reports a 14.8% beneficial stake through DigitalBridge Zeus vehicles. That evidence does not support a separate Nuveen Infrastructure period, and InfraBridge has no separate DataBank equity evidence. TIAA, EDF Invest and TJC are current co-owner context outside the supplied manager universe and are retained in the narrative rather than added as manager-task ownership rows. The January 2025 secondary did not identify every seller, so no other period is retired by inference. No later full sale or signed pending exit was identified through August 18, 2026.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Ardian | — | — | Member of the 35% 2022 consortium; individual percentage not publicly disclosed | 2022 | — | CLOSED_ACTIVE |
| AustralianSuper | AustralianSuper Infrastructure Portfolio | — | Significant minority interest; exact percentage not publicly disclosed | 2024 | — | CLOSED_ACTIVE |
| CBRE Investment Management | — | — | Exact entry date, vehicle and percentage not publicly disclosed | — | — | CLOSED_ACTIVE |
| DigitalBridge | DigitalBridge Partners, LP | — | 7.8% after the January 2025 secondary | 2016 | — | CLOSED_ACTIVE |
| IMCO | — | — | Exact percentage not publicly disclosed | 2022 | — | CLOSED_ACTIVE |
| Northleaf Capital Partners | — | — | Member of the 35% 2022 consortium; individual percentage not publicly disclosed | 2022 | — | CLOSED_ACTIVE |
| Swiss Life Asset Managers | — | — | Member of the 35% 2022 consortium; individual percentage not publicly disclosed | 2022 | — | CLOSED_ACTIVE |

## Source holdings

- 018-australian-super:holding:001:databank
- 036-digitalbridge:holding:005:databank
- 057-imco:holding:003:databank
- 091-swiss-life-asset-managers:holding:002:databank

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

- [DigitalBridge continuing stake and January 2025 secondary](https://ir.digitalbridge.com/news-releases/news-release-details/digitalbridge-announces-participation-databank-financing) — DigitalBridge disclosed that the secondary adjusted its DataBank ownership to 7.8%, DigitalBridge stated that it planned to continue holding the 7.8% interest
- [Founding, canonical history and platform boundary](https://www.databank.com/about-databank/databanks-history/) — DataBank Ltd. was founded in Dallas in 2005, The company identifies the July 2016 DigitalBridge-led acquisition as a key platform transition
- [Current investor roster, manager identities and Nuveen-TIAA branding context](https://www.databank.com/about-databank/our-investors/) — DataBank's live page lists DigitalBridge, Swiss Life Asset Managers, AustralianSuper, EDF Invest, Nuveen, TJC, Northleaf, IMCO, CBRE Caledon and Ardian as investors, The page describes Nuveen as TIAA's investment manager and does not identify a Nuveen Infrastructure vehicle
- [AustralianSuper investment announcement, minority status and growth scale](https://www.databank.com/resources/press-releases/databank-announces-2-0-billion-equity-raise-led-by-1-5-billion-investment-from-australiansuper/) — AustralianSuper committed $1.5 billion in the October 15, 2024 equity raise and was described as becoming a significant minority owner upon closing, The current investor page confirms AustralianSuper is now an investor
- [Current sponsor continuity, operating profile and disclosed scale](https://www.databank.com/resources/press-releases/databank-announces-ceo-succession-as-company-enters-next-phase-of-scale-and-expansion/) — DataBank identified DigitalBridge as lead investor and cited continuing support from DigitalBridge, Swiss Life Asset Management and AustralianSuper in May 2026, DataBank reported more than 70 sites, more than 25 markets, more than 2,200 customers and more than $1 billion of revenue
- [2022 consortium close, infrastructure-strategy basis and collective stake](https://www.databank.com/resources/press-releases/databank-completes-first-phase-of-major-recapitalization/) — Swiss Life Asset Management, EDF Invest, Northleaf and Ardian closed a collective 35% fully diluted interest on August 30, 2022, The source does not disclose individual consortium-member percentages
- [DigitalBridge acquisition date, predecessor seller and 2016 investor group](https://www.databank.com/resources/press-releases/digital-bridge-acquires-databank-launches-data-center-platform/) — Digital Bridge acquired DataBank from Avista Capital Partners on July 13, 2016, TIAA, Allstate Investments and The Edgewater Funds participated in the acquisition
- [January 2020 secondary, Edgewater exit and Nuveen-branded TIAA continuation](https://www.databank.com/resources/press-releases/wall-street-journal-databank-announces-185-million-equity-investment-from-colony-capital/) — Colony bought secondary interests from Edgewater and Allstate in January 2020, Edgewater fully exited, Allstate retained half of its prior interest and Nuveen continued its original stake
- [IMCO entry timing and infrastructure-strategy basis](https://www.imcoinvest.com/imco-announces-IMCO-signs-agreement-to-acquire-equity-interest-in-databank/index.html) — DataBank's live investor page and the completed recapitalization evidence support continuing ownership, IMCO signed an agreement on October 3, 2022 to invest up to $450 million in DataBank
- [Completed 2023 recapitalization and continuing DigitalBridge, Swiss Life, EDF and IMCO exposure](https://www.sec.gov/Archives/edgar/data/1679688/000167968823000099/draftdbrgdatabankrecapcomp.htm) — DigitalBridge completed the recapitalization on September 14, 2023 and reduced its stake to 9.87% at that time, The filing identifies Swiss Life Asset Management, EDF Invest and IMCO as continuing investors
- [TIAA beneficial ownership, vehicle and Nuveen Infrastructure exclusion](https://www.sec.gov/Archives/edgar/data/946155/000094615526000069/tiaareal-20260331.htm) — The TIAA Real Estate Account held 14.8% of DataBank as of March 31, 2026, The investment is held through DigitalBridge Zeus Partners vehicles and is not identified as a Nuveen Infrastructure investment

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
