Your response was truncated inside `acquisitionExitCheck` and is invalid JSON. This is the one allowed repair. Do not perform new research or change the substantive findings.

Return the complete response again as one fenced `json` object followed by at most two concise Markdown bullets. Include every required top-level key from the original prompt. Keep it under 4,500 characters and at most 7 evidence rows.

Repair these schema defects while preserving the findings:

- Complete the truncated object and all missing top-level keys.
- Every current-owner row must include `isActive:true` and `transactionState:"CLOSED_ACTIVE"`; every former-owner row must include `isActive:false` and `transactionState:"REALIZED"`.
- Ownership rows may contain only the allowed ownership fields from the original prompt.
- Use direct, clean HTTPS evidence URLs without tracking parameters.
- Recommend exactly one primary source.
- Treat the reported 2025 change of control and 2025 sale exploration as reputable-secondary evidence, clearly distinguishing them from primary disclosures.
- Keep `pendingOwnershipTransactions` empty unless a signed platform transaction was found.

Output only the repaired fenced JSON and Markdown review.
