# Cleco: distinguish disclosed fund, insurer vehicle and combined program

This is a read-only attribution checkpoint for completed task 122, **Cleco Corporate Holdings LLC** (`cmrxpjkkg0151ivhenxskmy7x`). It is not an apply manifest or authority for database/seed writes. No company research, source transition, bundle, transaction replay, runtime/UI change or enrichment is included. All 496 source tasks remain terminal, 41 exact exceptions remain and the source ledger is idle.

## Decisions and separate persistence

| Current owner / seed record | Source-backed recommendation | Original / additional fields | Production / seed corrections |
| --- | --- | ---: | ---: |
| Macquarie `cmrxpk6nt0244ivhetvms2jd6` / `OFA-C2BCBE65BD0B` | Keep MIP III linked; DISCLOSED, null confidence and direct-source rationale | 3 / 0 | 3 / 1 |
| Manulife `cmrxpk6od0245ivhe8mp691um` / `OFA-71C920291F6F` | Keep unlinked; UNRESOLVED, null attributed fund/confidence and exact allocation limitation | 0 / 3 | 3 / 3 |
| BCI `cmrxpk6re0246ivhen4ze6pdf` / `OFA-DD94B87AFDC9` | Unlink the combined-program label; DIRECT_PROGRAM, null attributed fund/confidence and program rationale | 0 / 4 | 4 / 4 |

Ten decisions require ten production and eight overlapping seed corrections, **all unapplied**. The original three fields are Macquarie classification, confidence and rationale. The seven additional fields are equality-blind: production and seed agree but that agreement is not direct-source authority. All three exact seed-upsert bindings exist; none is missing or invented.

### Macquarie: direct MIP III funding

