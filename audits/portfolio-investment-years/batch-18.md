# Batch 18 - Investment-Year Review

Audit after batch: 1,314 owner-company rows; 433 flagged rows remaining (12 critical, 117 high, 282 medium, 22 low).

## Implemented changes

### Hill Top Energy Center - Blackstone
- Stored year before review: 2026.
- Implemented year: 2025 for the Blackstone owner row and top-level `investmentYear`.
- Date basis: announcement fallback; no close date was identified in reviewed public sources.
- Evidence reviewed:
  - https://www.blackstone.com/news/press/blackstone-announces-agreement-to-acquire-hill-top-energy-center-in-western-pennsylvania-for-nearly-1-billion/
  - https://www.ardian.com/news-insights/press-releases/ardian-announces-sale-hill-top-energy-center-blackstone/
- Rationale: Blackstone and Ardian announced a definitive agreement on September 15, 2025. No public completion notice was found, so the database uses the announcement year rather than the later 2026 portfolio/buildout context.

### TXNM Energy - Blackstone
- Stored year before review: 2026.
- Implemented year: 2025 for the Blackstone owner row and top-level `investmentYear`.
- Date basis: 2025 investment disclosure and announcement fallback for the pending full acquisition.
- Evidence reviewed:
  - https://www.blackstone.com/news/press/txnm-energy-enters-agreement-to-be-acquired-by-blackstone-infrastructure/
  - https://www.prnewswire.com/news-releases/txnm-energy-reports-second-quarter-2025-results-302519323.html
  - https://www.txnmenergy.com/investors/acquisition.aspx
- Rationale: The full take-private is expected to close in the second half of 2026, but Blackstone Infrastructure also agreed to a $400 million private placement in May 2025 and TXNM reported in August 2025 that the Q2 equity issuance included $400 million issued to Blackstone Infrastructure affiliates. The current owner’s original investment into TXNM therefore begins in 2025.

### Beale Infrastructure - Blue Owl
- Stored year before review: 2026.
- Implemented year: 2024 for the Blue Owl owner row and top-level `investmentYear`.
- Date basis: platform launch disclosure.
- Evidence reviewed:
  - https://www.businesswire.com/news/home/20251124189221/en/Beale-Infrastructure-Expands-Leadership-Team-and-Accelerates-Buildout-of-North-American-Digital-Infrastructure-Platform
  - https://bealeinfra.com/about/
- Rationale: Business Wire reporting says Beale’s executive expansion followed its 2024 platform launch and identifies Beale as a portfolio company of Blue Owl-managed funds. Later 2025/2026 project announcements are development milestones and do not reset Blue Owl’s original platform investment year.

## QA corrections

### Vigor Marine Group - Antin Infrastructure Partners
- Restored top-level `investmentYear` to 2026 after the audit caught a temporary alignment regression.
- Evidence basis remains the February 2026 Antin acquisition announcement documented in batch 16.

## Unresolved cases

No new unresolved cases were added in this batch. The 12 critical unresolved missing-year rows remain unchanged.
