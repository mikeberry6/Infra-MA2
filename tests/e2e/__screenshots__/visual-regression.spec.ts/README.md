# Visual baseline provenance

Linux CI baselines are separate from the generic local-development references
because Chromium text rasterization and text-driven control widths differ by
host operating system. The assertion threshold remains
`maxDiffPixelRatio: 0.02`.

The Linux refresh below was reviewed against GitHub Actions run
[29964605472](https://github.com/mikeberry6/Infra-MA2/actions/runs/29964605472),
job `89073222561`, at exact application commit
`41fd16e27e68dbc32941efe53a9e3236013b01a5`.

| Baseline | SHA-256 | Provenance |
| --- | --- | --- |
| `tracker-320-linux.png` | `31c7af857e3aacf221cd8abde0bf9ee96bff3e58d7381fc008761d1f77e6af96` | Hosted Linux actual; initial attempt and both retries were byte-identical. |
| `tracker-390-linux.png` | `3b75e3ce7fd0a27e79b5117e46809433968447bf88fd59aaa22aa83811b2cb4b` | Hosted Linux actual; initial attempt and both retries were byte-identical. |
| `tracker-768-linux.png` | `d924edba121d8836873c4ec79dbcb72111d75f6cdcde3e800783bda23c43a485` | Hosted Linux actual; initial attempt and both retries were byte-identical. |
| `tracker-1280-linux.png` | `a3d2ee4f36cefadcaedebcb7ff7b1b95b91fc8386314b460beb626d30a4e221e` | Transitional byte-identical copy of `tracker-1280.png`; the hosted Linux assertion passed against that reference at the unchanged threshold, but no passing-test actual was retained. |
| `tracker-1440-linux.png` | `a988dc1d6f06eb8df1b34181cd3fbd816126aa885d7d8fc0c80ac5d7b9622783` | Transitional byte-identical copy of `tracker-1440.png`; the hosted Linux assertion passed against that reference at the unchanged threshold, but no passing-test actual was retained. |

The three hosted actuals reflect the clean validation-branch fund-activity
ranking (`EQT Infrastructure` has 17 activities), unlike the stale generic
mobile references (`EQT Infrastructure` has 18). This statement does not imply
that any separate canonical-company merge backlog is complete. The original
generic files are intentionally retained. A future 1280/1440 refresh must use
reviewed actual output from an exact Linux CI commit and replace the
transitional hash in this table; it must not be inferred from a different
platform.
