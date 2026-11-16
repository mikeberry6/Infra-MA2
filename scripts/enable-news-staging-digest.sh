#!/usr/bin/env bash
set -euo pipefail

if [[ "${NEWS_PIPELINE_TARGET:-}" != staging || "${GITHUB_REF_NAME:-}" == main ]]; then
  echo "::error::The digest activation requires a non-main staging workflow."
  exit 1
fi
for name in VERCEL_TOKEN VERCEL_PROJECT_ID VERCEL_ORG_ID GITHUB_REF_NAME GITHUB_RUN_ID GITHUB_RUN_ATTEMPT NEWS_STAGING_URL NEWS_STAGING_DEPLOYMENT_ID NEWS_STAGING_SCHEDULE_NAME NEWS_TXNM_STAGING_DRAFT_ID; do
  if [[ -z "${!name:-}" ]]; then
    echo "::error::$name is required to verify the staging digest."
    exit 1
  fi
done
preview_run="${NEWS_STAGING_PREVIEW_RUN:-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT}"
[[ "$preview_run" =~ ^[0-9]+-[0-9]+$ &&
  "$NEWS_STAGING_URL" == "https://infra-ma-2-news-stage-$preview_run.vercel.app/Infra-MA2" &&
  "$NEWS_STAGING_SCHEDULE_NAME" == "stage-news-digest-$preview_run" &&
  "$VERCEL_ORG_ID" =~ ^team_[A-Za-z0-9]+$ && "$VERCEL_PROJECT_ID" =~ ^prj_[A-Za-z0-9]+$ ]]
node --experimental-strip-types scripts/assert-database-target.ts

auth_header="Authorization: Bearer $VERCEL_TOKEN"
stage_host="${NEWS_STAGING_URL#https://}"
stage_host="${stage_host%%/*}"
deployment="$(curl -fsS --max-time 30 -H "$auth_header" "https://api.vercel.com/v13/deployments/$stage_host?teamId=$VERCEL_ORG_ID")"
jq -e --arg target "$NEWS_STAGING_DEPLOYMENT_ID" --arg project "$VERCEL_PROJECT_ID" --arg branch "$GITHUB_REF_NAME" \
  --arg run "${preview_run%-*}" --arg dbbranch "$NEWS_STAGING_BRANCH_ID" \
  '.id == $target and .projectId == $project and .target == null and .readyState == "READY" and .meta.githubCommitRef == $branch
  and .meta.newsStagingRun == $run and .meta.newsStagingBranch == $dbbranch' <<< "$deployment" > /dev/null
owner="$(jq -er '.creator.uid' <<< "$deployment")"
[[ "$owner" =~ ^[A-Za-z0-9_-]+$ ]]
encoded_branch="$(jq -nr --arg branch "$GITHUB_REF_NAME" '$branch | @uri')"
project_query="teamId=$VERCEL_ORG_ID&projectId=$VERCEL_PROJECT_ID"
branch_query="$project_query&branch=$encoded_branch"
schedule_api="https://vercel-schedules.com/v1/schedules/$NEWS_STAGING_SCHEDULE_NAME"

feed_url="$NEWS_STAGING_URL/news?period=All"
if ! feed="$(curl -fsS --max-time 30 "$feed_url")" || [[ "$feed" != *000110842625000048* ]]; then
  bypass="$(curl -fsS --max-time 30 -H "$auth_header" "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID?teamId=$VERCEL_ORG_ID" |
    jq -er '(.protectionBypass // {}) | to_entries | map(select(.value.scope == "automation-bypass")) | .[0].key')" || {
    echo "::error::The staging feed is protected and the existing project has no available automation bypass."
    exit 1
  }
  feed="$(curl -fsS --max-time 30 -H "x-vercel-protection-bypass: $bypass" "$feed_url")"
  unset bypass
fi
if [[ "$feed" != *000110842625000048* || "$feed" != *"TXNM Energy"* ]]; then
  echo "::error::The hosted staging news feed did not show the approved TXNM filing."
  exit 1
fi
echo "Hosted staging news feed shows the approved TXNM filing."

