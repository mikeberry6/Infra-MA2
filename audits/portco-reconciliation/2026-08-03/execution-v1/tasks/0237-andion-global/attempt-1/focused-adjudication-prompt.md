You are conducting a narrow inclusion and ownership adjudication for a North American infrastructure portfolio-company census. Use current web research and open direct source pages. Do not redo a general company profile.

AS_OF_DATE: 2026-08-29
TASK: ledger:0237:andion-global:05d3742d
REQUESTED COMPANY: Andion Global
KNOWN SUCCESSOR IDENTITY: Andion CH4 Renewables
REQUESTED MANAGER: Equitix

The stored research is internally inconsistent: its summary says EXCLUDED/HIGH, but its accepted research result says DEFERRED/MEDIUM. It found that the former Canadian Andion Global migrated to Luxembourg and now presents as Andion CH4 Renewables, a European biomethane platform. It did not conclusively establish either (a) a current North American manager-level company or (b) the current direct Equitix ownership chain. Individual North American projects do not by themselves satisfy the manager-level company test.

Adjudicate only these questions:
1. As of 2026-08-29, is the manager-level Andion platform primarily based in or dedicated to the United States, Canada, or Mexico?
2. Is current direct Equitix ownership of that manager-level platform supported by reliable evidence after searching for later transfers and exits?

Starting sources:
- https://www.businesswire.com/news/home/20220228006263/en/Andion-Global-Secures-%24270-Million-to-Expand-Operations-and-Deployment-of-Waste-Processing-Plants-to-Upcycle-Organic-Waste-and-Create-Renewable-Energy
- https://www.bennettjones.com/News/Client-Work/Andion-Global-Secures-270-Million-to-Expand-Operations
- https://www.gsk-lux.com/en/gsk-stockmann-advises-andion-ch4-renewables-on-the-first-capital-raise-after-its-migration-from-canada-to-luxembourg/

Decision rule:
- Return EXCLUDED only if current evidence affirmatively establishes that the manager-level platform is outside the North American definition or that Equitix no longer owns it.
- Return PROPOSED_CORRECTION only if both North American qualification and current direct Equitix ownership are supported.
- Otherwise return DEFERRED with the exact missing fact. Do not infer ownership from the 2022 financing alone or geography from individual projects.

Return a concise Markdown explanation after exactly one machine-readable block:

BEGIN_JSON
{
  "asOfDate": "2026-08-29",
  "taskId": "ledger:0237:andion-global:05d3742d",
  "requestedCompany": "Andion Global",
  "decision": "EXCLUDED or PROPOSED_CORRECTION or DEFERRED",
  "confidence": "HIGH or MEDIUM",
  "rationale": "...",
  "identityResolution": {"canonicalName": "...", "resolved": true},
  "northAmericaResolution": {"resolved": false, "result": "..."},
  "ownershipResolution": {"resolvedForApplication": false, "currentOwners": [], "formerOwners": []},
  "acquisitionExitCheck": {"searchedThrough": "2026-08-29", "result": "..."},
  "evidence": [
    {"label": "...", "url": "https://...", "purpose": "...", "isRecommendedPrimary": true}
  ],
  "unresolvedQuestions": ["..."],
  "recommendedListAction": "..."
}
END_JSON

Exactly one evidence row must have isRecommendedPrimary=true. Use direct HTTPS URLs, not search-result URLs or snippets.
