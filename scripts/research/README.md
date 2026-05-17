# Infrastructure M&A Research Prompts

This directory contains two research workflows:

- `protocol.md`: legacy batch loop protocol that advances `state.json`.
- `full-universe-protocol.md`: non-mutating full-universe protocol for one comprehensive weekly Codex run.

## Generate A Full-Universe Prompt

```bash
npm run research:full-universe-prompt -- --start 2026-05-09 --end 2026-05-15
```

The generated prompt is written to:

```text
scripts/research/output/full-universe-YYYY-MM-DD-to-YYYY-MM-DD.md
```

The generator embeds:

- the current manager and fund-vehicle universe from `prisma/seed-data/funds.ts`
- known fund-name aliases derived from manager names and fund vehicles
- existing repo deals dated inside the target period from `prisma/seed-data/deals.ts`

Use the generated Markdown as the single prompt for Codex when running a full weekly infrastructure M&A scan. The protocol asks Codex to search all managers, document exclusions, run a broad gap check, and return suggested repo updates without editing files.
