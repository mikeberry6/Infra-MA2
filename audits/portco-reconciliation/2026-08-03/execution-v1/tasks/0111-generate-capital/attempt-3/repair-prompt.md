Your JSON parsed, but evidence validation failed on one required rule. It says AustralianSuper and QIC have direct current support, while Harbert and CBRE continuity is only inferential, then classifies Harbert and CBRE as `CLOSED_ACTIVE` solely because no later exit was found. The original prompt explicitly prohibited that inference, and the program requires current direct evidence for every active owner.

Return one complete replacement using the same plain-text `BEGIN_JSON` / `END_JSON` and `BEGIN_REVIEW` / `END_REVIEW` markers, with no code fence or backticks. For Harbert and CBRE, do exactly one of the following:

1. Cite a direct current official company, manager, fund, regulatory, or filing source that affirmatively supports continuing Generate ownership as of the current period, and explain that basis in `acquisitionExitCheck.currentStatus`; or
2. Do not place them in `currentInfrastructureManagerOwners` or `formerInfrastructureManagerOwners`, because neither current status nor an exit is proven. Set `decision` to `DEFERRED`, identify both active-ownership questions as `UNRESOLVED`, and recommend no mutation until resolved.

Do not retire Harbert or CBRE without exit evidence. Preserve the supported Generate identity, operating facts, AustralianSuper December 2019 entry, QIC 23.5% current stake, direct URLs, exactly one primary, and the explicit platform exit search. Keep the replacement under 7,500 characters. This is the single permitted evidence-contract repair.
