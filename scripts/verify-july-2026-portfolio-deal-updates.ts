/** Read-only post-apply verification for the July 2026 portfolio reconciliation. */
import "dotenv/config";

import { Client } from "pg";

import { companies as seedCompanies } from "../prisma/seed-data/companies";
import {
  july2026PortfolioDealUpdateManifest as manifest,
  type July2026OwnershipOperation,
} from "../prisma/seed-data/july-2026-portfolio-deal-updates";

interface PeriodRow {
  id: string;
  fundId: string | null;
  organizationName: string | null;
  vehicleName: string | null;
  stake: string | null;
  investmentYear: number | null;
  exitYear: number | null;
  isActive: boolean;
}

function fail(message: string): never {
  throw new Error(message);
}

function guardedConnectionString(): { connectionString: string; host: string; database: string } {
  const connectionString = process.env.DATABASE_URL;
  const expectedHost = process.env.EXPECTED_DATABASE_HOST?.trim().toLowerCase();
  const expectedDatabase = process.env.EXPECTED_DATABASE_NAME?.trim();
  if (!connectionString || !expectedHost || !expectedDatabase) {
    fail("DATABASE_URL, EXPECTED_DATABASE_HOST, and EXPECTED_DATABASE_NAME are required");
  }
  const parsed = new URL(connectionString);
  const host = parsed.hostname.toLowerCase();
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (host !== expectedHost || database !== expectedDatabase) fail("Database target guard failed");
  return { connectionString, host, database };
}

function assertPeriod(row: PeriodRow, expected: Record<string, unknown>, path: string): void {
  for (const key of ["fundId", "stake", "investmentYear", "exitYear", "isActive"] as const) {
    if (!(key in expected)) fail(`${path}.${key} is missing from the reviewed final state`);
    if (row[key] !== expected[key]) fail(`${path}.${key} postcondition failed`);
  }
  if (row.isActive && row.exitYear !== null) fail(`${path} is active with an exit year`);
  if (!row.isActive && row.exitYear === null) fail(`${path} is inactive without an exit year`);
}

async function selectPeriod(client: Client, companyId: string, operation: July2026OwnershipOperation): Promise<PeriodRow | null> {
  if ("periodId" in operation) {
    const result = await client.query<PeriodRow>(
      `SELECT op."id", op."fundId", org."name" AS "organizationName", op."vehicleName",
              op."stake", op."investmentYear", op."exitYear", op."isActive"
         FROM "OwnershipPeriod" op
         LEFT JOIN "Organization" org ON org."id" = op."organizationId"
        WHERE op."id" = $1 AND op."companyId" = $2`,
      [operation.periodId, companyId],
    );
    if (result.rows.length > 1) fail(`Ownership period ${operation.periodId} is duplicated`);
    return result.rows[0] ?? null;
  }
  if (operation.kind !== "upsertPeriod") return null;
  const result = await client.query<PeriodRow>(
    `SELECT op."id", op."fundId", org."name" AS "organizationName", op."vehicleName",
            op."stake", op."investmentYear", op."exitYear", op."isActive"
       FROM "OwnershipPeriod" op
       JOIN "Organization" org ON org."id" = op."organizationId"
      WHERE op."companyId" = $1 AND org."name" = $2
        AND op."vehicleName" IS NOT DISTINCT FROM $3`,
    [companyId, operation.organizationName, operation.vehicleName],
  );
  if (result.rows.length > 1) fail(`Ownership selector is duplicated for ${companyId}`);
  return result.rows[0] ?? null;
}

async function verifyOwnershipOperation(
  client: Client,
  companyId: string,
  operation: July2026OwnershipOperation,
): Promise<void> {
  const path = `${companyId}/${operation.kind}`;
  if (operation.kind === "upsertOrganization") {
    const result = await client.query<{ name: string; types: string[]; status: string }>(
      `SELECT "name", "types"::text[] AS "types", "status" FROM "Organization" WHERE "name" = $1`,
      [operation.name],
    );
    if (result.rows.length !== 1) fail(`${path} organization does not resolve exactly once`);
    if (result.rows[0].status !== operation.set.status
        || [...result.rows[0].types].sort().join() !== [...operation.set.types].sort().join()) {
      fail(`${path} organization postcondition failed`);
    }
    return;
  }

  const row = await selectPeriod(client, companyId, operation);
  if (operation.kind === "deletePeriod") {
    if (row) fail(`${path} deleted period still exists`);
    return;
  }
  if (!row) fail(`${path} ownership period is missing`);
  const expectedOrganization = operation.kind === "upsertPeriod"
    ? operation.organizationName
    : operation.expected.organizationName;
  if (expectedOrganization && row.organizationName !== expectedOrganization) {
    fail(`${path} organization postcondition failed`);
  }
  assertPeriod(row, operation.set as Record<string, unknown>, path);
}

