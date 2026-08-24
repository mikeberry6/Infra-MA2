# PortCo proposal — Commonwealth LNG

- Task: 193 (ledger:0193:commonwealth-lng:177a93a3)
- As of: 2026-08-23
- Actions: CORRECT_COMPANY, MERGE_COMPANIES
- Proposal SHA-256: e735c77e932ca60fc980053a5ce3bd5db99c04dd028e0de0c62e5f704f41fa2a
- Production snapshot SHA-256: af6429f938c712a29fd64b816fe6f846c462a6740c8b69cb3229cb9fbc31c0fb
- Current company snapshot SHA-256: 336c06a6ef0f3fe4149b9cb20157f1fe0bc2095a25652ec38ffaed2ae33137a1
- After-image SHA-256: c6c668d544322c29811eda71041c9365ba9495ed2f0fb3f9a7840a8e7747cd18

## Recommendation

Merge Commonwealth LNG into the existing Caturus parent platform because direct regulatory and company sources establish Commonwealth LNG, LLC as a controlled project subsidiary rather than a separate manager-level PortCo. Preserve Commonwealth as an alias, retain its distinct commercial-project milestones and citations, map duplicate Kimmeridge and Mubadala ownership history to the verified Caturus parent rows, and redirect the retired Commonwealth company ID.

## Ownership after image

| Manager | Fund | Vehicle | Stake | Invested | Exited | State |
| --- | --- | --- | --- | ---: | ---: | --- |
| CPP Investments | — | Kimmeridge SoTex Aggregator, LLC / Kimmeridge-managed funds | 22.8% direct governance; additional 10.3% economic look-through through Kimmeridge-managed funds | 2025 | — | CLOSED_ACTIVE |
| Kimmeridge | — | Kimmeridge-managed funds; exact allocation not publicly disclosed | 52.6% direct governance after the May 2026 closing | 2023 | — | CLOSED_ACTIVE |
| Mubadala | — | — | 24.1% direct governance | 2025 | — | CLOSED_ACTIVE |

## Source holdings

- None

## Retired company records

- cmrxpjlmi016rivhegsbn21hd

## Retired relation mappings

| Kind | Retired relation | Canonical relation | Rationale |
| --- | --- | --- | --- |
| MILESTONE | cmrxpmgdm04w0ivheyo4fw4z2 | cmrxpm6i804k0ivhe4zjmuoxn | Both milestones describe the 2025 Mubadala investment and Caturus rebrand. |
| MILESTONE | cmrxpmgg804w1ivhe0vdkmk0r | cmrxpm6i804k0ivhe4zjmuoxn | Both milestones describe the August 2025 Mubadala closing and Caturus rebrand. |
| OWNERSHIP_PERIOD | cmrxpk8070264ivheshixqnhb | cmt6iw22r0018wfyyex8urcg5 | Both rows represent Mubadala's ownership in the same Caturus parent platform; the canonical row carries the verified 24.1% direct governance stake. |
| OWNERSHIP_PERIOD | cmrxpk80r0265ivhedqzn07u2 | cmrxpk5lt022divheaglek2t6 | Both rows represent Kimmeridge's ownership in the same Caturus parent platform; the canonical row carries the corrected parent-level stake and entry history. |

## Reviewed seed-only identity retirements

| Queue task | Seed company | Country | Raw entry SHA-256 | Evaluated entry SHA-256 |
| --- | --- | --- | --- | --- |
| — | — | — | — | None |

## Evidence

- [Parent and project boundary](https://caturus.com/caturus-announces-final-investment-decision-for-9-5-mtpa-commonwealth-lng-export-facility-in-cameron-la/) — Caturus presents Commonwealth LNG as the LNG project component of its integrated platform
- [Corrected Caturus governance cap table](https://www.energy.gov/documents/commonwealth-follow-questions) — Kimmeridge, Mubadala and CPP Investments are direct owners of the Caturus parent platform
- [Current ownership and legal chain](https://www.energy.gov/documents/commonwealth-lng-doe-notice-change-control-cpppdf) — Commonwealth LNG is indirectly controlled within the Caturus legal chain, The Caturus parent cap table, not a separate Commonwealth cap table, is the manager-level ownership boundary

## Unresolved questions

- None

Approval must cite this proposal SHA-256, the production snapshot SHA-256, the current company snapshot SHA-256, and the exact after-image SHA-256.
