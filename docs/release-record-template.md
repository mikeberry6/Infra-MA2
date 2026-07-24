# InfraSight Phase 1–4 Release Record

## Identity and scope

- Release/date:
- Program phase:
- Independent phase scope and explicit exclusions:
- Integration source pull request (never the production release pull request):
- Approved 40-character Git SHA:
- Production release pull request:
- Exact-SHA Release Gate run and retained artifacts:
- Operators and independent approvers:

## Database and Research gates

- Isolated Neon validation branch/host:
- Current production application SHA:
- Verified production migration-baseline SHA:
- Migration-manifest SHA-256:
- Migrations applied and status/drift artifacts:
- Database verification artifact:
- Strict publication/source gate result:
- Company-merge approval SHA-256, reviewer, or blocked:
- Ownership-link approval SHA-256, reviewer, or blocked:
- Fund primary-source approval SHA-256, reviewer, or blocked:
- Seller-disclosure approval SHA-256, reviewer, or blocked:
- Primary-citation approval SHA-256, reviewer, or blocked:
- Source-coverage percentages:
- Duplicate/merge and ownership-link result:
- Production restore branch ID and creation time:

## Pipelines, browser evidence, and Preview

- Dashboard latest success / rolling success rate / observation window:
- News latest success / rolling success rate / observation window:
- Pipeline validation artifact:
- Preview smoke and authenticated journey result:
- Axe/keyboard/responsive/visual artifact and result:
- Human accessibility review record/status (never infer from automation):
- Production dependency audit:
- Complete dependency audit:
- Public bundle-budget artifact / tracker, funds, portfolio results:
- Candidate deployment ID / immutable URL / Vercel target:
- Candidate Git SHA / Vercel project ID / GitHub repository ID:
- Candidate `VERCEL_DEPLOYMENT_ID` or approved per-deployment cache namespace:
- Candidate health HTTP status / exact 12-character version / critical-pipeline states:

## Production and observability

- Prior known-good deployment ID / immutable URL / Git SHA:
- Promotion workflow run and time (UTC):
- Canonical production health HTTP status / exact 12-character version / critical-pipeline states:
- Public route smoke result:
- Admin/import-preview/export authorization result:
- Observability review owner / route errors / database latency / provider latency:
- Performance evidence provider / plan / available reporting-window days:
- Production observation start / end / release SHA / deployment ID:
- Mobile p75 LCP / INP / CLS / sample counts / route scope:
- Desktop p75 LCP / INP / CLS / sample counts / route scope:
- Performance evidence reviewer / observation time / retained aggregate artifact:
- Analytics fixed-event allowlist review:
- Administrator credential rotation completed by / time (no value):
- `NEXTAUTH_SECRET` rotation completed by / time (no value):

## Rollback and recovery

- Rollback trigger and selected immutable deployment:
- Candidate verification artifact:
- Rollback workflow run / artifact:
- Canonical production smoke result:
- Recovery time:
- Database restore exercise workflow run / retained artifact:
- Recovery environment reviewer / approval time:
- Source branch ID / restored branch ID:
- Recovery point kind / exact LSN or timestamp / recovery time achieved:
- Migration ledger / schema drift / local public smoke / post-smoke fidelity:
- Guarded cleanup outcome / cleanup time:
- Recovery janitor latest successful run / orphan or anomaly count:
- Recovery discrepancies / owner / deadline:
- Follow-up actions:

## Exceptions and follow-up

For each exception, record scope, risk/exploitability, owner, deadline, approval, and review date.

Never record passwords, tokens, connection strings, private imported data, or secret values in this document.
