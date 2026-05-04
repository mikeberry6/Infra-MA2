# Portfolio Investment-Year Audit - Batch 01

Run date: 2026-05-02

## Applied Corrections

| Company | Owner | Prior year | Corrected year | Evidence basis |
|---|---|---:|---:|---|
| Chicago Parking Meters, LLC | MSIP | missing | 2009 | Morgan Stanley portfolio page lists the asset as invested in February 2009; the original Morgan Stanley release says the concession was selected in December 2008 and expected to close in Q1 2009. |
| Chicago Parking Meters, LLC | ADIA Infrastructure | missing | 2009 | Public ownership materials identify ADIA as an indirect sponsor of the concession; the concession financial close occurred in 2009. |
| Chicago Parking Meters, LLC | Allianz Global Investors | missing | 2009 | Public deal profiles identify Allianz Capital Partners as an investor in the 2009 Chicago Parking Meters transaction. |
| AES Clean Energy | AIMCo | 2026 | 2020 | AIMCo announced the AES/sPower platform formation on November 17, 2020; the 2026 portfolio-listing year was only a current-holding attribution. |
| Boldyn Networks | AIMCo | display year 2021 | 2024 | CPP Investments, AIMCo, and Manulife IM announced the 2024 follow-on commitment and disclosed AIMCo as a 10% minority shareholder. |
| Cando Rail & Terminals | AIMCo | 2026 | 2022 | AIMCo announced the definitive agreement to acquire 100% of Cando on July 20, 2022. |
| Cross-Sound Cable Company, LLC | APG Infrastructure | missing | 2015 | The APG-linked AIA vehicle is tied to Argo's 2015 acquisition of Cross-Sound Cable. |
| Gemini Solar + Storage | Quinbrook Valley of Fire Fund | missing | 2024 | Quinbrook announced the Valley of Fire continuation fund acquired 51% of Gemini on April 4, 2024. |
| Hudson Transmission Project | APG Infrastructure / Argo Infrastructure Partners | missing / 2018 display | 2019 | Public materials describe Argo-managed principal equity ownership as acquired in early 2019 after the September 2018 sale agreement. |
| LBJ Express | Meridiam / APG Infrastructure | missing | 2010 | Public project profiles identify financial close in 2010. |

## Applied Cleanup

- Removed duplicate blank AIMCo owner rows from AES Clean Energy and Boldyn Networks.
- Added a 2010 financial-close milestone to LBJ Infrastructure Group so the drawer highlight aligns with the stored investment year.
- Added a public source for Hudson Transmission's early-2019 ownership evidence.
- Tightened the audit script's transaction keyword matching so words like "financial", "acquired", and "investment" are detected reliably.

## Reviewed, No Correction In This Batch

| Company | Stored year | Decision |
|---|---:|---|
| TERRANOVA | 2025 | Earlier 2024 signal was Actis/General Atlantic corporate-level activity, not the TERRANOVA platform investment. |
| Landmark Dividend LLC | 2024 | 2023 was announcement; 2024 was completion of ADIA's 40% stake acquisition. |
| Coastal GasLink Pipeline Project | 2020 | 2019 was announcement; 2020 was closing of the 65% sale to KKR/AIMCo. |
| Empire Access | 2023 | 2022 was announcement; 2023 was completion of Antin's investment. |
| Pattern Energy Group LP | 2025 | 2024 was announcement; 2025 was closing of the APG/ART-led investment. |

## Key Public Sources

- Morgan Stanley: https://www.morganstanley.com/im/en-us/individual-investor/companies/chicago-parking-meters.html
- Morgan Stanley release: https://www.morganstanley.com/press-releases/chicago-parking-meters-llc-selected-as-winning-bidder-for-the-chicago-metered-parking-system_045f9d28-c142-11dd-b3a2-8df06e0b6eda
- AIMCo AES release: https://www.aimco.ca/insights/aes-and-aimco-to-form-leading-renewables-platform
- CPP Investments Boldyn release: https://www.cppinvestments.com/newsroom/cpp-investments-aimco-and-manulife-im-increase-commitment-to-boldyn-networks-to-support-continued-growth-in-the-u-s/
- AIMCo Cando release: https://www.aimco.ca/insights/cando-rail-and-terminals-acquisition
- Quinbrook Valley of Fire release: https://www.quinbrook.com/news-insights/quinbrook-closes-600m-solarstorage-continuation-fund/
- Lotus Hudson sale agreement: https://www.lotusinfrastructure.com/news/lotus-to-sell-hudson-transmission-line-to-argo/
- FHWA LBJ profile: https://www.fhwa.dot.gov/ipd/project_profiles/tx_lbj_express.aspx
