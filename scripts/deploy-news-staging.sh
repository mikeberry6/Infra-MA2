#!/usr/bin/env bash
set -euo pipefail

if [[ "${NEWS_PIPELINE_TARGET:-}" != staging || "${GITHUB_REF:-}" == refs/heads/main || "${VERCEL_ENV:-}" == production ]]; then
  echo "::error::Deploy the evidence pilot from a non-main staging workflow."
  exit 1
fi
for name in VERCEL_TOKEN VERCEL_PROJECT_ID VERCEL_ORG_ID VERCEL_SCOPE PRODUCTION_URL GITHUB_RUN_ID GITHUB_RUN_ATTEMPT GITHUB_REF_NAME GITHUB_SHA GITHUB_ENV NEWS_STAGING_BRANCH_ID; do
  if [[ -z "${!name:-}" ]]; then
    echo "::error::$name is required for the staging Preview."
    exit 1
  fi
done
[[ "$VERCEL_PROJECT_ID" =~ ^prj_[A-Za-z0-9]+$ && "$VERCEL_ORG_ID" =~ ^team_[A-Za-z0-9]+$ &&
  "$GITHUB_RUN_ID" =~ ^[0-9]+$ && "$GITHUB_RUN_ATTEMPT" =~ ^[0-9]+$ &&
  "$NEWS_STAGING_BRANCH_ID" =~ ^br-[a-z0-9-]+$ && "$GITHUB_SHA" =~ ^[a-f0-9]{40}$ && "$GITHUB_REF_NAME" != main ]]
node --experimental-strip-types scripts/assert-database-target.ts

base_path="/Infra-MA2"
schedule_name="stage-news-digest-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
config_file=".github/staging/vercel-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT.json"

if [[ -e .vercelignore || -e "$config_file" ]]; then
  echo "::error::The staging upload files already exist."
  exit 1
