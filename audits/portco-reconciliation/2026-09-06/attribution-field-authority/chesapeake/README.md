# Transurban Chesapeake: pension-program field authority

This is a read-only authority checkpoint, not an apply manifest. No database, seed, terminal source-task, runtime or UI change is authorized by these artifacts.

## Decision and remaining persistence

The existing AustralianSuper and CPP acquisitions are direct pension-program holdings. The source-backed recommendation is unlinked `DIRECT_PROGRAM`, no separately attributed fund name and no inference confidence for both. AustralianSuper's five affected fields include the original confidence/rationale candidates and three additional link/name/classification issues. CPP's three additional name/classification/rationale issues were invisible to production-versus-seed equality. Eight decisions therefore reduce the original 603-field queue by only two, to 526 remaining (77 adjudicated).

All eight production and eight overlapping seed corrections remain unapplied. AustralianSuper's canonical fund link was historically retained as a dependency, not separately proven as a deal fund. Removing it requires compatible canonical/seed persistence through separate protected safeguards; neither the immutable proposal nor the underlying fund record may be silently rewritten. One missing AustralianSuper latest seed-upsert binding remains explicit. No missing CPP seed history is asserted by this checkpoint.

## Direct evidence reviewed

- AustralianSuper's December 17, 2020 release, full PDF pages 1-2: the 25% acquisition is explicitly direct infrastructure ownership for retirement members; the footer identifies its trustee. The infrastructure portfolio is not a separate deal fund. This is the sole primary for AustralianSuper's five fields.
- CPP's December 16, 2020 release, full PDF pages 1-2: the 15% acquisition belongs to CPP Investments' infrastructure portfolio managed for pension contributors and beneficiaries. This is the sole primary for CPP's three fields. The expected-close wording is not treated as independent closing evidence.
- Transurban FY26 PDF page 67: complete North America table and footnotes support the already-approved 50/25/15/10 cap table, components and concession terms at June 30, 2026. The separate A25 sale is not a Chesapeake exit.
- Transurban FY21 PDF page 81: complete table and footnotes confirm the original cap table and March 31, 2021 financial close. Other columns are different assets, not additional Chesapeake stakes.

The PDF skill's render-and-inspect workflow was used for all six relevant pages, including disclaimers and footnotes. Full original PDF bytes are preserved without re-export. All four exclusive ordinary-HTTP requests returned 200 at their exact cited URLs at 2026-09-06T21:02:18.638Z. The Transurban and CPP PDFs equal their historical hashes. AustralianSuper's fresh 123,702-byte PDF (`cd2c399156268d7293740d6f0e23dacf542c1f3ba585c5c9e2df659334cd34e4`) is **not** the old 569-byte HTTP403 HTML response. The old `BROWSER_BLOCKED_BUT_VERIFIED` record is retained honestly as historical context; it is not promoted to raw-PDF proof. Source capture is frozen and must not be repeated.

## Protected boundaries

Preserve canonical company `cmrxpjcnm00syivhep9wizt9q`, retired duplicate `cmrxpj7kc00kyivhewp6psi4d` and the completed merge redirect. AustralianSuper owner `cmrxpjsli01hwivhe5k0u55ih` remains 25% / 2021 / legal vehicle null. CPP owner `cmrxpjy4z01qwivhe6vb1btix` remains 15% / 2021 / existing `Real Assets (Infrastructure)` label. Classification does not turn that strategy label into a disclosed SPV. No trustee alias, generic CPP Fund, Transurban/UniSuper tracked owner, separate road company, revised headquarters or formation year is introduced.

All eight canonical citations, FY26 card-primary, milestones, manager identities, null headquarters/founding year, inactive-state absence and pending-transaction absence are bound by the complete semantic company comparison. This is not a new September ownership/exit search and does not repeat company/ChatGPT research.

The complete nine-file historical packet is hash-bound. Its transcript is a pointer-only index to separate prompt/response artifacts, not a full DOM trace. One accepted response and zero repairs are recorded. Independent historical corrections to generic model fund, organization and geography labels remain unchanged. Historical pending-release flags precede the successful immutable receipt; never replay transaction `f406f61b-8058-4c2f-982f-eb9c16b1ee5c`.

Original AustralianSuper attribution `OFA-33CA1CF945ED` belonged to the retired duplicate; the current seed record is `OFA-03A4A9DE1EAA`. CPP original `OFA-8D58B4EB987D` and seed `OFA-51C1667D08B1` likewise remain distinct. Exact original receipt, completed merge proposal/approval/receipt, canonical seed overlay and frozen chronology are validated without fabricating rekey history.

## Verification and release

Exclusive target-pinned READ ONLY preparation passed first attempt at 2026-09-06T21:08:37.571Z against protected base `a54bac1e4024cd5869eb1a1890ba54b014f88ab7` and its exact canonical Git-integrated deployment. Authority SHA `8336935955cf34ef88c68c02eb178480e0486efd65f267c76882dab20afdd75e`; full scoped production state `ed902cf9792ed48ba0b4ea17ea8d5e9bdd0bc8ffb9a1d8c704e5e6720b5d87a2`; 27 protected dependencies. The proof rejects any company, owner, redirect, source, packet, fund, original receipt, seed or prior-authority drift. Source and preparation outputs are exclusive and cannot be overwritten.

The protected release must subsequently reproduce this exact state/dependency/authority proof on canonical production at the exact merge SHA, pass guarded smoke and both CIs, and publish post-release artifacts. All earlier attribution corrections and final seed parity/counts/exception-report work remain outstanding. No source bundle is active and overall completion is false.

This release also publishes the three VIG PR935 post-release files. Obsolete untracked artifacts remain excluded.