The sole field-primary is the preserved ordinary-browser excerpt from [Cleco's April 13, 2016 closing disclosure](https://www.cleco.com/media/press-releases/detail/2016/04/13/north-american-led-investor-group-completes-acquisition-of-cleco). It expressly identifies Macquarie Infrastructure Partners III, L.P. as providing funding alongside the other consortium investors. The complete article, including its qualifications, was read. This is stronger than merely inferring fund investment from a manager or affiliate's name.

The [March 29, 2017 prospectus](https://www.sec.gov/Archives/edgar/data/1089819/000119312517101185/d317836d424b3.htm) corroborates MIP Cleco Partners L.P. as the consortium member affiliated with MIP III. Its parent-company section defines MIP III collectively to include the PV partnership. Preserve the existing aggregate MIP III link and legal vehicle; do not invent parallel-fund allocations, shares or a new ownership event. Remove the stale inferred/medium-confidence rationale; the seed's canonical-receipt rationale also needs direct evidence rather than circular provenance.

### Manulife: known insurer, unknown specific fund

The sole field-primary is the exact ordinary-browser prospectus excerpt. Its Investors definition names **John Hancock Life Insurance Company (U.S.A.)**; the parent-company section identifies John Hancock Financial as part of Manulife. This does not identify **Manulife Infrastructure Fund I**, nor resolve allocation between insurer capital and an underlying client fund. Preserve the insurer vehicle and current unlinked fund state, remove the unsupported specific-fund name, and classify **UNRESOLVED**, not DIRECT_PROGRAM merely because an insurer is named. This does not claim that the named fund did not invest.

### BCI: combined program, not one constituent fund

The sole field-primary is the already-frozen [BCI Infrastructure and Renewable Resources financial statements for the year ended December 31, 2024](https://www.bci.ca/wp-content/uploads/2024/08/IRR-Program-FS-2024_Secured.pdf), reused from the protected Puget checkpoint without another capture. Complete physical pages 11 and 26 (printed pages 9 and 24) were rendered and visually read, including headings and both year columns. Note 1 says the combined program is not a legal investment entity and comprises several funds and structured entities; Note 7 reports Cleco through intermediary corporations. No named Bolsena fund allocation follows from this.

All five pages of the [2020 LPSC order](https://lpscpubvalence.lpsc.louisiana.gov/portal/PSC/ViewFile?fileId=SnuJItgVr6k%3D) were rendered and read, including conditions and signatures. The order preserves the 2020 chain and 53.9% Macquarie / 36.9% BCI / 9.2% John Hancock proportions through the passive BCI restructuring. It is not proof of September 2026 percentages. Preserve the existing `bcIMC Como Investment LP` vehicle; do not resolve the order's differing GP spellings by inventing an identity change.

## Capture provenance and limits

Successful raw HTTP retrieval at **2026-09-07T04:36:25.927Z** is frozen. Four 403 responses are denial bodies, not article or filing evidence. Only the new LPSC PDF exactly matches its historical bytes. Historical research and sources have their August 19 cutoff; no September lifecycle or closing is asserted.

| File | Method / HTTP | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| lpsc-2020.pdf | Raw / 200 | 103,491 | 9177b0a36370b2430020a69517637ed0472f2805da2591fc980c60c1040d8c90 |
| closing-2016.html | Denial / 403 | 5,508 | f2f37fb85e69cf05cb151213cf5341dcbb42a4fa5dcf229ca6bcfff4bcc0011b |
| sale-2026.html | Denial / 403 | 5,508 | 42682686a37d84735acc4fd5e640501d10e113cf1f25a7642553b1ff278f9813 |
| sec-2026.html | Denial / 403 | 4,818 | 777622628db33ef480791e887da7f57e7a512037ae45a3137a5d9cb1f7680c07 |
| sec-2017.html | Denial / 403 | 4,818 | 4041ef6be70279e171f3d7f25be74e3d031a915a30075fb860f24d2c82f29e4b |
| sec-2017-dom-excerpts.json | Rendered excerpts, 05:07:26.962Z | 4,432 | 3a8b997667ff35a28ec3ce1fefc23115fcb4a8f60a24521101884f0451acdaa5 |
| closing-2016-dom-excerpt.json | Rendered excerpt, 05:08:59.408Z | 1,056 | 1db2756e711f0e4e15e139b88f609af9c915001db9e4e4ece8c96679622f2351 |
| ../Puget bci-program.pdf | Reused protected PDF | 522,969 | 25c6d351d5642f2f4119cfc04568a0dbeb64016bd33bb97c2d54007c270f7e39 |

The two DOM artifacts preserve the actual method, character bounds, timestamps and exact excerpts. They are neither full-document captures nor raw HTTP bytes. The relevant complete SEC parent-company, Investors-definition and principal-owners sections were read; no whole-filing inspection claim is made. Ordinary browser access involved no access-control bypass. Never rerun successful captures or overwrite frozen evidence.

## Complete identity and history preservation

Preserve the complete canonical company, two aliases, 12 citations with unchanged SEC 2026 Q1 card primary, seven milestones, six management roles and all geographic/identity fields. Preserve all three owner IDs, organizations, legal vehicles, 2016 entry years, unavailable-current-percentage wording and SIGNED_PENDING_EXIT state. Preserve pending transaction `cmt5dkxj60010ujyybp8z66va`, its buyer identities and announcement/closing qualifications; do not create buyer ownership rows or assert that the sale closed.

The July 29 redirect from retired `cmrxpj8iu00miivhefl7xhjri` remains present and the retired company remains absent. Task 122 did not recreate that merge. BCI's fund unlink requires compatible canonical and seed persistence, preserving its organization identity. The already-cited BCI 2024 report confirms 36.9% for 2024 and 2023, whereas the canonical stake text says last confirmed in 2020 and one citation label names Puget. These are flagged separately for a dated compatible correction, not silently changed. Legacy 1933 milestone text versus the 1935 canonical founding field is preserved outside attribution scope. No full-company reconciliation is claimed.

Nine historical packet files and all four non-null attested hashes are bound. Initial and accepted responses are identical, with no repair. The transcript compiles prompt and initial response; it is not a full DOM trace. The historical inference and exact unavailable facts remain visible. No standalone research-binding artifact is fabricated.

Canonical proposal `0cf9cab89dfb8ad09276950ccff124e710c55ee7385551fe8f8d15c406cbb21f`, approval `ac2f02532fb8414e8e7afc3b823602268c925d74d37e48f587273c45c8b11e32` and member-one receipt `4574fd1dabf48ab369f15a14a3c91ac96e4ac89da0aa9d992e1b1b2a9847bf7c` are bound to whole batch receipt `482937a50b045ce83b20a53f5e5d3e371fc17a8dd728cac7be6d3948bf819497`. The exact existing seed spec `6f581d1c5bcb63b6b7b3dcd29db61a9c9929fd6f20041f1d430e18a9156c160f` contains all three current upserts. It uses the attribution subsystem's schema-normalized hash, not sorted PortCo hashing.

All three owners existed in the initial attribution receipt and their nine-field physical metadata still matches that historical state. Original record IDs `OFA-4A00A9128ED5`, `OFA-EECC367C2A0F`, `OFA-408AC99E8290` differ from current canonical seed IDs; both are explicitly retained. Receipt provenance and matching labels do not establish substantive fund authority. Never replay transaction `655cbe74-5435-4b4a-8e4c-04b5d091f9b8` or any attribution transaction.

## Frozen proof, release and remaining work

Target-pinned READ ONLY preparation passed once at **2026-09-07T05:14:25.972Z**, against protected-main base `319bc792b967938972572080ec300f1953736271`. Authority `dba615df0b6711db92872f8fd1a4ab41229d6cd3ec985ce62af96997a80ead40`; full scoped production state `b47f708c7999e9a27ea6a01c347992d77c59be409951adafd9976316e58edf6d`. All 29 protected dependencies, complete company semantics, all three owners' nine-field metadata, existing redirect, absent retired company, exact receipts and source bytes are bound. Binary dependencies are compared and hashed as bytes, never UTF-8-transcoded.

All 187 test files / 2,242 tests pass with two workers, including 86 scoped fail-closed tests for exact frozen reproduction and no input mutation, every source/packet hash, all owners and additional metadata, full company/pending/redirect drift, immutable receipt and seed-upsert lineage, duplicate/omitted scopes, and absence of write authority. Ordinary and strict targeted typechecks and ESLint pass. Two strict-test typing issues were corrected without changing assertions or frozen evidence; the final scoped suite was rerun successfully. Offline seed validation has zero errors and 54 existing warnings. Protected release results are recorded separately when available.

An independent distinct-field union against the original chronology yields **95/603 reviewed; 508 remain across 236 ownership records**. Cleco's three fields remain locally prepared until the protected release and exact canonical production proof complete. Additional fields do not reduce the original denominator. Prior physical corrections and compatible canonical issues remain unapplied, full-seed replay parity remains false, and final fresh reconciliation/counts/exception publication remains outstanding. Never run the full seed, even dry-run.

This scoped audit release also publishes the three R.E.L.A.M. PR941 postfiles. After merge, use only the ordinary Git-integrated Vercel route and require the exact full merge SHA before one exclusive matching READ ONLY postproof and guarded canonical smoke. Never repeat a successful phase. Task 126 Mosaic and 127 Nexus follow in deterministic completed-task order; do not start their scoped releases before Cleco is production-verified. Preserve every obsolete untracked artifact.
