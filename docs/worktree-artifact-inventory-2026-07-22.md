# Worktree Artifact Inventory — 2026-07-22

This inventory was created before repository cleanup. Unclassified or user-authored material was preserved; no bulk deletion or history rewrite was performed.

## Preserve outside this implementation

- Research reports, acquisition screens, prompts, and generated outputs under `audits/`, `output/`, `outputs/`, `research_prompts/`, and `scripts/research/`.
- User-authored fund-source work, fund-refresh foundations, manifests, and supporting scripts.
- Historical weekly email editions, templates, quarterly email assets, and email images.
- Portfolio/deal research CSV, JSON, Markdown, PDF, and image evidence.
- Existing tracked modifications to project instructions and research datasets.

These items are intentionally excluded from the Phase 1 release until their owner and retention status are reviewed.

## Repository-managed Phase 1 artifacts

- Runtime, lockfile, authentication, security-header, migration, test, CI, and operations-document changes.
- The additive `AuthThrottle` migration. No editorial data is changed by it.

## Ephemeral local artifacts

- `tmp/`, Playwright reports/traces, `.agents/`, `.claude/worktrees/`, and `.codex-work/` are ignored.
- Ephemeral scan summaries are not release artifacts.

## Package-manager policy

npm is the sole package manager. Only `package-lock.json` is versioned. No pnpm workspace or lockfile is part of this release branch.
