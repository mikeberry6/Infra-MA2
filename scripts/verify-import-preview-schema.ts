import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import {
  IMPORT_PREVIEW_RESERVED_RELATION_NAMES,
  importPreviewSchemaTargetError,
  verifyImportPreviewCatalog,
  type ImportPreviewCatalog,
  type ImportPreviewCatalogColumn,
  type ImportPreviewCatalogConstraint,
  type ImportPreviewCatalogIndex,
  type ImportPreviewCatalogRelation,
  type ImportPreviewSchemaState,
} from "../src/lib/import-preview-schema.ts";

function option(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((item) => item.startsWith(prefix))
    ?.slice(prefix.length);
}

async function inspectCatalog(client: Client): Promise<ImportPreviewCatalog> {
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
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = ANY($1::text[])
    ORDER BY c.relname
  `, [[...IMPORT_PREVIEW_RESERVED_RELATION_NAMES]]);

  const table = relations.rows.find(
    (relation) => relation.name === "ImportPreview",
  );
  const catalogRelations: ImportPreviewCatalogRelation[] = relations.rows.map(
    (relation) => ({
      name: relation.name,
      kind: relation.kind,
      persistence: relation.persistence,
      rowSecurity: relation.row_security,
      forceRowSecurity: relation.force_row_security,
    }),
  );
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
      pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
      a.attnotnull AS not_null,
      pg_catalog.pg_get_expr(d.adbin, d.adrelid) AS default_expression,
      a.attidentity AS identity,
      a.attgenerated AS generated
    FROM pg_catalog.pg_attribute a
    LEFT JOIN pg_catalog.pg_attrdef d
      ON d.adrelid = a.attrelid
      AND d.adnum = a.attnum
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
    local_columns: string[];
    referenced_schema: string | null;
    referenced_relation: string | null;
    referenced_columns: string[];
    update_action: string | null;
    delete_action: string | null;
    match_type: string | null;
    backing_index: string | null;
  }>(`
    SELECT
      constraint_record.conname AS name,
      constraint_record.contype AS type,
      constraint_record.condeferrable AS deferrable,
      constraint_record.condeferred AS deferred,
      constraint_record.convalidated AS validated,
      ARRAY(
        SELECT attribute_record.attname::text
        FROM unnest(constraint_record.conkey)
          WITH ORDINALITY AS key_column(attnum, ordinality)
        JOIN pg_catalog.pg_attribute attribute_record
          ON attribute_record.attrelid = constraint_record.conrelid
          AND attribute_record.attnum = key_column.attnum
        ORDER BY key_column.ordinality
      ) AS local_columns,
      CASE
        WHEN constraint_record.contype = 'f' THEN referenced_namespace.nspname
        ELSE NULL
      END AS referenced_schema,
      CASE
        WHEN constraint_record.contype = 'f' THEN referenced_table.relname
        ELSE NULL
      END AS referenced_relation,
      CASE
        WHEN constraint_record.contype = 'f' THEN ARRAY(
          SELECT attribute_record.attname::text
          FROM unnest(constraint_record.confkey)
            WITH ORDINALITY AS key_column(attnum, ordinality)
          JOIN pg_catalog.pg_attribute attribute_record
            ON attribute_record.attrelid = constraint_record.confrelid
            AND attribute_record.attnum = key_column.attnum
          ORDER BY key_column.ordinality
        )
        ELSE ARRAY[]::text[]
      END AS referenced_columns,
      CASE
        WHEN constraint_record.contype = 'f'
          THEN constraint_record.confupdtype::text
        ELSE NULL
      END AS update_action,
      CASE
        WHEN constraint_record.contype = 'f'
          THEN constraint_record.confdeltype::text
        ELSE NULL
      END AS delete_action,
      CASE
        WHEN constraint_record.contype = 'f'
          THEN constraint_record.confmatchtype::text
        ELSE NULL
      END AS match_type,
      CASE
        WHEN constraint_record.contype = 'p' THEN backing_index.relname
        ELSE NULL
      END AS backing_index
    FROM pg_catalog.pg_constraint constraint_record
    LEFT JOIN pg_catalog.pg_class referenced_table
      ON referenced_table.oid = constraint_record.confrelid
    LEFT JOIN pg_catalog.pg_namespace referenced_namespace
      ON referenced_namespace.oid = referenced_table.relnamespace
    LEFT JOIN pg_catalog.pg_class backing_index
      ON backing_index.oid = constraint_record.conindid
    WHERE constraint_record.conrelid = $1
    ORDER BY constraint_record.conname
  `, [table.oid]);

  const indexes = await client.query<{
    name: string;
    unique: boolean;
    primary: boolean;
    exclusion: boolean;
    immediate: boolean;
    valid: boolean;
    ready: boolean;
    live: boolean;
    key_count: number;
    attribute_count: number;
    method: string;
    expressions: string | null;
    predicate: string | null;
    columns: string[];
    opclasses: string[];
  }>(`
    SELECT
      index_record.relname AS name,
      index_definition.indisunique AS unique,
      index_definition.indisprimary AS primary,
      index_definition.indisexclusion AS exclusion,
      index_definition.indimmediate AS immediate,
      index_definition.indisvalid AS valid,
      index_definition.indisready AS ready,
      index_definition.indislive AS live,
      index_definition.indnkeyatts::int AS key_count,
      index_definition.indnatts::int AS attribute_count,
      access_method.amname AS method,
      pg_catalog.pg_get_expr(
        index_definition.indexprs,
        index_definition.indrelid
      ) AS expressions,
      pg_catalog.pg_get_expr(
        index_definition.indpred,
        index_definition.indrelid
      ) AS predicate,
      ARRAY(
        SELECT pg_catalog.pg_get_indexdef(
          index_definition.indexrelid,
          position,
          true
        )
        FROM generate_series(1, index_definition.indnatts) AS position
      ) AS columns,
      ARRAY(
        SELECT operator_class.opcname::text
        FROM unnest(index_definition.indclass)
          WITH ORDINALITY AS class_record(opcoid, ordinal)
        JOIN pg_catalog.pg_opclass operator_class
          ON operator_class.oid = class_record.opcoid
        ORDER BY class_record.ordinal
      ) AS opclasses
    FROM pg_catalog.pg_index index_definition
    JOIN pg_catalog.pg_class index_record
      ON index_record.oid = index_definition.indexrelid
    JOIN pg_catalog.pg_am access_method
      ON access_method.oid = index_record.relam
    WHERE index_definition.indrelid = $1
    ORDER BY index_record.relname
  `, [table.oid]);

  const triggers = await client.query<{ name: string }>(`
    SELECT tgname AS name
    FROM pg_catalog.pg_trigger
    WHERE tgrelid = $1
      AND NOT tgisinternal
    ORDER BY tgname
  `, [table.oid]);

  const catalogColumns: ImportPreviewCatalogColumn[] = columns.rows.map(
    (columnRecord) => ({
      ordinal: columnRecord.ordinal,
      name: columnRecord.name,
      dataType: columnRecord.data_type,
      notNull: columnRecord.not_null,
      defaultExpression: columnRecord.default_expression,
      identity: columnRecord.identity,
      generated: columnRecord.generated,
    }),
  );
  const catalogConstraints: ImportPreviewCatalogConstraint[] =
    constraints.rows.map((constraintRecord) => ({
      name: constraintRecord.name,
      type: constraintRecord.type,
      deferrable: constraintRecord.deferrable,
      deferred: constraintRecord.deferred,
      validated: constraintRecord.validated,
      localColumns: constraintRecord.local_columns,
      referencedSchema: constraintRecord.referenced_schema,
      referencedRelation: constraintRecord.referenced_relation,
      referencedColumns: constraintRecord.referenced_columns,
      updateAction: constraintRecord.update_action,
      deleteAction: constraintRecord.delete_action,
      matchType: constraintRecord.match_type,
      backingIndex: constraintRecord.backing_index,
    }));
  const catalogIndexes: ImportPreviewCatalogIndex[] = indexes.rows.map(
    (indexRecord) => ({
      name: indexRecord.name,
      unique: indexRecord.unique,
      primary: indexRecord.primary,
      exclusion: indexRecord.exclusion,
      immediate: indexRecord.immediate,
      valid: indexRecord.valid,
      ready: indexRecord.ready,
      live: indexRecord.live,
      keyCount: indexRecord.key_count,
      attributeCount: indexRecord.attribute_count,
      method: indexRecord.method,
      expressions: indexRecord.expressions,
      predicate: indexRecord.predicate,
      columns: indexRecord.columns,
      opclasses: indexRecord.opclasses,
    }),
  );

  return {
    relations: catalogRelations,
    columns: catalogColumns,
    constraints: catalogConstraints,
    indexes: catalogIndexes,
    triggers: triggers.rows.map((trigger) => trigger.name),
  };
}

async function writeReport(
  output: string,
  report: Record<string, unknown>,
): Promise<void> {
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set.");

  const output = option("output") ?? "tmp/import-preview-schema-preflight.json";
  const requiredState = option("require-state") as
    | Exclude<ImportPreviewSchemaState, "incompatible">
    | undefined;
  if (
    requiredState &&
    !["absent", "legacy", "final"].includes(requiredState)
  ) {
    throw new Error("--require-state must be absent, legacy, or final.");
  }

  const client = new Client({ connectionString });
  await client.connect();
  try {
    const schemaResult = await client.query<{ schema: string | null }>(
      "SELECT current_schema() AS schema",
    );
    const targetError = importPreviewSchemaTargetError(
      connectionString,
      schemaResult.rows[0]?.schema ?? null,
    );
    if (targetError) {
      await writeReport(output, {
        checkedAt: new Date().toISOString(),
        state: "incompatible",
        requiredState: requiredState ?? null,
        errors: [targetError],
      });
      throw new Error(`ImportPreview schema verification failed: ${targetError}.`);
    }

    const catalog = await inspectCatalog(client);
    const report = verifyImportPreviewCatalog(catalog);
    const errors = [...report.errors];
    if (requiredState && report.state !== requiredState) {
      errors.push(
        `ImportPreview must be ${requiredState}, but its exact state is ${report.state}`,
      );
    }
    await writeReport(output, {
      checkedAt: new Date().toISOString(),
      state: report.state,
      requiredState: requiredState ?? null,
      errors,
      catalog,
    });
    if (errors.length > 0) {
      throw new Error(
        `ImportPreview schema verification failed: ${errors.join("; ")}.`,
      );
    }
    console.log(`ImportPreview schema verification passed (${report.state}).`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(
    error instanceof Error
      ? error.message
      : "ImportPreview schema verification failed.",
  );
  process.exitCode = 1;
});
