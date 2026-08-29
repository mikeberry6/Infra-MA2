# PortCo proposal — Plug Power Fuel Cell Asset SPVs

- Task: 258 (ledger:0258:plug-power-fuel-cell-asset-spvs:70c16186)
- As of: 2026-08-29
- Actions: CORRECT_COMPANY, RETIRE_OWNERSHIP, REALIZE_COMPANY
- Proposal SHA-256: c1d00795e1850990ac3804de06b9d363e337679ed6ab4a6e00c2e096fb27c79b
- Production snapshot SHA-256: 2e2b6c145dac18747fec467e25ffd9f1fea59413cb7fa35200f48f2d51fdb00a
- Current company snapshot SHA-256: b72ff559bc114325434b509220ce48df124112a0af0dcec06bcc8c4c9c1eea62
- After-image SHA-256: 329181ba02ed605c4cc2297f5a5d2da5e401d8ad40bfa8b843795dc15ee4b3c4

## Recommendation

Retire and archive the generic Plug Power SPV row because it conflates equipment sale-leaseback vehicles with a later Generate secured loan. Generate's 2019-2022 exposure was debt and was fully repaid in December 2022; no current Generate equity ownership, foreclosure or later conversion was identified.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| Generate Capital | — | Generate Lending LLC / Generate PPL SPV I, LLC secured debt facility | Debt-only exposure; no ownership stake | 2019 | 2022 | REALIZED |

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

- [Historical sale-leaseback structure](https://www.sec.gov/Archives/edgar/data/1093691/000110465917046148/a17-17059_1ex10d3.htm) — Separate lessor SPVs held title to identified fuel-cell equipment
- [Debt classification](https://www.sec.gov/Archives/edgar/data/1093691/000110465919019559/a19-7776_1ex10d1.htm) — Generate Lending's 2019 exposure was an executed secured loan
- [Repayment and exit evidence](https://www.sec.gov/Archives/edgar/data/1093691/000155837023008801/plug-20230331x10q.htm) — Plug Power repaid the Generate loan in December 2022

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
