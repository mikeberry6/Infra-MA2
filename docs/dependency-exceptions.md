# Dependency Advisory Register

**Owner:** Engineering
**Review date:** 2026-08-22

Both the complete dependency tree and the production-only tree pass `npm audit --audit-level=high` with zero findings as of 2026-07-22. There are no accepted critical or high-severity exceptions.

The lockfile deliberately resolves patched transitive versions of `brace-expansion`, `js-yaml`, `sharp`, `tmp`, `uuid`, and `vite`. These overrides were reviewed individually instead of applying `npm audit fix --force`. The Excel workbook compatibility test covers ExcelJS after the `tmp` and `uuid` overrides.

Future exceptions must record the package path, severity, reachable code path, exploitability, owner, expiration/review date, and compensating control. A critical or high production advisory blocks release unless a time-bounded exception is approved and committed here.
