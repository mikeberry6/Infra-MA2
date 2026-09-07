# Environmental 360 Solutions: acquisition-vehicle and shareholder rationale authority

Audit-only review of three original attributionRationale fields for completed task140, Environmental 360 Solutions (`cmrxpj8wj00n3ivheefc305n4`). This report is not an apply manifest or database/seed-write authorization. All496 source tasks remain terminal with41 exact exceptions and an idle ledger.

## Decisions and primary sources

**3 production / 3 overlapping seed-rationale corrections remain unapplied**, with zero missing seed-upsert bindings. Ownership, classification, confidence, fund links, vehicles, stakes and dates are preserved.

- BlackRock owner `cmrxpju7d01kjivhel2xkl0z1` / `OFA-41CCFE0BB33B`: preserve DISCLOSED, BlackRock Global Infrastructure Fund IV, SCSp, null confidence, curated BlackRock GIF IV link, majority with undisclosed percentage and2023 entry. Exactly one field-primary: the [Competition Bureau archived merger-review table](https://competition-bureau.canada.ca/mergers-and-acquisitions/archived-report-merger-reviews?wbdisable=true), whose February2023 row identifies that legal fund opposite E360S, NAICS5622, ARC.
- Donato Ardellini owner `cmt5km2dm000xy8yyazng49cl` / `OFA-6705CCF4FC8C`: preserve DIRECT_PROGRAM, null attributed/curated fund, null legal vehicle and confidence, significant founder stake with undisclosed percentage and2018 entry. Exactly one field-primary: the [company shareholder page](https://e360s.ca/about-us/shareholders/), identifying him as a major individual shareholder.
- Canadian Business Growth Fund owner `cmt5km2j9000zy8yy8pv6w1xt` / `OFA-BB467B6D12FC`: preserve DIRECT_PROGRAM, null attributed/curated fund, null legal vehicle/confidence, minority with undisclosed percentage and2020 entry. Exactly one field-primary: the same shareholder page, confirming continuing minority participation.

The regulator row supplies the legal vehicle, not a closing date or numerical stake. The separate [February16,2023 closing release](https://e360s.ca/our-media/environmental-360-solutions-inc-announces-closing-of-acquisition-by-blackrock-alternatives/) confirms the majority closing but names only a fund managed by BlackRock's Diversified Infrastructure business—not Fund IV. Keep that distinction explicit when reconciling the current and seed rationales.

Current shareholder language does not date the founder/CBGF investments, quantify their stakes, or prove that no intermediary holding entity exists. Their seed currentVehicleName values are manager-name display fallbacks, not additional disclosed legal vehicles. The closing release separately supports founder retention and CBGF increasing an existing equity position. No new legal entity, percentage, fund or date is inferred.

## Evidence and compatible issues

All seven ordinary raw source requests succeeded once at **2026-09-07T13:39:06.194Z**: six historical research URLs plus the existing application home page. None of the six historical hashes matches current bytes. The Bureau URL redirects to /en/; the ordinary web extraction service timed out, but the independently captured raw200 HTML contains the complete archived table and exact E360S row. Every byte and retrieval provenance field is bound. No output is overwritten or recaptured.

The closing release names Almada as a founding majority investor whose interest BlackRock acquired. The existing canonical five-period history has BlackRock, the founder, CBGF, OPTrust and Oaktree, but no Almada period. This is a separate compatible historical-ownership issue, not resolved by this three-rationale audit; do not invent its dates, percentage or vehicle.

OPTrust and Oaktree retain their canonical2023 realized outcomes and existing UNRESOLVED/null attribution metadata. They are outside both the original active-owner603 denominator and the three E360S rows in the later repair. Exact equality preservation does not adjudicate those historical metadata fields.

The [October1,2024 BlackRock/GIP completion release](https://www.blackrock.com/corporate/newsroom/media/press-releases/blackrock-completes-acquisition-of-global-infrastructure-partners) concerns the manager acquisition, not direct E360S ownership-transfer authority. The [July13,2026 company-issued U.S. entry release](https://www.prnewswire.com/news-releases/environmental-360-solutions-enters-united-states-market-through-strategic-acquisition-302823114.html) concerns Marcotte's Michigan operating business, not a sale of the E360S platform. Its800,000-customer figure differs in date and denominator from the2023 closing release. Current home-page team-size and about-page founding text are corroboration, not enrichment instructions. Preserve the August23 canonical cutoff; no exhaustive September2026 ownership-event search is claimed.

## Immutable lineage

Canonical proposal `a834ec3c62ff18b3044df5b68f0d94d697e565d9554f2fefb88a7e98bc77f9f6`, approval `ae1211faf200e4c7f731e309e017dafad2948cadd176cc0bc0718c853e2ef452`, member-four receipt `7f96e1e4ce7b0968e30c1f62dd32f584c3077d19601fc5bd3f2da4b8c86533c0`, full batch receipt `c6d349f4781ddf5ef54af97c667af9d010b1cda7dfa0e51d1df2b5431ba724cf` and seed spec `245ae038901de94aa4b392e0df009fb52a8e4172f9906e73e31f38901c51c87e` remain exact.

All nine historical packet files and all four non-null attested hashes match. Accepted equals initial, repairCount zero; the transcript compiles prompt and initial response, not a full DOM trace. Preserve August19 research, August23 release-delta and locked-v2 snapshots. Earlier proposed-merge research does not override final CORRECT_COMPANY / ADD_OWNER actions with no company retirements or redirects.

The complete eight-row later repair receipt `f4f6dbc8efa819f40faeee1fc9984d54d9c0a1c1e68b9c47d0ef519591315953` / pipeline `cmt5lk19w0000duyy1u3zmmno` includes three E360S active owners. It already corrected BlackRock's old INFERRED/LOW FundIII metadata and the founder/CBGF UNRESOLVED state. Never replay that repair, PortCo transaction `7308e371-4af7-4112-8cb6-13148181f0ee`, or fabricate initial attribution membership.

The complete company, three aliases, six citations with unchanged closing application primary, two milestones, no management, five ownership/organization identities and45 physical metadata fields are preserved. OPTrust2020–2023 and Oaktree2021–2023 remain realized. Zero redirects, retired companies or pending transactions. No full-company reconciliation claim is made.

## Verification and release boundary

Target-pinned RepeatableRead READ ONLY preparation passed at **2026-09-07T13:43:44.813Z**, on exact protected-main base `c48cb1abb0d11a0f2d9bd21a5df751781d831703`. All29 protected dependency files match exact base bytes.

- Authority SHA: `fdc63a8850ca522f0d3a88e785260ebc128b024e29388f1331dda2c567f15fbe`.
- Scoped production SHA: `46bb27ab7f9308a2fe41c8082fff083dafa818e86a4f6a54a57823d38ae86cee`.
- Original scoped state SHA: `2942c4f41892b22e6a27306b45b0885c0461e0b680b81325fa3d43eec06ad46d`.
- Source-capture canonical SHA: `7f9994e0697eb93485dc07906ba4af583ccc530bb4b417c8112e6f7cfc1e98e2`.

All194 local test files / 2,889 tests pass with two workers, including110 scoped fail-closed tests. Ordinary and strict targeted typechecks, scoped ESLint and offline seed validation pass (zero errors,54 existing warnings). Tests cover all45 physical metadata fields, exact packets/sources/dependencies, historical-owner exclusions, seed fallback labels, complete canonical after-image and immutable batch/repair receipts. A pre-capture local syntax error was corrected; it produced no DB access or artifact. Successful capture and preparation remain exclusive.

Independent union across27 authority reports: **123/603 original fields reviewed;480 remain across220 ownership records**, zero duplicate or unknown decisions. These are reviewed, not applied. All physical persistence, compatible issues and full-seed replay parity remain outstanding. Never run the lossy full seed runner, even dry-run.

This release contains only E360 audit artifacts/scripts and Clearway's three verified PR948 postfiles. Require ordinary protected PR CI, exact full merge SHA on canonical Git-integrated production, exclusive matching READ ONLY postproof and guarded smoke before selecting another target. No database/seed writes, source transitions/bundles, company/ChatGPT research, Deal Database/runtime/UI changes or enrichment. No new rendered-card claim for this audit-only release. Preserve all obsolete untracked files.
