# Portfolio Investment-Year Verification - Batch 05

Run date: 2026-05-02

Starting audit baseline after batch 04: 1,314 owner-company rows; 541 flagged rows.

Current audit after batch 05 edits: 1,314 owner-company rows; 539 flagged rows.

## Implemented Changes

### Cheniere Energy Partners, L.P. - Blackstone
- Decision: added a 2020 same-year acquisition milestone and labeled Blackstone's close-date source.
- Date basis: close date.
- Evidence: https://www.blackstone.com/news/press/blackstone-energy-partners-closes-sale-of-42-stake-in-cheniere-energy-partners-l-p/
- Rationale: Blackstone's release states that funds managed by Blackstone Energy Partners closed the sale of their approximately 42% stake to Brookfield Infrastructure and funds managed by Blackstone Infrastructure Partners on September 24, 2020. The stored Blackstone Infrastructure investment year remains 2020.

### ARK Data Centers - Carlyle Infrastructure
- Decision: changed the February 1, 2022 milestone category to Acquisition, clarified that Carlyle completed the acquisition, and labeled the close-date source.
- Date basis: close date.
- Evidence: https://www.arkdna.com/about/news/carlyle-s-acquisition-of-hybrid-cloud-data-center-provider-ark-closes/
- Rationale: ARK/Involta's company release states that funds managed by Carlyle completed the acquisition on February 1, 2022. The stored investment year remains 2022.

### Northern Indiana Public Service Company LLC - Blackstone
- Decision: changed the 2023 announcement and 2024 close milestones to Acquisition and labeled both the announcement and close sources.
- Date basis: close date.
- Evidence:
  - Announcement: https://www.nipsco.com/our-company/news-room/news-article/nisource-announces-agreement-to-sell-minority-equity-interest-in-nipsco-to-strengthen-financial-foundation-and-support-sustainable-long-term-growth
  - Close: https://www.nipsco.com/our-company/news-room/news-article/nisource-inc.-completes-nipsco-minority-equity-interest-transaction
- Rationale: NiSource's completion release states that it completed the issuance of a 19.9% indirect equity interest in NIPSCO to a Blackstone Infrastructure affiliate on January 2, 2024. The stored investment year remains 2024.

## Unresolved / No Data Change

- No new unresolved items were added in this mini-batch. Existing unresolved cases remain documented in batch 04.

## Validation Notes

- Audit after edits: 539 flagged rows remain.
- Fallback validation via bundled esbuild output passed: 1,171 companies, 149 funds, 3,975 unique source URLs, 0 errors, 2,445 warnings.
- This mini-batch only changed milestone/source attribution and supporting evidence for high-conviction rows; no owner years changed.
