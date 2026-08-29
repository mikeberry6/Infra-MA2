You are resolving one narrow ownership question for a North American infrastructure portfolio census as of 2026-08-29. Do not redo the full company profile.

COMPANY: New Leaf Energy, Inc. (formerly 2022 Solar Development, Inc.), the solar and storage development business carved out of Borrego and acquired by Energy Capital Partners in 2022.

QUESTION: Did Walsin America retain a current direct minority ownership interest in New Leaf Energy after the July 27, 2022 closing, or were/could the 88,729 shares shown as transferred to Walsin America in Walsin Lihwa's 2022 annual report later be disposed of, cancelled, redeemed, or otherwise cease to represent current ownership?

KNOWN PRIMARY EVIDENCE:
- Walsin 2022 annual report: https://www.walsin.com/wp-content/uploads/2023/02/2022-Annual-Report_EN.pdf - page 274 shows 1,371,729 New Leaf shares disposed to ECP and 88,729 shares transferred to Walsin America; page 207 confirms the July 27 close.
- Walsin sale announcement: https://www.walsin.com/en/walsin-lihwa-corporation-announced-the-sale-of-its-u-s-solar-development-business-to-ecp-for-restructuring-its-business-strategy-of-green-energy/
- ECP close announcement: https://www.ecpgp.com/about/news-and-insights/press-releases/2022/borrego-completes-spin-off-and-sale-of-solar-and-energy-storage-development-business-to-ecp
- ECP current portfolio page: https://www.ecpgp.com/equity/portfolio/new-leaf-energy

RESEARCH REQUIRED:
1. Open the cited direct pages/PDF, not snippets.
2. Search Walsin's 2023, 2024, 2025 and 2026 reports/filings, New Leaf corporate or regulatory filings, ECP materials, and credible transaction/regulatory records for the 88,729-share block or any later transfer/redemption/cancellation.
3. Distinguish current legal equity from historical seller rollover, contingent consideration, or a temporary closing allocation.
4. Search for any later New Leaf platform sale or owner transfer.
5. Do not infer an exit merely because later reports omit the holding; explain the evidentiary value of an omission.

Return one strict JSON object followed by a concise Markdown summary. JSON schema:
{
  "asOfDate":"2026-08-29",
  "company":"New Leaf Energy, Inc.",
  "decision":"WALSIN_CURRENT_MINORITY"|"WALSIN_EXITED"|"UNRESOLVED",
  "confidence":"HIGH"|"MEDIUM"|"LOW",
  "currentOwners":[{"name":string,"status":"CURRENT"|"POSSIBLE_CURRENT","stake":string|null,"basis":string}],
  "walsinShareBlock":{"shares":88729,"2022ClosingTreatment":string,"laterDispositionEvidence":string|null,"currentStatusBasis":string},
  "laterPlatformExitFound":boolean,
  "evidence":[{"url":string,"sourceDate":string|null,"claimSupported":string,"primary":boolean}],
  "searchedButNotFound":[string],
  "productionRecommendation":"ADD_WALSIN_OWNER"|"KEEP_ECP_ONLY"|"DEFER_OWNERSHIP_CHANGE",
  "rationale":string,
  "unresolvedQuestions":[string]
}

Success standard: choose WALSIN_EXITED / KEEP_ECP_ONLY only with affirmative evidence that the 88,729 shares ceased to represent current ownership. If no affirmative later disposition is found, use UNRESOLVED / DEFER_OWNERSHIP_CHANGE unless direct current evidence proves Walsin still owns the shares.
