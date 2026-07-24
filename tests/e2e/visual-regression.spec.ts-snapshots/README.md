# Visual baseline provenance

Linux CI baselines are separate from the generic local-development references
because Chromium text rasterization and text-driven control widths differ by
host operating system. Linux assertions use the reviewed
`maxDiffPixelRatio: 0.005`; generic local references retain `0.02` until their
separate platform refresh.

The Linux refresh below was reviewed against GitHub Actions run
[29977530918](https://github.com/mikeberry6/Infra-MA2/actions/runs/29977530918),
job `89112393676`, at PR head
`a8f2971946ae7802d0141cf3dc58226f377332b6` and exact tested merge commit
`7da25b431a575d07444254980ae14c9b0a4a9fc5`.

| Baseline | SHA-256 | Provenance |
| --- | --- | --- |
| `tracker-320-linux.png` | `31c7af857e3aacf221cd8abde0bf9ee96bff3e58d7381fc008761d1f77e6af96` | Clean hosted actual; byte-identical to the previously reviewed Linux baseline. |
| `tracker-390-linux.png` | `3b75e3ce7fd0a27e79b5117e46809433968447bf88fd59aaa22aa83811b2cb4b` | Clean hosted actual; byte-identical to the previously reviewed Linux baseline. |
| `tracker-768-linux.png` | `d924edba121d8836873c4ec79dbcb72111d75f6cdcde3e800783bda23c43a485` | Clean hosted actual; byte-identical to the previously reviewed Linux baseline. |
| `tracker-1280-linux.png` | `3ea20c548aff19c9ff9e1b46226034ea691bdbd667ef61f79acbd2a70cc2dcac` | Reviewed clean hosted actual; replaces the transitional cross-platform copy. |
| `tracker-1440-linux.png` | `48983881bafc6d638c0c4f018a04d34a5e8660deca7875c70971320545f5c373` | Reviewed clean hosted actual; replaces the transitional cross-platform copy. |

The preflight cleanup for this run removed eight historical synthetic deals
and thirteen synthetic sources before capture; the post-browser cleanup removed
the current run's one deal and two sources. All five retained actuals therefore
show the clean 352-deal validation state, and the 1280/1440 images were visually
reviewed before being versioned. This statement does not imply that any separate
canonical-company or citation backlog is complete. Generic local files are
intentionally retained and must not be used to infer a future Linux refresh.

## Representative public-route Linux baselines

The 30 Linux baselines for Funds, Portfolio, News, Dashboard, Search, and Login
were promoted from the retained actuals produced by GitHub Actions run
[30033130425](https://github.com/mikeberry6/Infra-MA2/actions/runs/30033130425),
job `89294317244`. The run checked PR head
`9131de36401f8598d88d888657981509b83c6793` as exact merge commit
`075dd4a1ab788bd807121885e9dd76a3b0c249f3`.

The deterministic visual gate ran before authenticated mutation journeys.
Its fixture preflight found no stale synthetic deal or source records to
remove. For every route-width pair, the initial actual, both retry actuals,
and the attached clean-actual evidence were byte-identical. All six
five-width contact sheets were visually reviewed for clipping, overflow,
missing content, responsive layout, and masking before promotion.

Per-file hashes are recorded in
`representative-linux-baselines.sha256`. Its SHA-256 is
`09b375060c3e17d14d8459d6f3f8bb1397a5640cee03a9e2d6f9b7e43e30a199`.
Verify the retained files from the repository root with:

```sh
(
  cd tests/e2e/visual-regression.spec.ts-snapshots
  shasum -a 256 -c representative-linux-baselines.sha256
)
```

This promotion validates visual references only. It does not imply that the
separate strict publication, citation, duplicate-company, or ownership-link
review queues are complete.

## Representative public-route candidates

Generic macOS candidates for Funds, Portfolio, News, Dashboard, Search, and
Login were added at 320, 390, 768, 1280, and 1440 CSS-pixel widths. They were
captured from a local production build based on
`4f112b3bae5bec9996f252df033ec394d6be73c4`, using Node 24.14.0,
Playwright 1.61.1, and the clean, non-production Neon Preview branch
`br-sparkling-firefly-ambnknjv` through its least-privilege
`preview_app_clean` role. The SHA-256 digest of the 30 candidate file hashes,
ordered by C-locale repository path, is
`8025d574aa746586160a619a41b1830ccb4f81fd567a02af4650a6df4ddeacf5`.
It is reproduced from the repository root with:

```sh
find tests/e2e/visual-regression.spec.ts-snapshots -maxdepth 1 -type f \
  | awk '/\/(funds|portfolio|news|dashboard|search|login)-(320|390|768|1280|1440)\.png$/' \
  | LC_ALL=C sort \
  | xargs shasum -a 256 \
  | awk '{print $1}' \
  | shasum -a 256
```

All six five-width contact sheets were visually reviewed.

The captures preserve route structure while masking only volatile values:
active database counts and metric values on Funds and Portfolio; updated time
and metric values on News; score, stance, updated time, and operations values
on Dashboard; metric values on Search; and nothing on Login. Each route-width
pair is an isolated test so one missing snapshot cannot prevent later actuals
from being collected.

These generic files remain macOS review references, not Linux substitutes. The
Linux files documented above came from reviewed CI actuals and were not copied
or manufactured from the generic candidates. Future refreshes must preserve
the Linux `maxDiffPixelRatio: 0.005`, fail closed for missing references, and
record the exact run, tested commit, validation-data state, and per-file hashes
before promotion.
