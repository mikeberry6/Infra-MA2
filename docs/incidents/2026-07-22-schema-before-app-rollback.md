# 2026-07-22 Production Schema-Mismatch Rollback

## Summary

The feature deployment for commit `1375c4a` was automatically assigned to the production domain before its additive Prisma migrations had been applied. Public detail APIs and the new health endpoint depended on tables/columns that were not yet present, so health returned HTTP 503 and detail requests returned HTTP 500.

Production was rolled back to the previously verified application at commit `6955a5d`. The canonical tracker subsequently returned HTTP 200. The restored legacy application predates `/api/health`, so a 404 from that endpoint is expected until the schema-first candidate is safely promoted.

## Impact

- Affected: the new health endpoint and lazy deal/fund/company detail endpoints during the short feature-deployment window.
- Not affected: source data integrity. No production migration, destructive statement, import, merge, or data rewrite was performed.
- Recovery mode: application rollback only; the production database was left unchanged.

## Root cause

Vercel tracked the feature branch as the production branch and automatically assigned the production domain. The deployment therefore bypassed the intended sequence of isolated migration validation, production schema staging, and application promotion.

## Recovery evidence

- Known-good application commit: `6955a5d`.
- Rolled-back candidate commit: `1375c4a`.
- Canonical verification: `GET /Infra-MA2/tracker` returned HTTP 200 after rollback.
- Database action: none.
- Data loss: none observed.

This incident constitutes a successful application rollback exercise. It does not constitute a database restore exercise.

## Corrective actions completed

- Created `main` at the known-good commit and made it the GitHub default branch.
- Protected `main` with strict required `build` status, one approval, stale-review dismissal, conversation resolution, administrator enforcement, linear history, and force-push/deletion protection.
- Changed Vercel production branch tracking to `main`.
- Disabled automatic assignment of production domains, requiring explicit promotion.
- Added isolated migration/data/browser CI, schema-stage, production-promotion, and rollback workflows.
- Added a health contract that distinguishes database unavailability from a reachable but unmigrated schema.
- Documented schema-first release, rollback, incident-response, and database-recovery procedures.

## Remaining follow-up

- Link the Neon/Vercel identity and create an isolated validation branch.
- Run the complete protected release gate against the isolated branch.
- Create and exercise a non-production Neon restore branch before the production release.
- Configure protected GitHub/Vercel environment secrets and exact database-host guards.
- Rotate the production administrator credential and `NEXTAUTH_SECRET` after the validated bootstrap release.
