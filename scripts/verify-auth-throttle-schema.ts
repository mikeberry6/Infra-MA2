import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  authThrottleSchemaTargetError,
  verifyAuthThrottleCatalog,
  type AuthThrottleCatalog,
  type CatalogColumn,
  type CatalogConstraint,
  type CatalogIndex,
  type CatalogRelation,
} from "../src/lib/auth-throttle-schema.ts";

const RESERVED_RELATION_NAMES = [
  "AuthThrottle",
  "AuthThrottle_pkey",
  "AuthThrottle_lockedUntil_idx",
  "AuthThrottle_updatedAt_idx",
];

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.slice(2).find((item) => item.startsWith(prefix))?.slice(prefix.length);
}

async function inspectCatalog(client: Client): Promise<AuthThrottleCatalog> {
  const relations = await client.query<{
    oid: number;
    name: string;
    kind: string;
    persistence: string;
    row_security: boolean;
    force_row_security: boolean;
  }>(`
    SELECT
      c.oid::int AS oid,
      c.relname AS name,
      c.relkind AS kind,
      c.relpersistence AS persistence,
      c.relrowsecurity AS row_security,
      c.relforcerowsecurity AS force_row_security
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = ANY($1::text[])
    ORDER BY c.relname
  `, [RESERVED_RELATION_NAMES]);

  const table = relations.rows.find((relation) => relation.name === "AuthThrottle");
  const catalogRelations: CatalogRelation[] = relations.rows.map((relation) => ({
    name: relation.name,
    kind: relation.kind,
    persistence: relation.persistence,
    rowSecurity: relation.row_security,
    forceRowSecurity: relation.force_row_security,
  }));
  if (!table) {
    return {
      relations: catalogRelations,
      columns: [],
      constraints: [],
      indexes: [],
      triggers: [],
    };
  }

  const columns = await client.query<{
    ordinal: number;
    name: string;
    data_type: string;
    not_null: boolean;
    default_expression: string | null;
    identity: string;
    generated: string;
  }>(`
      SELECT
        a.attnum::int AS ordinal,
        a.attname AS name,
        format_type(a.atttypid, a.atttypmod) AS data_type,
        a.attnotnull AS not_null,
        pg_get_expr(d.adbin, d.adrelid) AS default_expression,
        a.attidentity AS identity,
        a.attgenerated AS generated
      FROM pg_attribute a
      LEFT JOIN pg_attrdef d
        ON d.adrelid = a.attrelid AND d.adnum = a.attnum
      WHERE a.attrelid = $1
        AND a.attnum > 0
        AND NOT a.attisdropped
      ORDER BY a.attnum
    `, [table.oid]);
  const constraints = await client.query<{
    name: string;
    type: string;
    deferrable: boolean;
    deferred: boolean;
    validated: boolean;
    definition: string;
  }>(`
      SELECT
        conname AS name,
        contype AS type,
        condeferrable AS deferrable,
        condeferred AS deferred,
        convalidated AS validated,
        pg_get_constraintdef(oid, true) AS definition
      FROM pg_constraint
      WHERE conrelid = $1
      ORDER BY conname
    `, [table.oid]);
  const indexes = await client.query<{
    name: string;
    unique: boolean;
    primary: boolean;
    valid: boolean;
    ready: boolean;
    key_count: number;
    attribute_count: number;
    method: string;
    expressions: string | null;
    predicate: string | null;
    columns: string[];
    opclasses: string[];
  }>(`
      SELECT
        ci.relname AS name,
        i.indisunique AS unique,
        i.indisprimary AS primary,
        i.indisvalid AS valid,
        i.indisready AS ready,
        i.indnkeyatts::int AS key_count,
        i.indnatts::int AS attribute_count,
        am.amname AS method,
        pg_get_expr(i.indexprs, i.indrelid) AS expressions,
        pg_get_expr(i.indpred, i.indrelid) AS predicate,
        ARRAY(
          SELECT pg_get_indexdef(i.indexrelid, position, true)
          FROM generate_series(1, i.indnatts) AS position
        ) AS columns,
        ARRAY(
          SELECT opc.opcname::text
          FROM unnest(i.indclass) WITH ORDINALITY AS cls(opcoid, ordinal)
          JOIN pg_opclass opc ON opc.oid = cls.opcoid
          ORDER BY cls.ordinal
        ) AS opclasses
      FROM pg_index i
      JOIN pg_class ci ON ci.oid = i.indexrelid
      JOIN pg_am am ON am.oid = ci.relam
      WHERE i.indrelid = $1
      ORDER BY ci.relname
    `, [table.oid]);
  const triggers = await client.query<{ name: string }>(`
      SELECT tgname AS name
      FROM pg_trigger
      WHERE tgrelid = $1
        AND NOT tgisinternal
      ORDER BY tgname
    `, [table.oid]);

  const catalogColumns: CatalogColumn[] = columns.rows.map((column) => ({
    ordinal: column.ordinal,
    name: column.name,
    dataType: column.data_type,
    notNull: column.not_null,
    defaultExpression: column.default_expression,
    identity: column.identity,
    generated: column.generated,
  }));
  const catalogConstraints: CatalogConstraint[] = constraints.rows;
  const catalogIndexes: CatalogIndex[] = indexes.rows.map((index) => ({
    name: index.name,
    unique: index.unique,
    primary: index.primary,
    valid: index.valid,
    ready: index.ready,
    keyCount: index.key_count,
    attributeCount: index.attribute_count,
    method: index.method,
    expressions: index.expressions,
    predicate: index.predicate,
    columns: index.columns,
    opclasses: index.opclasses,
  }));

  return {
    relations: catalogRelations,
    columns: catalogColumns,
    constraints: catalogConstraints,
    indexes: catalogIndexes,
    triggers: triggers.rows.map((trigger) => trigger.name),
  };
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");
  const output = option("output") ?? "tmp/auth-throttle-schema-preflight.json";
  const client = new Client({ connectionString });
  await client.connect();
  try {
    const schemaResult = await client.query<{ schema: string | null }>(
      "SELECT current_schema() AS schema",
    );
    const targetError = authThrottleSchemaTargetError(
      connectionString,
      schemaResult.rows[0]?.schema ?? null,
    );
    if (targetError) {
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, `${JSON.stringify({
        checkedAt: new Date().toISOString(),
        state: "incompatible",
        errors: [targetError],
      }, null, 2)}\n`);
      throw new Error(`AuthThrottle schema preflight failed: ${targetError}.`);
    }
    const catalog = await inspectCatalog(client);
    const report = verifyAuthThrottleCatalog(catalog);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, `${JSON.stringify({
      checkedAt: new Date().toISOString(),
      ...report,
      catalog,
    }, null, 2)}\n`);
    if (report.state === "incompatible") {
      throw new Error(`AuthThrottle schema preflight failed: ${report.errors.join("; ")}.`);
    }
    console.log(`AuthThrottle schema preflight passed (${report.state}).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "AuthThrottle schema preflight failed.");
  process.exitCode = 1;
});
