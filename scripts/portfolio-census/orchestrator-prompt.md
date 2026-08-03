# Sequential ChatGPT web portfolio census

Run a review-only North American infrastructure portfolio census as of **{{AS_OF_DATE}}**.

## Outcome

Process the exact 100-manager order in `scripts/research/manager-universe.json`. Use one fresh ChatGPT web conversation per manager, configured to GPT-5.6 Sol in Pro mode. Complete and validate one manager before starting the next; concurrency must remain exactly one.

This workflow may create prompt, snapshot, raw-response, JSON, Markdown, and manifest artifacts under `audits/portfolio-census/{{AS_OF_DATE}}/`. It must not modify the database, Prisma seed data, ownership periods, portfolio records, publication state, or application code.

## Initialize or resume

1. Read the repository instructions and `scripts/portfolio-census/README.md`.
2. Use the Chrome browser workflow because the task depends on the user's signed-in ChatGPT web session.
3. If `audits/portfolio-census/{{AS_OF_DATE}}/manifest.json` does not exist, run:

   `npm run portfolio:census:init -- --as-of {{AS_OF_DATE}}`

4. If the manifest exists, validate and resume it. Never replace a completed artifact or reset progress.
5. Ignore `scripts/research/batches.json` and the legacy batch state.

## Per-manager loop

For the manifest's next `PENDING` or explicitly resumed `FAILED` manager:

1. Mark the manager in progress:

   `npm run portfolio:census:state -- --run-dir audits/portfolio-census/{{AS_OF_DATE}} --manager-index <N> --action start`

2. Build the repo snapshot and worker prompt:

   `npm run portfolio:census:prompt -- --run-dir audits/portfolio-census/{{AS_OF_DATE}} --manager-index <N>`

   The builder must use the configured read-only Prisma source when available and record an evaluated seed fallback when it is not.

3. In Chrome, open a new ChatGPT conversation. Before submitting:
   - verify the selected model is GPT-5.6 Sol;
   - verify Pro mode is active;
   - verify web research is available; and
   - pause if authentication, model, mode, or research access is unavailable.

4. Submit only the generated per-manager prompt. Wait until ChatGPT has finished and the response contains both closing markers:
   - `</portfolio_census_json>`
   - `</portfolio_census_report>`

5. Save the complete raw response under the run's `raw/` directory, then validate it:

   `npm run portfolio:census:validate -- --run-dir audits/portfolio-census/{{AS_OF_DATE}} --manager-index <N> --input <raw-response-path>`

6. If validation fails, send exactly one repair message in the same ChatGPT conversation. Include the validator's exact errors and say:

   `Regenerate the complete two-section response. Preserve researched facts and source URLs, correct only the stated contract failures, recompute summary counts, and return no text outside the required markers.`

   Save and validate the replacement response. If the second validation fails, mark the manager failed and pause:

   `npm run portfolio:census:state -- --run-dir audits/portfolio-census/{{AS_OF_DATE}} --manager-index <N> --action fail --error "<concise failure>"`

7. Ingest the validated response:

   `npm run portfolio:census:ingest -- --run-dir audits/portfolio-census/{{AS_OF_DATE}} --manager-index <N> --input <raw-response-path>`

8. Confirm the JSON, Markdown, and manifest paths printed by the ingestion command. Start the next manager only when the prior manager is `COMPLETE`. If ChatGPT returns `BLOCKED`, preserve its artifacts and pause.

## Stop conditions

Pause with a concise manifest error when:

- ChatGPT sign-in is required;
- GPT-5.6 Sol or Pro mode cannot be verified;
- web research is unavailable;
- manager identity cannot be resolved;
- the worker response remains invalid after one repair;
- browser control is disconnected; or
- an artifact would overwrite completed work.

Do not continue past a failure and do not substitute a different model or research surface.

## Completion

The run is complete only when all 100 manifest entries are `COMPLETE`. Report total holdings, closed-active holdings, pending incoming and exit holdings, proposed additions, corrections, duplicates, review items, and the artifact directory. Do not enrich scorecards or apply any proposed portfolio changes.
