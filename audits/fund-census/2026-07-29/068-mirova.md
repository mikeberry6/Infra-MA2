Mirova — North American direct infrastructure fund census
Conclusion
The census is scope-gated. The authoritative repository snapshot flags Mirova as knownManager=false, which contractually requires an out-of-scope result with no fund rows.
This holds even though official sources confirm that Mirova is an active global sustainable infrastructure investor and asset manager. The discrepancy between real-world activity and the repository manifest is recorded as a governance conflict rather than resolved within this task.
Key identity observations from official materials:


Mirova operates as a sustainable investment affiliate of Natixis Investment Managers.


It has historical lineage within Natixis Asset Management / Ostrum Asset Management.


As of January 2026, Thematics Asset Management was merged into Mirova, expanding the platform while retaining the Mirova name.
Source: https://www.mirova.com/en/news/merger-mirova-thematics-am-US


Included funds
No included funds.
Per contract, no vehicle-level census is performed when knownManager=false.
FundVehicle typeLifecycleNA qualificationSize basisRepository dispositionEvidenceNone——————
Repository reconciliation


Verified rows: None (no repository entries provided).


Proposed additions: None (prohibited under scope rules).


Corrections / duplicates: None.


Review items: One governance conflict — the manager exists in supplied universe but not in canonical manifest.


Exclusions and unresolved issues


No fund-level exclusions were evaluated due to scope gating.


Primary unresolved issue:
The repository manifest excludes Mirova (knownManager=false), while:


The supplied manager universe includes “Mirova”


Official sources confirm it is an active infrastructure investor
(e.g., https://www.mirova.com/en)




This conflict prevents fund identification and must be resolved via manifest governance, not analyst inference.


Completeness


Fund-page coverage: Limited to representative official materials (manager site and strategy disclosures) due to scope gate.


Fundraising / close searches: Performed at a high level (e.g., infrastructure strategy materials), but not exhaustively enumerated.


Holding attribution checks: Not performed (no fund census allowed).


Aliases and successors: Reviewed and documented (Natixis AM lineage; Thematics merger).


Parallel vehicle review: Not performed due to scope restriction.


Inaccessible sources: None material.


Overall, the result is complete and contract-valid: the absence of fund rows is intentional and required by the repository scope constraint.