node --input-type=module <<'JS'
import pg from "pg";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  const { rowCount } = await db.query(`
    SELECT r.id FROM "NewsRevision" AS r
    JOIN "NewsDevelopment" AS d ON d."approvedRevisionId" = r.id
    JOIN "NewsSourceVersion" AS v ON v.id = r."sourceVersionId"
    JOIN "NewsSourceDocument" AS s ON s.id = v."documentId"
    WHERE r.id = $1 AND r.status = 'APPROVED' AND s."canonicalUrl" LIKE '%/000110842625000048/%'
  `, [process.env.NEWS_TXNM_STAGING_DRAFT_ID]);
  if (rowCount !== 1) throw new Error("The exact reviewed TXNM revision is not approved on the guarded staging database.");
} finally {
  await db.end();
}
JS

schedule_before=""
for schedule_query in "$branch_query&user=$owner" "$branch_query" "$project_query&user=$owner"; do
  lookup="$(curl -sS --max-time 30 -H "$auth_header" -w $'\n%{http_code}' "$schedule_api?$schedule_query")"
  if [[ "${lookup##*$'\n'}" == 200 ]]; then
    schedule_before="${lookup%$'\n'*}"
    break
  fi
  printf 'Staging schedule lookup returned HTTP %s.\n' "${lookup##*$'\n'}"
  jq -c '{code: (.error.code // .code), message: (.error.message // .message)}' <<< "${lookup%$'\n'*}" || true
done
[[ -n "$schedule_before" ]] || exit 1
schedule_id="$(jq -er --arg name "$NEWS_STAGING_SCHEDULE_NAME" --arg project "$VERCEL_PROJECT_ID" \
  'select(.name == $name and .projectId == $project and .source == "static" and .state == "inactive"
    and .expression.cron == "15 6 * * *" and .timezone == "America/New_York"
    and .target.type == "path" and .target.path == "/Infra-MA2/api/internal/staging-news-digest"
    and .target.requestMethod == "POST") | .scheduleId' <<< "$schedule_before")"
[[ "$schedule_id" =~ ^sch_[A-Za-z0-9_-]+$ ]]
export NEWS_STAGING_SCHEDULE_ID="$schedule_id"
export NEWS_STAGING_DEPLOYMENT_NONCE="$preview_run"

invoke_at="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
export NEWS_STAGING_DIGEST_INVOKE_AT="$invoke_at"
invoke_status="$(curl -fsS --max-time 30 -o /dev/null -w '%{http_code}' -X POST -H "$auth_header" "$schedule_api/invoke?$schedule_query")"
[[ "$invoke_status" == 204 ]]

if ! node --input-type=module <<'JS'
import pg from "pg";
import { setTimeout } from "node:timers/promises";
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  for (let attempt = 0; attempt < 40; attempt++) {
    const { rows } = await db.query(`
      SELECT id, metadata->>'executionId' AS "executionId"
      FROM "PipelineRun"
      WHERE pipeline = 'evidence-news-staging-digest' AND status = 'SUCCEEDED'
        AND "startedAt" >= $1::timestamptz AT TIME ZONE 'UTC'
        AND metadata->>'scheduleId' = $2
        AND (metadata->>'deploymentId' = $3 OR metadata->>'deploymentNonce' = $4)
      ORDER BY "startedAt" DESC LIMIT 1
    `, [process.env.NEWS_STAGING_DIGEST_INVOKE_AT, process.env.NEWS_STAGING_SCHEDULE_ID,
      process.env.NEWS_STAGING_DEPLOYMENT_ID, process.env.NEWS_STAGING_DEPLOYMENT_NONCE]);
    if (rows[0]?.executionId) {
      console.log(`Manual staging digest execution ${rows[0].executionId} verified by isolated database receipt ${rows[0].id}.`);
      process.exitCode = 0;
      break;
    }
    process.exitCode = 1;
    await setTimeout(3_000);
  }
} finally {
  await db.end();
}
JS
then
  echo "::error::No matching staging digest receipt arrived. The schedule remains inactive."
  exit 1
fi

curl -fsS --max-time 30 -o /dev/null -X POST -H "$auth_header" "$schedule_api/enable?$schedule_query"
curl -fsS --max-time 30 -H "$auth_header" "$schedule_api?$schedule_query" | jq -e --arg id "$schedule_id" \
  'select(.scheduleId == $id and .state == "active" and .expression.cron == "15 6 * * *" and .timezone == "America/New_York")
   | {scheduleId, name, state, expression, timezone}'
