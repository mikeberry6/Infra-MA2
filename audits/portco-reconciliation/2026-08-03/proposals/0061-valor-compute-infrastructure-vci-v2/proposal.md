# PortCo proposal — Valor Compute Infrastructure (VCI)

- Task: 61 (ledger:0061:valor-compute-infrastructure-vci:e12f218b)
- As of: 2026-08-12
- Actions: CORRECT_COMPANY, RETIRE_OWNERSHIP, REALIZE_COMPANY
- Proposal SHA-256: b2bec65272c59de3384320e5a029c4093cfed749a61d7d9e53369b11b7e54ce4
- Production snapshot SHA-256: d85dbbbf34234d5e9b4f079bc0852f6f159f51b2fb90f45d4594fefb1e1e6473
- Current company snapshot SHA-256: ed9c5b6141ef841a0098f36e00b39db962215d72e7b250c44e9abd585c086381
- After-image SHA-256: 8c69440bbf2689fb3324cfdbffe20fbda0b88b583adc3dc74939c34df0eb7437

## Recommendation

Archive the Valor Compute Infrastructure record and retire its purported Apollo ownership because Valor Compute Infrastructure L.P. is a pooled private-equity fund managed by Valor, not an Apollo-owned operating company or infrastructure platform. Apollo led an asset-backed capital solution. An Apollo private-credit vehicle also held small non-controlling equity interests in downstream numbered financing SPVs, so the original debt-only rationale is incomplete; however, those financing exposures do not establish Apollo ownership or control of VCI L.P. The approved archive overlay removes the evaluated seed entry, while the database preserves an archived audit record and its corrected relations rather than deleting history.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Apollo Global Management | — | Apollo-led asset-backed capital solution; no ownership of VCI L.P. established | No Apollo ownership or control of VCI L.P. established | — | — | REALIZED |

## Source holdings

- None

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

- [Apollo transaction characterization](https://www.apollo.com/insights-news/pressreleases/2026/01/apollo-backs-5-4-billion-valor-and-xai-data-center-compute-infrastructure-transaction-with-3-5-billion-capital-solution-3214463) — Apollo describes VCI as a fund managed by Valor Equity Partners, Apollo led a US$3.5 billion capital solution supporting the transaction, the compute assets are leased to an xAI subsidiary under a triple-net structure
- [Current Apollo strategy classification](https://www.apollo.com/strategies/financing-companies) — Apollo lists the VCI transaction as a representative financing solution, the current manager page does not present VCI as an Apollo infrastructure-equity portfolio company
- [Latest Apollo exposure and exit check](https://www.sec.gov/Archives/edgar/data/1837532/000119312526341358/ck0001837532-20260630.htm) — Apollo Debt Solutions BDC held first-lien loans to VCI Asset Holdings entities at June 30, 2026, the credit vehicle also held non-controlling common-equity interests in corresponding numbered Intermediate TopCo entities, the filing does not establish Apollo ownership or control of VCI L.P.
- [Legal identity and fund classification](https://www.sec.gov/Archives/edgar/data/2074951/000101297526000462/xslFormDX01/primary_doc.xml) — Valor Compute Infrastructure L.P. is a Delaware limited partnership formed in 2025, Valor Management LLC is investment adviser and Valor CI Associates L.P. is general partner, the issuer is classified as a pooled investment fund and private-equity fund

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
