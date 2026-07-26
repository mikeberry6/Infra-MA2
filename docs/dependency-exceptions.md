# Dependency Advisory Register

**Owner:** Engineering
**Review date:** 2026-08-23

Both the complete dependency tree and the production-only tree pass `npm audit --audit-level=high` with zero findings as of 2026-07-23. There are no accepted critical or high-severity exceptions.

The lockfile deliberately resolves patched transitive versions of `brace-expansion`, `find-my-way`, `js-yaml`, `sharp`, `tmp`, `uuid`, and `vite`. These overrides were reviewed individually instead of applying `npm audit fix --force`. `find-my-way` 9.7.0 closes GHSA-c96f-x56v-gq3h in Prisma 7.9.0's transitive development tooling while preserving Prisma 7.9.0 as one aligned client/CLI/adapter set; its declared Node requirement is compatible with the Node 24 baseline. The Excel workbook compatibility test covers ExcelJS after the `tmp` and `uuid` overrides.

Future exceptions must record the package path, severity, reachable code path, exploitability, owner, expiration/review date, and compensating control. A critical or high production advisory blocks release unless a time-bounded exception is approved and committed here.
