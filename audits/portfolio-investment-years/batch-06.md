# Batch 06 - Actis, AIMCo, and Argo cleanup

Run date: 2026-05-02

Audit after batch:
- Owner-company rows: 1,314
- Flagged rows: 525
- Priority split: 80 critical, 133 high, 291 medium, 21 low

## Implemented Changes

### Catalyze / Actis
- Stored owner year: 2023; top-level year: 2023.
- Decision: unchanged, high-conviction announcement fallback.
- Date basis: announcement fallback. The Actis release dated February 28, 2023 says Actis would acquire a co-control stake in Catalyze and provide equity capital from Energy Fund 5.
- Change made: relabeled the Actis release as `Announcement date source - Actis - Catalyze` and reworded the June 2021 REenergyze milestone as non-transactional context so it does not appear to predate Actis's investment.
- Source: https://www.act.is/2023/02/28/actis-and-encap-invest-in-us-solar-platform-catalyze/

### TERRANOVA / Actis
- Stored owner year: 2025; top-level year: 2025.
- Decision: unchanged, high-conviction launch / investment-commitment announcement.
- Date basis: announcement fallback. The Actis release dated December 2, 2025 says TERRANOVA was established by Actis and officially launched with a planned US$1.5 billion investment.
- Change made: removed an unrelated 2024 Actis / General Atlantic corporate milestone and relabeled the Actis launch release as `Announcement date source - Actis - TERRANOVA`.
- Source: https://www.act.is/2025/12/02/actis-launches-new-latin-american-hyperscale-data-center-platform-terranova-to-accelerate-latin-americas-digital-expansion/

### AES Clean Energy / AIMCo
- Stored owner year: 2020; top-level year: 2020.
- Decision: unchanged, high-conviction announcement fallback for the named AES Clean Energy platform.
- Date basis: announcement fallback. AIMCo announced on November 17, 2020 that it agreed with AES to merge sPower with AES's U.S. clean energy business, creating the U.S. renewables platform with AIMCo at 25% for future projects.
- Change made: converted the same-year milestone to a `"Financing"` investment milestone and relabeled AIMCo's release as `Announcement date source - AIMCo - AES Clean Energy`; reworded later AES bolt-on context so it does not drive the original investment year.
- Sources:
  - https://www.aimco.ca/insights/aes-and-aimco-to-form-leading-renewables-platform
  - https://www.prnewswire.com/news-releases/aes-and-aimco-to-form-leading-renewables-platform-in-the-us-301174269.html

### LAZ Parking / Argo Infrastructure Partners
- Prior stored owner year: 2022; corrected owner and top-level year: 2021.
- Decision: changed. Public LAZ and PRNewswire releases show the Argo investment was announced on December 30, 2021, not 2022.
- Date basis: announcement fallback; no separate close date found in reviewed public sources.
- Change made: updated `owners[].investmentYear` and top-level `investmentYear` to 2021, aligned December 30, 2021 financing milestone, and relabeled source as `Announcement date source - Argo Infrastructure Partners - LAZ Parking`.
- Sources:
  - https://www.lazparking.com/our-company/about/news/2022/01/03/laz-parking-announces-a-long-term-investment-from-argo-infrastructure-partners
  - https://www.prnewswire.com/news-releases/laz-parking-announces-a-long-term-investment-from-argo-infrastructure-partners-301452042.html

### FleetLogix, Inc. / Argo Infrastructure Partners and LAZ Parking
- Stored owner years: 2025; top-level year: 2025.
- Decision: unchanged, high-conviction close/current-acquisition evidence for the named bolt-on business.
- Date basis: close/current acquisition. LAZ announced on April 22, 2025 that it had acquired a majority interest in FleetLogix; the same release identifies Argo Infrastructure Partners as an investor in LAZ.
- Change made: reworded acquisition milestones to identify `Argo Infrastructure Partners-backed LAZ Parking`, relabeled source as `Close date source - Argo Infrastructure Partners / LAZ Parking - FleetLogix, Inc.`, and changed LAZ's 2021 platform investment to non-transactional context for this bolt-on row.
- Source: https://www.lazparking.com/our-company/about/news/2025/04/22/laz-parking-acquires-majority-interest-in-fleet-management-staffing-services-provider-fleetlogix

