Repair only these two evidence-quality defects while preserving the complete JSON schema and the concise Markdown review:

1. The October 2022 closing day is conflicted: the PJM Market Monitor reports 2022-10-30, while the FERC MBR asset appendix reports 2022-10-31. Do not resolve that conflict by choosing one day. Change every day-level October 2022 closing/entry claim to month precision (use "2022-10" for entryDate and describe it as October 2022), and retain the one-day source conflict in unresolvedQuestions/evidence notes.
2. Replace the third-party LEI Register evidence URL with the direct GLEIF API sources:
   - Sequitur entity: https://api.gleif.org/api/v1/lei-records/254900IHCZT8GGFOZW95
   - ultimate-parent relationship: https://api.gleif.org/api/v1/lei-records/254900IHCZT8GGFOZW95/ultimate-parent-relationship
   - Fund VII entity: https://api.gleif.org/api/v1/lei-records/549300LD7O6QR7ZLUB34
Use these direct sources for legal identity, c/o ArcLight Boston address, active consolidation relationship, and Fund VII identity.

Do not change the PROPOSED_CORRECTION decision, HIGH confidence, canonical identity, Fund VII attribution, current ArcLight ownership, active status, no-exit conclusion, or any other supported fact. Return the entire corrected JSON object and complete Markdown review, not a patch or abbreviated response.
