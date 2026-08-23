Return one full replacement response in the original BEGIN_JSON / END_JSON / BEGIN_REVIEW / END_REVIEW format. Preserve all supported conclusions, but repair only these validation issues:

1. The recommended Aware Super current co-investor row needs direct evidence coverage. Add an evidence row for Aware's current infrastructure portfolio and a direct transaction-party or manager source for the 2023 co-investment if available. If the exact July 13, 2023 announcement date is not directly supported, change it to NOT_PUBLICLY_DISCLOSED rather than inferring it.
2. Either add the Reuters URL as an evidence row supporting the reported, non-closed IPO context or remove that URL and the IPO milestone. Do not treat a confidential filing report as a signed or closed ownership transfer.
3. The two stake/nesting gaps are noncritical disclosure limitations, not material unresolved identity or current-ownership questions. Use NOT_PUBLICLY_DISCLOSED wording and do not prefix them with UNRESOLVED. The owner identities and active status remain resolved.
4. Keep no more than eight evidence rows, exactly one recommended primary, all mandatory top-level keys, the prescribed owner/evidence schemas, and the response under 7,500 characters.

Do not change any other supported finding or introduce a new inferred owner, fund, stake, date, exit, or transaction.
