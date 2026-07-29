import { describe, expect, it } from "vitest";
import {
  importPreviewSchemaTargetError,
  verifyImportPreviewCatalog,
  type ImportPreviewCatalog,
  type ImportPreviewCatalogIndex,
} from "./import-preview-schema";

function catalogIndex(
  name: string,
  columns: string[],
  opclasses: string[],
  unique = false,
  primary = false,
): ImportPreviewCatalogIndex {
  return {
    name,
    unique,
    primary,
    exclusion: false,
    immediate: true,
    valid: true,
    ready: true,
    live: true,
    keyCount: columns.length,
    attributeCount: columns.length,
    method: "btree",
    expressions: null,
    predicate: null,
    columns,
    opclasses,
  };
}

function legacyCatalog(): ImportPreviewCatalog {
  const indexes = [
    catalogIndex(
      "ImportPreview_actorId_entityType_idx",
      ['"actorId"', '"entityType"'],
      ["text_ops", "text_ops"],
    ),
    catalogIndex(
      "ImportPreview_expiresAt_idx",
      ['"expiresAt"'],
      ["timestamp_ops"],
    ),
    catalogIndex(
      "ImportPreview_pkey",
      ["id"],
      ["text_ops"],
      true,
      true,
    ),
    catalogIndex(
      "ImportPreview_tokenHash_key",
      ['"tokenHash"'],
      ["text_ops"],
      true,
    ),
  ];
  return {
    relations: [
      {
        name: "ImportPreview",
        kind: "r",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      },
      ...indexes.map((index) => ({
        name: index.name,
        kind: "i",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      })),
    ],
    columns: [
      column(1, "id", "text", true),
      column(2, "tokenHash", "text", true),
      column(3, "actorId", "text", true),
      column(4, "entityType", "text", true),
      column(5, "payloadHash", "text", true),
      column(6, "summary", "jsonb", true),
      column(7, "expiresAt", "timestamp(3) without time zone", true),
      column(8, "consumedAt", "timestamp(3) without time zone", false),
      column(
        9,
        "createdAt",
        "timestamp(3) without time zone",
        true,
        "CURRENT_TIMESTAMP",
      ),
    ],
    constraints: [
      {
        name: "ImportPreview_actorId_fkey",
        type: "f",
        deferrable: false,
        deferred: false,
        validated: true,
        localColumns: ["actorId"],
        referencedSchema: "public",
        referencedRelation: "User",
        referencedColumns: ["id"],
        updateAction: "c",
        deleteAction: "c",
        matchType: "s",
        backingIndex: null,
      },
      {
        name: "ImportPreview_pkey",
        type: "p",
        deferrable: false,
        deferred: false,
        validated: true,
        localColumns: ["id"],
        referencedSchema: null,
        referencedRelation: null,
        referencedColumns: [],
        updateAction: null,
        deleteAction: null,
        matchType: null,
        backingIndex: "ImportPreview_pkey",
      },
    ],
    indexes,
    triggers: [],
  };
}

function finalCatalog(): ImportPreviewCatalog {
  const catalog = legacyCatalog();
  catalog.columns.push(
    column(10, "payload", "jsonb", false),
    column(11, "report", "jsonb", false),
    column(12, "stateHash", "text", false),
    column(13, "fileName", "text", false),
    column(14, "committedAt", "timestamp(3) without time zone", false),
    column(15, "auditEventId", "text", false),
    column(16, "result", "jsonb", false),
  );
  catalog.constraints.push({
    name: "ImportPreview_auditEventId_fkey",
    type: "f",
    deferrable: false,
    deferred: false,
    validated: true,
    localColumns: ["auditEventId"],
    referencedSchema: "public",
    referencedRelation: "AuditEvent",
    referencedColumns: ["id"],
    updateAction: "c",
    deleteAction: "n",
    matchType: "s",
    backingIndex: null,
  });
  catalog.indexes.push(
    catalogIndex(
      "ImportPreview_auditEventId_idx",
      ['"auditEventId"'],
      ["text_ops"],
    ),
    catalogIndex(
      "ImportPreview_committedAt_idx",
      ['"committedAt"'],
      ["timestamp_ops"],
    ),
  );
  catalog.relations.push(
    {
      name: "ImportPreview_auditEventId_idx",
      kind: "i",
      persistence: "p",
      rowSecurity: false,
      forceRowSecurity: false,
    },
    {
      name: "ImportPreview_committedAt_idx",
      kind: "i",
      persistence: "p",
      rowSecurity: false,
      forceRowSecurity: false,
    },
  );
  return catalog;
}

function column(
  ordinal: number,
  name: string,
  dataType: string,
  notNull: boolean,
  defaultExpression: string | null = null,
) {
  return {
    ordinal,
    name,
    dataType,
    notNull,
    defaultExpression,
    identity: "",
    generated: "",
  };
}

