// @vitest-environment node
import { execFileSync } from "node:child_process";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { parseSearchRequest, searchAll } from "./queries";

const queryRaw = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: { $queryRaw: queryRaw } }));

let db: PGlite;

beforeAll(async () => {
  db = await PGlite.create();
  const schema = execFileSync(process.execPath, [
    "node_modules/prisma/build/index.js", "migrate", "diff", "--from-empty",
    "--to-schema", "prisma/schema.prisma", "--script",
  ], { encoding: "utf8" });
  await db.exec(schema);
  queryRaw.mockImplementation(async (parts: TemplateStringsArray, ...parameters: unknown[]) => {
    const sql = parts.reduce((result, part, i) => result + (i ? `$${i}` : "") + part, "");
    return (await db.query(sql, parameters)).rows;
  });

  await db.exec(`
    INSERT INTO "Organization" (id, name, types, "updatedAt")
    VALUES ('org', 'Example Infrastructure Capital', ARRAY['FUND_MANAGER']::"OrgType"[], now());
    INSERT INTO "Organization" (id, name, types, "updatedAt") VALUES
      ('gsam', 'Goldman Sachs Asset Management', ARRAY['FUND_MANAGER']::"OrgType"[], now()),
      ('kkr', 'KKR', ARRAY['FUND_MANAGER']::"OrgType"[], now());
    INSERT INTO "Alias" (id, alias, "organizationId") VALUES ('alias', 'EIC', 'org');
    INSERT INTO "Fund" (id, "legacyId", "managerId", "fundName", size, vintage, structure, "fundStatus", "updatedAt")
    VALUES ('fund', 'fund-legacy', 'org', 'Meridian Fund', 'Undisclosed', '2026', 'CLOSED_END', 'RAISING', now()),
      ('gsam-fund', 'gsam-fund-legacy', 'gsam', 'Growth Infrastructure Fund', 'Undisclosed', '2026', 'CLOSED_END', 'RAISING', now()),
      ('kkr-fund', 'kkr-fund-legacy', 'kkr', 'Global Infrastructure Fund', 'Undisclosed', '2026', 'CLOSED_END', 'RAISING', now());
    INSERT INTO "Company" (id, name, aliases, sector, region, country, "companyStatus", "updatedAt")
    VALUES ('company', 'Meridian Infrastructure', ARRAY['Meridian Grid'], 'POWER_ET', 'NORTH_AMERICA', 'US', 'ACTIVE', now());
    INSERT INTO "OwnershipPeriod" (id, "companyId", "fundId") VALUES ('ownership', 'company', 'fund');
    INSERT INTO "Deal" (id, "legacyId", title, target, sector, region, date, description, "dealStatus", "updatedAt")
    VALUES ('deal', 'deal-legacy', 'Infrastructure portfolio acquisition', 'Example Power',
      'POWER_ET', 'NORTH_AMERICA', now(), 'Meridian Grid is a comparable operator', 'ANNOUNCED', now());
    INSERT INTO "DealParticipant" (id, "dealId", "organizationId", role) VALUES ('participant', 'deal', 'org', 'BUYER');
    INSERT INTO "Deal" (id, "legacyId", title, target, sector, region, date, "dealStatus", "updatedAt", status)
    VALUES ('draft', 'draft-legacy', 'Meridian Grid', 'Meridian Grid', 'POWER_ET', 'NORTH_AMERICA', now(), 'ANNOUNCED', now(), 'DRAFT');
    INSERT INTO "Deal" (id, "legacyId", title, target, sector, region, date, description, "dealStatus", "updatedAt")
    SELECT 'other-' || i, 'other-legacy-' || i, 'Additional transaction', 'Other target ' || i,
      'POWER_ET', 'NORTH_AMERICA', now(), 'A grid transaction', 'ANNOUNCED', now()
    FROM generate_series(1, 22) i;
  `);
}, 30_000);

afterAll(async () => { await db?.close(); });

describe("public research search", () => {
  it("normalizes URL input and rejects unsupported type and page values", () => {
    expect(parseSearchRequest({ q: "  Meridian   Grid ", type: "company", page: "2" })).toEqual({
      query: "Meridian Grid", type: "company", page: 2,
    });
    expect(parseSearchRequest({ q: ["one", "two"], type: "unknown", page: "2e9" })).toEqual({
      query: "", type: null, page: 1,
    });
  });

  it("ranks an exact company alias over a description and excludes drafts", async () => {
    const result = await searchAll(parseSearchRequest({ q: "MERIDIAN GRID" }));
    expect(result.results.map(({ type, id }) => [type, id])).toEqual([
      ["company", "company"], ["deal", "deal-legacy"],
    ]);
    expect(result.results[0]).toMatchObject({ sector: "Power & ET", region: "North America" });
  });

  it("matches buyer and fund manager aliases and the company owned through that fund", async () => {
    const result = await searchAll(parseSearchRequest({ q: "eic" }));
    expect(result.counts).toEqual({ deal: 1, company: 1, fund: 1 });
    expect(result.results.map(({ id }) => id)).toEqual(["deal-legacy", "fund-legacy", "company"]);
    const filtered = await searchAll(parseSearchRequest({ q: "eic", type: "company" }));
    expect(filtered).toMatchObject({
      counts: result.counts, total: 1, results: [{ id: "company" }],
    });
  });

  it.each([["gsam", "gsam-fund-legacy"], ["KKR", "kkr-fund-legacy"]])(
    "finds funds by manager query %s even when the name is absent from the vehicle name",
    async (query, id) => {
      const result = await searchAll(parseSearchRequest({ q: query, type: "fund" }));
      expect(result.results).toMatchObject([{ id }]);
    },
  );

  it("returns exact counts and stable pages even with an out-of-range request", async () => {
    const first = await searchAll(parseSearchRequest({ q: "grid", type: "deal" }));
    const last = await searchAll(parseSearchRequest({ q: "grid", type: "deal", page: "999" }));
    expect(first).toMatchObject({ page: 1, pageCount: 2, total: 23, counts: { deal: 23, company: 1, fund: 0 } });
    expect(first.results).toHaveLength(20);
    expect(last).toMatchObject({ page: 2, total: 23 });
    expect(last.results).toHaveLength(3);
    expect(new Set([...first.results, ...last.results].map(({ id }) => id)).size).toBe(23);
  });
});