fi
cleanup_upload_files() {
  node -e 'for (const file of process.argv.slice(1)) { try { require("node:fs").unlinkSync(file); } catch (error) { if (error.code !== "ENOENT") throw error; } }' .vercelignore "$config_file"
}
trap cleanup_upload_files EXIT
cat > .vercelignore <<'IGNORE'
/audits/*
!/audits/briefing-deals/
!/audits/weekly-briefing-activity/
!/audits/deal-portco-flowthrough-2026-05-05.md
/node_modules/
/.next/
/.env*
/test-results/
/playwright-report/
/tmp/
IGNORE
jq --arg schedule "$schedule_name" '.schedules = {($schedule): .schedules["stage-news-digest"]}' \
  .github/staging/vercel.json > "$config_file"
staging_alias="infra-ma-2-news-stage-$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT.vercel.app"
production_host="${PRODUCTION_URL#https://}"
production_host="${production_host%%/*}"
[[ "$production_host" =~ ^[A-Za-z0-9.-]+$ && "$staging_alias" != "$production_host" ]]
vercel=(env -u OPENAI_API_KEY -u NEON_API_KEY -u VERCEL_TARGET npx --yes vercel@65.16.0)
auth_args=(--scope "$VERCEL_SCOPE" --token "$VERCEL_TOKEN" --no-color)
deployment_api() {
  curl -fsS --max-time 30 -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v13/deployments/$1?teamId=$VERCEL_ORG_ID"
}

production_id_before="$(deployment_api "$production_host" | jq -er --arg project "$VERCEL_PROJECT_ID" \
  'select(.projectId == $project and .target == "production") | .id')"
nextauth_secret="$(openssl rand -hex 32)"
cron_secret="$(openssl rand -hex 32)"
printf '::add-mask::%s\n' "$DATABASE_URL" "$nextauth_secret" "$cron_secret"

deploy_env=(
  "DATABASE_URL=$DATABASE_URL"
  "NEXTAUTH_SECRET=$nextauth_secret"
  "NEXTAUTH_URL=https://$staging_alias$base_path/api/auth"
  "NEXT_PUBLIC_BASE_PATH=$base_path"
  "NEWS_EVIDENCE_ENABLED=true"
  "NEWS_PIPELINE_TARGET=staging"
  "NEWS_DEAL_MUTATIONS_ENABLED=false"
  "NEWS_STAGING_DEPLOYMENT_NONCE=$GITHUB_RUN_ID-$GITHUB_RUN_ATTEMPT"
  "EXPECTED_DATABASE_HOST=$EXPECTED_DATABASE_HOST"
  "EXPECTED_DATABASE_NAME=$EXPECTED_DATABASE_NAME"
  "FORBIDDEN_DATABASE_HOST=$FORBIDDEN_DATABASE_HOST"
  "FORBIDDEN_DATABASE_HOST_2=${FORBIDDEN_DATABASE_HOST_2:-}"
)
if [[ -n "${NEWS_DIGEST_START_DATE:-}" ]]; then
  [[ "$NEWS_DIGEST_START_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]
  deploy_env+=("NEWS_DIGEST_ENABLED=true" "NEWS_DIGEST_START_DATE=$NEWS_DIGEST_START_DATE" "CRON_SECRET=$cron_secret")
else
  jq 'del(.schedules)' .github/staging/vercel.json > "$config_file"
fi
env_args=()
for value in "${deploy_env[@]}"; do
  env_args+=(--env "$value" --build-env "$value")
done

deployment_output="$("${vercel[@]}" deploy --yes --environment preview --archive=tgz --project "$VERCEL_PROJECT_ID" \
  --local-config "$config_file" "${auth_args[@]}" "${env_args[@]}" \
  --meta "githubDeployment=1" --meta "githubCommitRef=$GITHUB_REF_NAME" --meta "githubCommitSha=$GITHUB_SHA" \
  --meta "newsStagingRun=$GITHUB_RUN_ID" --meta "newsStagingBranch=$NEWS_STAGING_BRANCH_ID")"
url="$deployment_output"
if [[ "$deployment_output" == \{* ]]; then
  url="$(jq -er '.url // .deployment.url // .data.url' <<< "$deployment_output")"
  if [[ "$url" != https://* ]]; then url="https://$url"; fi
fi
if [[ ! "$url" =~ ^https://[A-Za-z0-9.-]+\.vercel\.app$ || "$url" == "https://$production_host" ]]; then
  echo "::error::Vercel did not return a distinct Preview deployment URL."
  exit 1
fi
preview_id="$(deployment_api "${url#https://}" | jq -er \
  --arg project "$VERCEL_PROJECT_ID" --arg run "$GITHUB_RUN_ID" --arg dbbranch "$NEWS_STAGING_BRANCH_ID" \
  --arg gitbranch "$GITHUB_REF_NAME" --arg sha "$GITHUB_SHA" \
  'select(.projectId == $project and .target == null and .readyState == "READY"
    and .meta.newsStagingRun == $run and .meta.newsStagingBranch == $dbbranch
    and .meta.githubCommitRef == $gitbranch and .meta.githubCommitSha == $sha) | .id')"

alias_http_status="$(curl -sS --max-time 30 -o /dev/null -w '%{http_code}' -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v4/aliases/$staging_alias?teamId=$VERCEL_ORG_ID")"
if [[ "$alias_http_status" != 404 ]]; then
  echo "::error::The staging alias could not be confirmed unused."
  exit 1
fi
"${vercel[@]}" alias set "$url" "$staging_alias" "${auth_args[@]}"
preview_alias_id="$(deployment_api "$staging_alias" | jq -er '.id')"
production_id_after="$(deployment_api "$production_host" | jq -er '.id')"
[[ "$preview_alias_id" == "$preview_id" && "$production_id_after" == "$production_id_before" ]]

printf 'NEWS_STAGING_URL=https://%s%s\nNEWS_STAGING_DEPLOYMENT_ID=%s\nNEWS_STAGING_SCHEDULE_NAME=%s\n' \
  "$staging_alias" "$base_path" "$preview_id" "$schedule_name" >> "$GITHUB_ENV"
printf 'Verified Vercel Preview %s at https://%s%s/news. Production deployment %s remained current.\n' \
  "$preview_id" "$staging_alias" "$base_path" "$production_id_after"