describe("ImportPreview catalog verification", () => {
  it("requires the configured and active PostgreSQL schema to be public", () => {
    expect(importPreviewSchemaTargetError(
      "postgresql://user:secret@example.com/database",
      "public",
    )).toBeNull();
    expect(importPreviewSchemaTargetError(
      "postgresql://user:secret@example.com/database?schema=other",
      "public",
    )).toMatch(/non-public/i);
    expect(importPreviewSchemaTargetError(
      "postgresql://user:secret@example.com/database",
      "tenant",
    )).toMatch(/active PostgreSQL schema/i);
    expect(importPreviewSchemaTargetError("not a url", "public")).toMatch(
      /valid URL/i,
    );
  });

  it("accepts an absent table without reserved-name collisions", () => {
    expect(verifyImportPreviewCatalog({
      relations: [],
      columns: [],
      constraints: [],
      indexes: [],
      triggers: [],
    })).toEqual({ state: "absent", errors: [] });
  });

  it("accepts only the exact legacy and final shapes", () => {
    expect(verifyImportPreviewCatalog(legacyCatalog())).toEqual({
      state: "legacy",
      errors: [],
    });
    expect(verifyImportPreviewCatalog(finalCatalog())).toEqual({
      state: "final",
      errors: [],
    });
  });

  it("normalizes only CURRENT_TIMESTAMP and now() for createdAt", () => {
    const accepted = finalCatalog();
    accepted.columns[8] = {
      ...accepted.columns[8],
      defaultExpression: "now()",
    };
    expect(verifyImportPreviewCatalog(accepted).state).toBe("final");

    for (const expression of [
      "CURRENT_TIMESTAMP(3)",
      "clock_timestamp()",
      "'2000-01-01 00:00:00'::timestamp without time zone",
    ]) {
      const catalog = finalCatalog();
      catalog.columns[8] = {
        ...catalog.columns[8],
        defaultExpression: expression,
      };
      expect(verifyImportPreviewCatalog(catalog)).toMatchObject({
        state: "incompatible",
        errors: [expect.stringMatching(/columns/i)],
      });
    }
  });

  it("rejects partial upgrades and any column drift", () => {
    const partial = legacyCatalog();
    partial.columns.push(column(10, "payload", "jsonb", false));
    expect(verifyImportPreviewCatalog(partial).state).toBe("incompatible");

    const wrongPrecision = finalCatalog();
    wrongPrecision.columns[6] = {
      ...wrongPrecision.columns[6],
      dataType: "timestamp without time zone",
    };
    expect(verifyImportPreviewCatalog(wrongPrecision).state).toBe(
      "incompatible",
    );

    const unexpectedDefault = finalCatalog();
    unexpectedDefault.columns[4] = {
      ...unexpectedDefault.columns[4],
      defaultExpression: "'x'::text",
    };
    expect(verifyImportPreviewCatalog(unexpectedDefault).state).toBe(
      "incompatible",
    );

    const generated = finalCatalog();
    generated.columns[3] = { ...generated.columns[3], generated: "s" };
    expect(verifyImportPreviewCatalog(generated).state).toBe("incompatible");
  });

  it("rejects foreign-key column, target, action, match, and validation drift", () => {
    const mutations = [
      { referencedColumns: ["email"] },
      { referencedSchema: "other" },
      { referencedRelation: "OtherUser" },
      { updateAction: "a" },
      { deleteAction: "r" },
      { matchType: "f" },
      { validated: false },
      { deferrable: true },
      { deferred: true },
    ];
    for (const mutation of mutations) {
      const catalog = finalCatalog();
      catalog.constraints[0] = {
        ...catalog.constraints[0],
        ...mutation,
      };
      expect(verifyImportPreviewCatalog(catalog)).toMatchObject({
        state: "incompatible",
        errors: expect.arrayContaining([expect.stringMatching(/constraints/i)]),
      });
    }
  });

  it("rejects wrong index flags, order, expressions, predicates, and readiness", () => {
    const mutations: Array<Partial<ImportPreviewCatalogIndex>> = [
      { unique: true },
      { primary: true },
      { exclusion: true },
      { immediate: false },
      { valid: false },
      { ready: false },
      { live: false },
      { columns: ['"entityType"', '"actorId"'] },
      { expressions: 'lower("actorId")' },
      { predicate: '"actorId" IS NOT NULL' },
      { keyCount: 1 },
      { attributeCount: 3 },
      { method: "hash" },
      { opclasses: ["text_pattern_ops", "text_ops"] },
    ];
    for (const mutation of mutations) {
      const catalog = finalCatalog();
      catalog.indexes[0] = { ...catalog.indexes[0], ...mutation };
      expect(verifyImportPreviewCatalog(catalog)).toMatchObject({
        state: "incompatible",
        errors: expect.arrayContaining([expect.stringMatching(/indexes/i)]),
      });
    }
  });

  it("rejects triggers, RLS, extra indexes, and reserved-name collisions", () => {
    const trigger = finalCatalog();
    trigger.triggers.push("unexpected_trigger");
    expect(verifyImportPreviewCatalog(trigger).state).toBe("incompatible");

    const rls = finalCatalog();
    rls.relations[0] = { ...rls.relations[0], rowSecurity: true };
    expect(verifyImportPreviewCatalog(rls).state).toBe("incompatible");

    const extraIndex = finalCatalog();
    extraIndex.indexes.push({
      ...extraIndex.indexes[0],
      name: "ImportPreview_unapproved_idx",
    });
    expect(verifyImportPreviewCatalog(extraIndex).state).toBe("incompatible");

    expect(verifyImportPreviewCatalog({
      relations: [{
        name: "ImportPreview_tokenHash_key",
        kind: "r",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      }],
      columns: [],
      constraints: [],
      indexes: [],
      triggers: [],
    })).toMatchObject({
      state: "incompatible",
      errors: [expect.stringMatching(/reserved/i)],
    });
  });
});
