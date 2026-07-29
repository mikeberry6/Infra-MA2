import { describe, expect, it } from "vitest";
import {
  authThrottleSchemaTargetError,
  verifyAuthThrottleCatalog,
  type AuthThrottleCatalog,
} from "./auth-throttle-schema";

function compatibleCatalog(): AuthThrottleCatalog {
  return {
    relations: [
      {
        name: "AuthThrottle",
        kind: "r",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      },
      {
        name: "AuthThrottle_lockedUntil_idx",
        kind: "i",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      },
      {
        name: "AuthThrottle_pkey",
        kind: "i",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      },
      {
        name: "AuthThrottle_updatedAt_idx",
        kind: "i",
        persistence: "p",
        rowSecurity: false,
        forceRowSecurity: false,
      },
    ],
    columns: [
      { ordinal: 1, name: "keyHash", dataType: "text", notNull: true, defaultExpression: null, identity: "", generated: "" },
      { ordinal: 2, name: "failedAttempts", dataType: "integer", notNull: true, defaultExpression: "0", identity: "", generated: "" },
      { ordinal: 3, name: "windowStartedAt", dataType: "timestamp(3) without time zone", notNull: true, defaultExpression: "CURRENT_TIMESTAMP", identity: "", generated: "" },
      { ordinal: 4, name: "lockedUntil", dataType: "timestamp(3) without time zone", notNull: false, defaultExpression: null, identity: "", generated: "" },
      { ordinal: 5, name: "updatedAt", dataType: "timestamp(3) without time zone", notNull: true, defaultExpression: null, identity: "", generated: "" },
    ],
    constraints: [
      {
        name: "AuthThrottle_pkey",
        type: "p",
        deferrable: false,
        deferred: false,
        validated: true,
        definition: 'PRIMARY KEY ("keyHash")',
      },
    ],
    indexes: [
      {
        name: "AuthThrottle_lockedUntil_idx",
        unique: false,
        primary: false,
        valid: true,
        ready: true,
        keyCount: 1,
        attributeCount: 1,
        method: "btree",
        expressions: null,
        predicate: null,
        columns: ['"lockedUntil"'],
        opclasses: ["timestamp_ops"],
      },
      {
        name: "AuthThrottle_pkey",
        unique: true,
        primary: true,
        valid: true,
        ready: true,
        keyCount: 1,
        attributeCount: 1,
        method: "btree",
        expressions: null,
        predicate: null,
        columns: ['"keyHash"'],
        opclasses: ["text_ops"],
      },
      {
        name: "AuthThrottle_updatedAt_idx",
        unique: false,
        primary: false,
        valid: true,
        ready: true,
        keyCount: 1,
        attributeCount: 1,
        method: "btree",
        expressions: null,
        predicate: null,
        columns: ['"updatedAt"'],
        opclasses: ["timestamp_ops"],
      },
    ],
    triggers: [],
  };
}

describe("AuthThrottle catalog verification", () => {
  it("requires the configured and active PostgreSQL schema to be public", () => {
    expect(authThrottleSchemaTargetError(
      "postgresql://user:secret@example.com/database",
      "public",
    )).toBeNull();
    expect(authThrottleSchemaTargetError(
      "postgresql://user:secret@example.com/database?schema=other",
      "public",
    )).toMatch(/non-public/i);
    expect(authThrottleSchemaTargetError(
      "postgresql://user:secret@example.com/database",
      "tenant",
    )).toMatch(/active PostgreSQL schema/i);
  });

  it("accepts an absent table with no reserved-name conflicts", () => {
    expect(verifyAuthThrottleCatalog({
      relations: [],
      columns: [],
      constraints: [],
      indexes: [],
      triggers: [],
    })).toEqual({ state: "absent", errors: [] });
  });

  it("accepts both the compatible legacy and final table shapes", () => {
    const finalCatalog = compatibleCatalog();
    expect(verifyAuthThrottleCatalog(finalCatalog)).toEqual({
      state: "compatible",
      errors: [],
    });

    const legacyCatalog = compatibleCatalog();
    legacyCatalog.indexes = legacyCatalog.indexes.filter(
      (index) => index.name !== "AuthThrottle_updatedAt_idx",
    );
    legacyCatalog.relations = legacyCatalog.relations.filter(
      (relation) => relation.name !== "AuthThrottle_updatedAt_idx",
    );
    expect(verifyAuthThrottleCatalog(legacyCatalog)).toEqual({
      state: "compatible",
      errors: [],
    });
  });

  it("rejects column, constraint, index, trigger, and RLS drift", () => {
    const catalog = compatibleCatalog();
    catalog.columns[1] = { ...catalog.columns[1], notNull: false };
    catalog.constraints[0] = { ...catalog.constraints[0], validated: false };
    catalog.indexes[0] = { ...catalog.indexes[0], predicate: '"lockedUntil" IS NOT NULL' };
    catalog.triggers.push("unexpected_trigger");
    catalog.relations[0] = { ...catalog.relations[0], rowSecurity: true };

    const report = verifyAuthThrottleCatalog(catalog);
    expect(report.state).toBe("incompatible");
    expect(report.errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/ordinary table/i),
      expect.stringMatching(/columns/i),
      expect.stringMatching(/primary-key/i),
      expect.stringMatching(/index definition/i),
      expect.stringMatching(/triggers/i),
    ]));
  });

  it("rejects reserved-name collisions when the table is absent", () => {
    const report = verifyAuthThrottleCatalog({
      relations: [
        {
          name: "AuthThrottle_updatedAt_idx",
          kind: "r",
          persistence: "p",
          rowSecurity: false,
          forceRowSecurity: false,
        },
      ],
      columns: [],
      constraints: [],
      indexes: [],
      triggers: [],
    });
    expect(report.state).toBe("incompatible");
    expect(report.errors).toEqual([expect.stringMatching(/reserved/i)]);
  });

  it("rejects extra indexes and target index names bound elsewhere", () => {
    const catalog = compatibleCatalog();
    catalog.indexes.push({
      ...catalog.indexes[2],
      name: "unapproved_index",
    });
    catalog.relations.push({
      ...catalog.relations[2],
      name: "AuthThrottle_unexpected_idx",
    });

    const report = verifyAuthThrottleCatalog(catalog);
    expect(report.state).toBe("incompatible");
    expect(report.errors).toEqual(expect.arrayContaining([
      expect.stringMatching(/extra index/i),
      expect.stringMatching(/unexpected relation/i),
    ]));
  });
});
