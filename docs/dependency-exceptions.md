# Dependency Advisory Register

**Owner:** Engineering
**Review date:** 2026-08-22

Production dependencies currently pass `npm audit --omit=dev --audit-level=high` with zero critical, high, moderate, or low findings. A full development-tree audit has no critical or high findings after individually updating the affected transitive packages.

## Accepted development-only advisory

| Package path | Severity | Exposure assessment | Decision |
| --- | --- | --- | --- |
| `exceljs@4.4.0 > uuid@8.3.2` | Moderate, `GHSA-w5hq-g745-h8pq` | `exceljs` is a development-only utility. Its code path calls UUID v4 without a caller-provided output buffer; the advisory affects buffer handling in UUID v3/v5/v6. It is not shipped in the public application bundle or reachable from a request route. | Time-bounded acceptance. Recheck for an upstream ExcelJS release using `uuid >= 11.1.1`; do not force a cross-major transitive override without export regression testing. |

The npm-suggested automated remedy downgrades ExcelJS across a major range and is therefore not accepted as an unreviewed audit rewrite. The production audit remains a required release gate; any future critical/high production finding blocks release.
