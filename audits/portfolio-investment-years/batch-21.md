# Batch 21 — Early ADIA / AIMCo flagged rows

Run date: 2026-05-02

## Scope

Reviewed the next early flagged owner rows:

- Chicago Parking Meters, LLC — MSIP
- Chicago Parking Meters, LLC — ADIA Infrastructure
- Chicago Parking Meters, LLC — Allianz Global Investors
- FirstEnergy Transmission, LLC — ADIA Infrastructure
- FirstEnergy Transmission, LLC — Brookfield Asset Management
- Landmark Dividend LLC — ADIA Infrastructure
- Landmark Dividend LLC — DigitalBridge
- TriSummit Utilities — AIMCo

## Implemented Changes

### Chicago Parking Meters, LLC — MSIP / ADIA Infrastructure / Allianz Global Investors

- Stored owner years: 2009 for all three owners.
- Decision: kept 2009 for all three owners.
- Date basis: close date.
- Rationale: Morgan Stanley's Dec. 3, 2008 release identifies Chicago Parking Meters, LLC as the winning bidder and states closing was expected in Q1 2009. Metropolitan Planning Council's transaction analysis states that the transaction closed in February 2009 and that the consortium then included Morgan Stanley, Allianz Capital Partners, and ADIA. No source reviewed supported changing any owner to the 2008 selection/approval year.
- Data changes:
  - Consolidated duplicate milestones.
  - Added a Feb. 2009 financial-close milestone naming MSIP / Morgan Stanley Infrastructure, ADIA, and Allianz.
  - Added separate close-date source labels for MSIP, ADIA Infrastructure, and Allianz Global Investors.
- Sources:
  - https://www.morganstanley.com/press-releases/chicago-parking-meters-llc-selected-as-winning-bidder-for-the-chicago-metered-parking-system_045f9d28-c142-11dd-b3a2-8df06e0b6eda
  - https://metroplanning.org/projects/innovative-infrastructure-delivery-chicago-parking-meter-analysis/

### FirstEnergy Transmission, LLC — ADIA Infrastructure / Brookfield Asset Management

- Stored ADIA owner year: 2024
- Stored Brookfield owner year: 2022
- Decision: kept both years.
- Date basis: close date for each owner.
- Rationale: FirstEnergy completed Brookfield's initial 19.9% minority FET acquisition on May 31, 2022. The later 30% follow-on acquisition closed on Mar. 25, 2024, and reviewed CFIUS/regulatory materials identify ADIA in connection with that follow-on structure. Brookfield's 2022 initial investment does not support moving ADIA earlier because ADIA's exposure is tied to the later NATFinCo/NATCo II structure.
- Data changes:
  - Removed "via Brookfield" from the ADIA owner vehicle text so the audit does not treat Brookfield's separate 2022 investment as ADIA's original investment date.
  - Kept existing owner-specific close-date source labels.
- Sources:
  - https://www.firstenergycorp.com/newsroom/news_articles/firstenergy-completes-minority-interest-sale-in-transmission-bus.html
  - https://www.firstenergycorp.com/newsroom/news_articles/fe-closes-on-fe-transmission-interest-sale.html
  - https://www.tradepractitioner.com/2024/02/cfius-brookfield-infrastructure-partners-lp-and-firstenergy-transmission-llc-2/
  - https://www.sec.gov/Archives/edgar/data/1031296/000103129624000018/fe-20240325x8k.htm

### Landmark Dividend LLC — ADIA Infrastructure / DigitalBridge

- Stored ADIA owner year: 2024
- Stored DigitalBridge owner year: 2021
- Decision: kept both years.
- Date basis: close date.
- Rationale: Landmark announced completion of its acquisition by Digital Colony / DigitalBridge affiliates on Jun. 2, 2021. DigitalBridge later announced ADIA's 40% stake acquisition on Nov. 1, 2023, and DigitalBridge announced completion on Apr. 2, 2024. The owner years therefore differ and should remain owner-specific.
- Data changes:
  - Added a Jun. 2, 2021 DigitalBridge acquisition milestone.
  - Relabeled source evidence for DigitalBridge's 2021 close and ADIA's 2023 announcement / 2024 close.
  - Removed duplicate generic ADIA milestones.
- Sources:
  - https://www.nasdaq.com/press-release/digital-colony-completes-acquisition-of-landmark-dividend-llc-2021-06-02
  - https://ir.digitalbridge.com/news-releases/news-release-details/adia-acquires-40-stake-landmark-dividend/
  - https://ir.digitalbridge.com/news-releases/news-release-details/adia-completes-acquisition-40-stake-landmark-dividend-alongside/
  - https://www.digitalbridge.com/portfolio/landmark-dividend

## Unresolved Cases

### TriSummit Utilities — AIMCo

- Current stored year: 2020
- Suspected year: 2020 for ATRF's underlying acquisition; 2021 for AIMCo's investment-management transition.
- Sources reviewed:
  - https://trisummit.ca/index.php/newsroom/news-2023/227-nvestmentsandompletecquisitionofltaasa20200331093900
  - https://trisummit.ca/images/Reports_Filings/2025/TSU_AIF_2024_Final_web.pdf
  - https://www.aimco.ca/who-we-are/our-clients
  - https://www.aimco.ca/insights/aimco-and-atrf-agreement
  - https://www.atrf.com/investments/investment-details/
- Why unresolved: The 2020 close source clearly supports PSP Investments and ATRF acquiring AltaGas Canada/TriSummit in March 2020, but it does not identify AIMCo as the investor at that time. Separate public sources show ATRF's asset-management transition to AIMCo was completed in 2021. Because the row is labeled AIMCo while the economic acquisition appears to be ATRF's 2020 stake, changing the year would require a policy decision on whether AIMCo manager rows should use the underlying owner's acquisition date or AIMCo's management start date.
- Evidence needed to resolve: a public source tying AIMCo, as investment manager or holder of ATRF's interest, directly to TriSummit from the 2020 closing date, or a database ownership-policy decision for externally managed pension interests.
- Database action: unchanged.

## Audit Notes

- Post-batch audit command: `npm run audit:portfolio-years`
- Post-batch result: 1,314 owner-company rows; 383 flagged rows remaining.
- Priority split after batch: 12 critical, 99 high, 251 medium, 21 low.