### Leatherstocking Gas Company / Argo Infrastructure Partners
- Stored owner year: 2022; top-level year: 2022.
- Decision: unchanged, high-conviction close evidence through parent acquisition.
- Date basis: close. Corning announced on July 6, 2022 that Argo-managed funds completed the acquisition of 100% of Corning Natural Gas Holding Corp.; Corning identifies Leatherstocking Gas as a subsidiary.
- Change made: added a July 6, 2022 Argo acquisition milestone, added `Close date source - Argo Infrastructure Partners - Leatherstocking Gas Company`, and reworded earlier Corning ownership context so it does not appear to be Argo's investment.
- Sources:
  - https://www.globenewswire.com/news-release/2022/07/06/2475377/0/en/corning-natural-gas-holding-corporation-acquired-by-argo-infrastructure-partners-lp.html
  - https://www.corninggas.com/merger-information/
  - https://www.corninggas.com/company-history

### Pike County Light & Power / Argo Infrastructure Partners
- Stored owner years: 2022; top-level year: 2022.
- Decision: unchanged, high-conviction close evidence through parent acquisition.
- Date basis: close. Corning announced on July 6, 2022 that Argo-managed funds completed the Corning Natural Gas Holding Corp. acquisition; Corning identifies Pike County Light & Power as a subsidiary.
- Change made: added a July 6, 2022 Argo acquisition milestone, added `Close date source - Argo Infrastructure Partners - Pike County Light & Power`, and reworded the earlier Corning acquisition context so it does not drive Argo's year.
- Sources:
  - https://www.globenewswire.com/news-release/2022/07/06/2475377/0/en/corning-natural-gas-holding-corporation-acquired-by-argo-infrastructure-partners-lp.html
  - https://www.corninggas.com/merger-information/
  - https://www.corninggas.com/company-history

### Freight Ninja / Argo Infrastructure Partners and LAZ Parking
- Stored owner year: 2025; top-level year: 2025.
- Decision: unchanged, high-conviction close/current-acquisition evidence for the named bolt-on business.
- Date basis: close/current acquisition. LAZ announced on May 6, 2025 that it had acquired a majority interest in Freight Ninja.
- Change made: reworded acquisition milestones to identify `Argo Infrastructure Partners-backed LAZ Parking`, relabeled source as `Close date source - Argo Infrastructure Partners / LAZ Parking - Freight Ninja`, and changed LAZ's 2021 platform investment to non-transactional context for this bolt-on row.
- Source: https://www.lazparking.com/our-company/about/news/2025/05/06/laz-parking-acquires-majority-interest-in-freight-ninja

### International Parking Management / Argo Infrastructure Partners and LAZ Parking
- Stored owner year: 2024; top-level year: 2024.
- Decision: unchanged, high-conviction close/current-acquisition evidence for the named bolt-on business.
- Date basis: close/current acquisition. LAZ announced on April 5, 2024 that it had purchased International Parking Management.
- Change made: reworded the acquisition milestone to identify `Argo Infrastructure Partners-backed LAZ Parking` and relabeled source as `Close date source - Argo Infrastructure Partners / LAZ Parking - International Parking Management`.
- Source: https://www.lazparking.com/our-company/about/news/2024/04/05/laz-parking-purchases-seattle-based-international-parking-management-inc.-%28ipm%29

### INDIGO Park Canada Inc. / Argo Infrastructure Partners and LAZ Parking
- Stored owner years: 2025; top-level year: 2025.
- Decision: unchanged, high-conviction close/current-acquisition evidence for the named bolt-on business.
- Date basis: close/current acquisition. LAZ announced on July 1, 2025 that it had acquired a 60% majority stake in INDIGO Park Canada.
- Change made: reworded acquisition milestones to identify `Argo Infrastructure Partners-backed LAZ Parking` and relabeled source as `Close date source - Argo Infrastructure Partners / LAZ Parking - INDIGO Park Canada Inc.`
- Source: https://www.lazparking.com/our-company/about/news/2025/07/01/laz-parking-acquires-majority-stake-in-indigo-park-canada

