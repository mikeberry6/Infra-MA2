# Batch 24 — Apollo / ArcLight flagged rows and Brightspeed owner split

Run date: 2026-05-02

## Scope

Reviewed:

- Caledonia Generating LLC — Apollo Global Management
- Nokomis Energy — Apollo Global Management
- Alpha Generation (AlphaGen) — ArcLight Capital Partners
- Parkway Generation — ArcLight Capital Partners
- REC Solar — ArcLight Capital Partners
- Sequitur Renewables — ArcLight Capital Partners
- Two Rivers Storage — ArcLight Capital Partners
- Brightspeed — Mubadala / Apollo Global Management

## Implemented Changes

### Caledonia Generating LLC — Apollo Global Management

- Stored owner/top-level year: 2018
- Decision: kept 2018.
- Date basis: announcement/regulatory filing fallback.
- Rationale: A public FERC notice dated October 2018 identifies Caledonia Generating and Apollo Global Management in a joint application. No public completion notice was found, so the regulatory filing year remains the best public fallback.
- Data changes: converted the 2018 same-year milestone into a transactional financing/regulatory-filing event and added `Announcement date source — Apollo Global Management — Caledonia Generating LLC`.
- Source: https://www.federalregister.gov/documents/2018/10/18/2018-22713/combined-notice-of-filings-1

### Nokomis Energy — Apollo Global Management

- Stored owner/top-level year: 2024
- Decision: kept 2024.
- Date basis: investment announcement.
- Rationale: Great Bay Renewables announced the Nokomis investment on June 27, 2024. Great Bay states it is jointly controlled by Altius Renewable Royalties and Apollo-affiliated funds.
- Data changes: reworded same-year milestone to identify Apollo's Great Bay structure and added labeled investment-date source.
- Sources:
  - https://www.greatbayroyalties.com/news/nokomis-investment/
  - https://www.arr.energy/news/altius-renewable-royalties-forms-joint-venture-with-apollo-infrastructure-funds

### Alpha Generation (AlphaGen) — ArcLight Capital Partners

- Stored owner/top-level year: 2024
- Decision: kept 2024.
- Date basis: announcement/formation.
- Rationale: ArcLight announced formation of AlphaGen on Jan. 10, 2024 and described it as owned by an ArcLight affiliate.
- Data changes: reworded same-year milestone as an owner-specific formation event and added labeled announcement-date source.
- Source: https://www.prnewswire.com/news-releases/arclight-creates-alphagen-to-manage-one-of-the-largest-power-infrastructure-portfolios-in-the-united-states-302031341.html

### Parkway Generation — ArcLight Capital Partners

- Stored owner/top-level year: 2022
- Decision: kept 2022.
- Date basis: close date.
- Rationale: ArcLight announced on Feb. 18, 2022 that Parkway Generation, a wholly owned subsidiary of ArcLight Energy Partners Fund VII, closed the acquisition of the 4.8 GW PSEG generation portfolio.
- Data changes: reworded close milestone to name ArcLight Fund VII and added labeled close-date source.
- Source: https://www.prnewswire.com/news-releases/arclight-closes-acquisition-of-4-8-gw-power-generation-portfolio-from-pseg-301485739.html

### REC Solar — ArcLight Capital Partners

- Stored owner/top-level year: 2023
- Decision: kept 2023.
- Date basis: close date.
- Rationale: Duke Energy announced on Oct. 4, 2023 that it completed the sale of its commercial distributed generation portfolio, including REC Solar, to an investment fund managed by ArcLight. The historical 2005 Mainstream Energy acquisition is unrelated to ArcLight's current ownership.
- Data changes: changed investment milestone category to `"Acquisition"` and added labeled close-date source.
- Source: https://investors.duke-energy.com/news/news-details/2023/Duke-Energy-completes-sale-of-commercial-distributed-generation-portfolio-including-REC-Solar-to-ArcLight/default.aspx

### Sequitur Renewables — ArcLight Capital Partners

- Stored owner/top-level year: 2022
- Decision: kept 2022.
- Date basis: acquisition announcement / source fallback.
- Rationale: Sequitur's own site identifies Aug. 1, 2022 as ArcLight's PJM wind-farm acquisition that established the Sequitur platform.
- Data changes: changed same-year milestone category to `"Acquisition"` and added labeled close-date source.
- Source: https://sequiturrenewables.com/

### Two Rivers Storage — ArcLight Capital Partners

- Stored owner/top-level year: 2026
- Decision: kept 2026.
- Date basis: project selection / investment-date fallback.
- Rationale: New Jersey BPU selected Two Rivers Energy Storage on Mar. 5, 2026, and Elevate announced the project on Mar. 16, 2026. Elevate states that both Elevate and Alpha Generation are owned by funds managed by ArcLight.
- Data changes: reworded 2026 milestone to identify Elevate as an ArcLight-owned platform and added labeled investment-date source.
- Sources:
  - https://www.nj.gov/bpu/newsroom/2026/approved/20260305.html
  - https://www.prnewswire.com/news-releases/new-jersey-bpu-selects-elevates-garden-state-reliability-battery-storage-project-to-improve-affordability-and-address-regional-power-shortage-302714749.html

### Brightspeed — Mubadala / Apollo Global Management

- Stored Mubadala owner/top-level year: 2023
- Stored Apollo owner year: 2022
- Decision: kept both years.
- Date basis: Apollo close date; Mubadala investment announcement.
- Rationale: Apollo completed the acquisition of Lumen's 20-state ILEC operations on Oct. 3, 2022. Mubadala announced its $500 million minority investment in Brightspeed in May 2023. Apollo's 2021 brand/transaction announcements do not supersede the 2022 close date, and Apollo's separate history should not drive Mubadala's 2023 year.
- Data changes: corrected Apollo milestone dates/wording; converted the 2021 Brightspeed brand event to `"Other"`; added Apollo close-date and Mubadala investment-date source labels; removed Apollo wording from Mubadala's owner-vehicle label to avoid owner-specific audit conflation.
- Sources:
  - https://ir.lumen.com/news/news-details/2022/Lumen-Closes-Sale-of-Local-Incumbent-Carrier-Operations-in-20-States-to-Brightspeed/default.aspx
  - https://www.mubadala.com/en/news/mubadala-invests-500-million-in-brightspeed
  - https://www.apollo.com/media/press-releases/2021/11-17-2021-211552119

## Audit Script Note

- Added `energy` to the audit firm-token stopword list. This avoids false positives where fund names such as `ArcLight Energy Partners Fund VII` caused historical third-party milestones containing generic "Energy" to be treated as owner-specific evidence.

## Unresolved Cases

- None in this batch.

## Audit Notes

- Post-batch audit command: `npm run audit:portfolio-years`
- Post-batch result: 1,314 owner-company rows; 356 flagged rows remaining.
- Priority split after batch: 12 critical, 89 high, 235 medium, 21 low.
