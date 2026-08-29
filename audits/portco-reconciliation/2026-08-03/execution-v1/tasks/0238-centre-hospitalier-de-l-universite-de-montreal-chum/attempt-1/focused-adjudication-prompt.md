You are conducting a narrow ownership adjudication for a North American infrastructure portfolio-company census. Use current web research and open direct source pages. Do not redo a general company profile.

AS_OF_DATE: 2026-08-29
TASK: ledger:0238:centre-hospitalier-de-l-universite-de-montreal-chum:c4574e88
REQUESTED ASSET: Centre Hospitalier de l'Université de Montréal (CHUM) PPP
KNOWN PROJECTCO: Collectif Santé Montréal S.E.C. / Health Montréal Collective Limited Partnership

The existing research directly supports:
- John Laing Health Montreal Limited closed the purchase of OHLA's 25% interest on 2024-11-28.
- John Laing is ultimately owned by KKR-managed funds; KKR is not separately evidenced as a direct ProjectCo shareholder.
- AtkinsRéalis directly disclosed a 10% ProjectCo interest acquired on 2024-03-04.
- The existing repository attribution to Equitix through John Laing Investments Limited is unsupported for the 2024 transaction.
- The current legal holders of the remaining 65% were not resolved; the 2011 syndicate was Innisfree 30%, OHL 25%, Laing O'Rourke 25%, and Dalkia 20%.

Adjudicate only this question: Can reliable direct evidence resolve the current ProjectCo ownership sufficiently to replace the incorrect Equitix attribution and publish every current active ownership period without speculation? Search later transfers/exits. Distinguish ultimate manager ownership from direct ProjectCo equity.

Starting sources:
- https://www.ohla-group.com/en/inside-information-on-corporate-transactions-mergers-acquisitions-and-others/
- https://www.laing.com/insights/john-laing-acquires-stake-in-centre-hospitalier-de-luniversite-de-montreal-ppp-project/
- https://www.laing.com/portfolio/centre-hospitalier-de-luniversite-de-montreal-chum-canada/
- https://www.chumontreal.qc.ca/sites/default/files/inline-files/ANNEXE_3.pdf
- https://mcmillan.ca/deals-cases/mcmillan-advises-john-laing-group-on-strategic-acquisition-in-chum-p3-project/
- https://www.atkinsrealis.com/~/media/Files/A/atkinsrealis/investor-briefcase/en/2025/e_financial_statement_annual_2025.pdf
- https://www.lse.co.uk/rns/recommended-cash-acquisition-of-john-laing-group-jps0bk861zdyk32.html

Decision rule:
- Return PROPOSED_CORRECTION only if current active ownership is sufficiently resolved to publish every active ownership period without speculation.
- Otherwise return DEFERRED and state the exact missing current-cap-table fact.
- Do not retain Equitix/JLIL unless direct current ProjectCo evidence is found.

Return a concise Markdown explanation after exactly one machine-readable block:

BEGIN_JSON
{
  "asOfDate": "2026-08-29",
  "taskId": "ledger:0238:centre-hospitalier-de-l-universite-de-montreal-chum:c4574e88",
  "requestedCompany": "Centre Hospitalier de l'Université de Montréal (CHUM) PPP",
  "decision": "PROPOSED_CORRECTION or DEFERRED",
  "confidence": "HIGH or MEDIUM",
  "rationale": "...",
  "identityResolution": {"canonicalProjectCompany": "...", "resolved": true},
  "ownershipResolution": {"resolvedForApplication": false, "currentOwners": [], "formerOwners": []},
  "equitixDisposition": "EXCLUDED or SUPPORTED",
  "acquisitionExitCheck": {"searchedThrough": "2026-08-29", "result": "..."},
  "evidence": [
    {"label": "...", "url": "https://...", "purpose": "...", "isRecommendedPrimary": true}
  ],
  "unresolvedQuestions": ["..."],
  "recommendedListAction": "..."
}
END_JSON

Exactly one evidence row must have isRecommendedPrimary=true. Use direct HTTPS URLs, not search-result URLs or snippets.