async function main(): Promise<void> {
  const target = guardedConnectionString();
  const client = new Client({ connectionString: target.connectionString });
  const dealIds = new Set<string>();
  let milestoneCount = 0;
  let citationCount = 0;

  await client.connect();
  try {
    await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
    for (const update of manifest.companies) {
      const companyResult = await client.query<{
        id: string;
        name: string;
        country: string;
        status: string;
        companyStatus: string;
        description: string;
      }>(
        `SELECT "id", "name", "country", "status", "companyStatus", "description"
           FROM "Company" WHERE "id" = $1`,
        [update.id],
      );
      const company = companyResult.rows[0];
      if (companyResult.rows.length !== 1 || company.name !== update.name || company.country !== update.country) {
        fail(`Company identity postcondition failed for ${update.id}`);
      }
      if (company.status !== "PUBLISHED") fail(`${update.name} is no longer published`);
      if (company.companyStatus !== (update.setCompanyStatus ?? update.expectedCompanyStatus)) {
        fail(`${update.name} company status postcondition failed`);
      }
      if (!company.description.endsWith(update.narrativeAppend.trim())) {
        fail(`${update.name} narrative postcondition failed`);
      }

      for (const item of update.milestones) {
        dealIds.add(item.dealLegacyId);
        const result = await client.query<{ category: string; sortDate: string }>(
          `SELECT "category", to_char("sortDate", 'YYYY-MM-DD') AS "sortDate"
             FROM "Milestone"
            WHERE "companyId" = $1 AND "date" = $2 AND "event" = $3`,
          [update.id, item.date, item.event],
        );
        if (result.rows.length !== 1 || result.rows[0].category !== item.category
            || result.rows[0].sortDate !== item.sortDate) {
          fail(`${update.name} milestone postcondition failed: ${item.date}`);
        }
        milestoneCount += 1;
      }

      for (const item of update.sources) {
        dealIds.add(item.dealLegacyId);
        const result = await client.query<{ count: string }>(
          `SELECT COUNT(*)::text AS "count"
             FROM "Citation" c
             JOIN "Source" s ON s."id" = c."sourceId"
             JOIN "Deal" d ON d."id" = c."dealId"
            WHERE c."companyId" = $1 AND s."url" = $2 AND d."legacyId" = $3
              AND c."purpose" = $4::"CitationPurpose"
              AND c."evidenceLabel" IS NOT DISTINCT FROM $5`,
          [update.id, item.url, item.dealLegacyId, item.purpose, item.evidenceLabel],
        );
        if (Number(result.rows[0]?.count ?? 0) !== 1) {
          fail(`${update.name} citation postcondition failed: ${item.dealLegacyId}`);
        }
        citationCount += 1;
      }

      for (const operation of update.ownershipOperations ?? []) {
        await verifyOwnershipOperation(client, update.id, operation);
      }
    }

    const affectedIds = manifest.companies.map((update) => update.id);
    const lifecycle = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod"
        WHERE "companyId" = ANY($1)
          AND (("isActive" AND "exitYear" IS NOT NULL)
            OR (NOT "isActive" AND "exitYear" IS NULL)
            OR ("investmentYear" IS NOT NULL AND "exitYear" IS NOT NULL AND "exitYear" < "investmentYear"))`,
      [affectedIds],
    );
    if (Number(lifecycle.rows[0]?.count ?? 0) !== 0) fail("Affected-company ownership lifecycle invariants failed");

    const forbiddenFutureOwners = [
      ["cmnva0z9l00yvm8lzx4xyjdme", "EQT"],
      ["cmnva0txl00pym8lztee54mui", "Global Infrastructure Partners"],
      ["cmnva10ez010xm8lzxkk6b9gt", "Global Infrastructure Partners"],
      ["cmnva0tr000pmm8lz3r3h486l", "Northampton"],
      ["cmnva122e013um8lzwra570xs", "Intrepid Fiber Networks"],
      ["cmnva10og011dm8lziivuyec5", "San Mateo Midstream"],
      ["cmnva0mz300epm8lzmbnvkm6k", "Enstructure"],
      ["cmnva0s8b00mym8lzoao2r130", "Masdar"],
    ] as const;
    for (const [companyId, organizationName] of forbiddenFutureOwners) {
      const result = await client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod" op
          JOIN "Organization" org ON org."id" = op."organizationId"
         WHERE op."companyId" = $1 AND org."name" = $2`,
        [companyId, organizationName],
      );
      if (Number(result.rows[0]?.count ?? 0) !== 0) {
        fail(`Announced transaction was prematurely applied to ${companyId}: ${organizationName}`);
      }
    }

    const plenary = await client.query<{ count: string }>(
      `SELECT COUNT(*)::text AS "count" FROM "OwnershipPeriod" op
        JOIN "Organization" org ON org."id" = op."organizationId"
       WHERE op."companyId" = $1 AND org."name" = $2 AND op."isActive"`,
      ["cmnva0yc800x8m8lziecgny4n", "La Caisse de dépôt (CDPQ)"],
    );
    if (Number(plenary.rows[0]?.count ?? 0) !== 1) fail("Plenary CDPQ duplicate-period cleanup failed");

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }

  const seedByKey = new Map(seedCompanies.map((company) => [`${company.name}\u0000${company.country}`, company]));
  for (const update of manifest.companies) {
    const seed = seedByKey.get(`${update.seedPatch?.name ?? update.name}\u0000${update.country}`);
    if (!seed || !seed.description.endsWith(update.narrativeAppend.trim())) fail(`Seed narrative missing for ${update.name}`);
    for (const item of update.milestones) {
      if (!seed.milestones?.some((candidate) => candidate.date === item.date && candidate.event === item.event)) {
        fail(`Seed milestone missing for ${update.name}: ${item.date}`);
      }
    }
    for (const item of update.sources) {
      if (!seed.sources?.some((candidate) => candidate.url === item.url)) {
        fail(`Seed source missing for ${update.name}: ${item.dealLegacyId}`);
      }
    }
    if (update.seedPatch?.status && seed.status !== update.seedPatch.status) {
      fail(`Seed status postcondition failed for ${update.name}`);
    }
    for (const patch of update.seedPatch?.ownerUpdates ?? []) {
      const owner = seed.owners?.find((candidate) => candidate.investmentFirm === patch.match.investmentFirm
        && (patch.match.ownershipVehicle === undefined
          || candidate.ownershipVehicle === patch.match.ownershipVehicle));
      if (!owner) fail(`Seed owner update missing for ${update.name}: ${patch.match.investmentFirm}`);
      for (const [key, value] of Object.entries(patch.set)) {
        if (owner[key as keyof typeof owner] !== value) {
          fail(`Seed owner ${key} postcondition failed for ${update.name}: ${patch.match.investmentFirm}`);
        }
      }
    }
    for (const expected of update.seedPatch?.ownerUpserts ?? []) {
      const owner = seed.owners?.find((candidate) => candidate.investmentFirm === expected.investmentFirm
        && candidate.ownershipVehicle === expected.ownershipVehicle);
      if (!owner || JSON.stringify(owner) !== JSON.stringify(expected)) {
        fail(`Seed owner upsert postcondition failed for ${update.name}: ${expected.investmentFirm}`);
      }
    }
  }

  if (manifest.scope.syncedDealCount !== 148
      || manifest.scope.matchedDealCount !== dealIds.size
      || manifest.scope.noExistingCompanyMatchDealCount + dealIds.size !== 148
      || manifest.companies.length !== 33
      || milestoneCount !== 36
      || citationCount !== 36) {
    fail("Coverage arithmetic postcondition failed");
  }

  process.stdout.write(`${JSON.stringify({
    outcome: "verified",
    target: { host: target.host, database: target.database },
    companies: manifest.companies.length,
    matchedDeals: dealIds.size,
    noExistingCompanyMatchDeals: manifest.scope.noExistingCompanyMatchDealCount,
    milestones: milestoneCount,
    dealLinkedCitations: citationCount,
    seedCompanies: seedCompanies.length,
    ownershipLifecycleViolations: 0,
    announcedFutureOwnersApplied: 0,
  }, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : "Verification failed"}\n`);
  process.exitCode = 1;
});