### Isle Gas / Argo Infrastructure Partners
- Stored owner year: 2025; top-level year: 2025.
- Decision: unchanged, announcement fallback only. UGI disclosed a June 20, 2025 definitive agreement to sell Hawaii assets to Isle Gas, a subsidiary of AMF Hawaii Investment Holdings managed by Argo; reviewed sources say the transaction was expected to close later, but no close notice was found.
- Date basis: announcement fallback.
- Change made: reworded the milestone to identify Argo and relabeled UGI source as `Announcement date source - Argo Infrastructure Partners - Isle Gas`.
- Sources:
  - https://ugi.gcs-web.com/news-releases/news-release-details/amerigas-propane-enters-definitive-agreement-divest-hawaii/
  - https://www.hawaiigas.com/posts/argo-acquires-ugis-gas-storage-and-supply-assets-in-hawai-i

## Unchanged High-Conviction Confirmations

- Catalyze / EnCap Investments: retained 2019. The reviewed Actis source states Catalyze partnered with EnCap in 2019, while the current batch did not independently re-underwrite EnCap's original source beyond existing portfolio materials.
- FleetLogix / both Argo rows: retained 2025 because the row is the named bolt-on and the LAZ acquisition source is the first clear public evidence for this named business under the Argo-backed platform.
- Freight Ninja / Argo: retained 2025 for the same bolt-on reason.
- International Parking Management / Argo: retained 2024 for the named bolt-on acquisition.
- INDIGO Park Canada / both Argo rows: retained 2025 for the named bolt-on acquisition.

## Unresolved / No Change

### Boldyn Networks / AIMCo
- Current stored year: 2024.
- Suspected year: 2024 disclosure/follow-on year, but original AIMCo entry date remains unclear.
- Sources reviewed:
  - https://www.aimco.ca/insights/boldyn-networks-investment
  - https://www.cppinvestments.com/newsroom/cpp-investments-aimco-and-manulife-im-increase-commitment-to-boldyn-networks-to-support-continued-growth-in-the-u-s/
  - https://www.cppinvestments.com/wp-content/uploads/2024/03/Joint-Press-Release_Boldyn-Commitment-March-6-2024.pdf
- Rationale: the 2024 release discloses AIMCo as a 10% minority shareholder and announces a new follow-on commitment, but it does not clearly establish when AIMCo first acquired its stake in Boldyn itself. The database was not changed except to reword 2023 brand-launch milestones as non-transactional context.
- Evidence needed: an AIMCo, CPP, Boldyn, Manulife, filing, or transaction source that states AIMCo's original investment/close date for its Boldyn stake.

### Thule Energy Storage / Argo Infrastructure Partners
- Current stored year: 2020.
- Suspected year: 2018 or 2020.
- Sources reviewed:
  - https://www.globenewswire.com/news-release/2018/06/26/1529722/0/en/Ice-Energy-Announces-Long-Term-Funding-Agreement-with-Argo-Infrastructure-Partners.html
  - https://docs.cpuc.ca.gov/PublishedDocs/Efile/G000/M345/K698/345698025.PDF
  - https://www.energy-storage.news/ice-energy-acquired-thule-energy-storage-customer-assets-services-unaffected/
  - https://www.ldescouncil.com/news/ldes-council-adds-six-new-members-expanding-its-global-reach
- Rationale: Ice Energy announced Argo funding in 2018, while Thule materials indicate the named Thule platform acquired the Ice Bear technology/product line in 2020. The evidence does not clearly resolve whether the row should use Argo's predecessor-project funding date or the named Thule platform acquisition date, so no year change was made.
- Evidence needed: primary Thule/Argo acquisition or formation source tying ACP Thule / Thule Energy Storage to a definitive investment or close date.

