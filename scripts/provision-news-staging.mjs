import { appendFile } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";

const databaseName = "news_evidence_staging";
const roleName = "news_evidence_staging";

function required(name, pattern) {
  const value = process.env[name]?.trim();
  if (!value || (pattern && !pattern.test(value))) {
    throw new Error(`${name} is missing or invalid.`);
  }
  return value;
}

function endpointHost(host) {
  return host.toLowerCase().replace(/-pooler(?=\.)/, "");
}

async function main() {
  if (process.env.NEWS_PIPELINE_TARGET !== "staging" || process.env.GITHUB_REF === "refs/heads/main") {
    throw new Error("Run this staging provisioner from a non-main staging workflow.");
  }
  const project = required("NEON_PROJECT_ID", /^[a-z0-9-]{1,60}$/);
  const runId = required("GITHUB_RUN_ID", /^\d+$/);
  const envFile = required("GITHUB_ENV");
  const key = required("NEON_API_KEY");
  const productionHost = required("PRODUCTION_DATABASE_HOST", /^[a-z0-9.-]+$/i).toLowerCase();
  const productionMigrationHost = process.env.PRODUCTION_MIGRATION_DATABASE_HOST?.trim();
  const forbidden = new Set([productionHost, productionMigrationHost].filter(Boolean).map(endpointHost));
  const unpooled = endpointHost(productionHost);
  const pooled = unpooled.replace(".", "-pooler.");
  const alternativeHost = pooled === productionHost ? unpooled : pooled;
  const name = `news-evidence-staging-${runId}`;

  async function api(path, body) {
    const response = await fetch(`https://console.neon.tech/api/v2/projects/${project}${path}`, {
      method: body ? "POST" : "GET",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      redirect: "error",
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`Neon staging API returned HTTP ${response.status}.`);
    return response.json();
  }

  async function waitForOperations(operations = []) {
    for (const { id } of operations) {
      for (let attempt = 1; attempt <= 45; attempt++) {
        const { operation } = await api(`/operations/${id}`);
        if (["finished", "skipped"].includes(operation?.status)) break;
        if (attempt === 45 || ["failed", "cancelled", "error"].includes(operation?.status)) {
          throw new Error("A Neon staging operation failed or timed out.");
        }
        await delay(2_000);
      }
    }
  }

  async function eligibleParent(branchId, automated) {
    if (!/^br-[a-z0-9-]+$/.test(branchId ?? "")) return null;
    const [{ branch }, { endpoints }] = await Promise.all([
      api(`/branches/${branchId}`),
      api(`/branches/${branchId}/endpoints`),
    ]);
    const productionName = automated ? /(^|[-_])prod(?:uction)?($|[-_])/i : /^(main|prod|production)$/i;
    if (branch?.id !== branchId || branch.default !== false || branch.primary === true ||
        productionName.test(branch.name) || endpoints.some(({ host }) => forbidden.has(endpointHost(host)))) {
      return null;
    }
    return branch;
  }

  const { endpoints: projectEndpoints } = await api("/endpoints");
  const registeredHosts = [
    process.env.DASHBOARD_MIGRATION_DATABASE_HOST,
    process.env.MIGRATION_DATABASE_HOST,
  ].map((host) => host?.trim()).filter(Boolean);
  let parent;
  for (const host of registeredHosts) {
    const normalized = endpointHost(host);
    if (forbidden.has(normalized)) continue;
    const candidate = projectEndpoints.find((endpoint) => endpointHost(endpoint.host) === normalized);
    if (!candidate) continue;
    parent = await eligibleParent(candidate.branch_id, false);
    if (parent) break;
  }
  if (!parent) {
    const replies = await Promise.all(["validation", "staging"].map((term) => api(`/branches?search=${term}`)));
    const candidates = new Map(replies.flatMap(({ branches }) => branches)
      .filter(({ name: branchName }) => /(^|[-_])(validation|staging)($|[-_])/i.test(branchName)
        && !branchName.startsWith("news-evidence-staging-"))
      .map((branch) => [branch.id, branch]));
    for (const { id } of candidates.values()) {
      parent = await eligibleParent(id, true);
      if (parent) break;
    }
  }
  if (!parent) throw new Error("No registered or named non-production validation parent exists in this Neon project.");
  const parentId = parent.id;
  console.log(`Verified non-production Neon schema source ${parentId}.`);

  const { branches } = await api(`/branches?search=${name}`);
  let branch = branches.find((candidate) => candidate.name === name);
  if (!branch) {
    const created = await api("/branches", {
      endpoints: [{ type: "read_write" }],
      branch: { parent_id: parentId, name, init_source: "schema-only" },
      annotation_value: { stagingPurpose: "evidence-news", stagingRun: runId, schemaSource: parentId },
    });
    await waitForOperations(created.operations);
    branch = created.branch;
  }

  const branchPath = `/branches/${branch.id}`;
  const { branch: verified, annotation } = await api(branchPath);
  if (verified?.id !== branch.id || verified.name !== name || verified.default !== false || verified.primary === true ||
      verified.id === parentId || verified.init_source !== "schema-only" ||
      annotation?.value?.stagingRun !== runId || annotation.value.schemaSource !== parentId) {
    throw new Error("The resulting Neon branch did not match the staging provisioner identity.");
  }
  const [{ endpoints }, { roles }, { databases }] = await Promise.all([
    api(`${branchPath}/endpoints`),
    api(`${branchPath}/roles`),
    api(`${branchPath}/databases`),
  ]);
  const endpoint = endpoints.find((candidate) => candidate.type === "read_write" && candidate.branch_id === verified.id);
  if (!endpoint?.host || forbidden.has(endpointHost(endpoint.host))) {
    throw new Error("The staging branch lacks an isolated writable endpoint.");
  }
  if (!roles.some(({ name: role }) => role === roleName)) {
    await waitForOperations((await api(`${branchPath}/roles`, { role: { name: roleName } })).operations);
  }
  const existing = databases.find(({ name: database }) => database === databaseName);
  if (existing && existing.owner_name !== roleName) {
    throw new Error("The staging database did not match the dedicated role.");
  }
  if (!existing) {
    await waitForOperations((await api(`${branchPath}/databases`, {
      database: { name: databaseName, owner_name: roleName },
    })).operations);
  }

  const parameters = new URLSearchParams({
    branch_id: verified.id, endpoint_id: endpoint.id, database_name: databaseName, role_name: roleName,
  });
  const { uri } = await api(`/connection_uri?${parameters}`);
  const target = new URL(uri);
  if (target.protocol !== "postgresql:" || target.hostname !== endpoint.host ||
      target.pathname !== `/${databaseName}` || target.username !== roleName || !target.password ||
      /[\r\n]/.test(uri) || forbidden.has(endpointHost(target.hostname))) {
    throw new Error("Neon did not return the expected staging database credentials.");
  }

  console.log(`::add-mask::${uri}`);
  console.log(`::add-mask::${target.password}`);
  const variables = {
    DATABASE_URL: uri,
    EXPECTED_DATABASE_HOST: target.hostname,
    EXPECTED_DATABASE_NAME: databaseName,
    FORBIDDEN_DATABASE_HOST: productionHost,
    FORBIDDEN_DATABASE_HOST_2: alternativeHost,
    NEWS_STAGING_BRANCH_ID: verified.id,
  };
  await appendFile(envFile, Object.entries(variables).map(([varName, value]) => `${varName}=${value}\n`).join(""));
  console.log(`Isolated Neon staging branch ${verified.id} is ready at ${target.hostname}/${databaseName}.`);
}

main().catch((error) => {
  console.error(error instanceof TypeError ? "Neon staging API connection or response validation failed." : error.message);
  process.exitCode = 1;
});
