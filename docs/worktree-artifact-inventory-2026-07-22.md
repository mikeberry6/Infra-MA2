# Worktree Artifact Inventory — 2026-07-22

This inventory was created before repository cleanup. Unclassified or user-authored material was preserved; no bulk deletion or history rewrite was performed.

## Preserve outside this implementation

- Research reports, acquisition screens, prompts, and generated outputs under `audits/`, `output/`, `outputs/`, `research_prompts/`, and `scripts/research/`.
- User-authored fund-source work, fund refresh foundations, manifests, and supporting workflow/scripts.
- Historical weekly email editions, templates, quarterly email assets, and email image assets.
- Portfolio/deal research CSV, JSON, Markdown, PDF, and image evidence.
- Existing tracked modifications to project instructions and research datasets.

These items remain in the worktree and are intentionally excluded from the InfraSight cleanup commit until their owner and retention state are reviewed.

## Repository-managed implementation artifacts

- Application, migration, test, workflow, and operations-document changes directly tied to the 90-day strategy.
- Reviewed canonical-company merge report at `audits/company-canonical-merge-review-2026-07-22.md`; it is evidence only and performs no merge.
- Playwright visual baselines at the five required viewport widths.

## Ephemeral local artifacts

- `tmp/`, Playwright reports/traces, `.agents/`, `.claude/worktrees/`, and `.codex-work/` are ignored going forward.
- The formerly tracked `tmp/news-scan-summary.json` is retained locally but removed from version control when the cleanup commit is staged.

## Package-manager files

The stale `pnpm-lock.yaml` and `pnpm-workspace.yaml` did not describe an intentional active workspace and conflicted with the npm-only policy. They were moved, not deleted, to:

`/Users/mikeberry6/Infra-MA2-artifact-archive-2026-07-22/`

The archive can be restored if a later reviewed package-manager migration needs either file.
