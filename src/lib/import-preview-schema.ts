export type ImportPreviewCatalogRelation = {
  name: string;
  kind: string;
  persistence: string;
  rowSecurity: boolean;
  forceRowSecurity: boolean;
};

export type ImportPreviewCatalogColumn = {
  ordinal: number;
  name: string;
  dataType: string;
  notNull: boolean;
  defaultExpression: string | null;
  identity: string;
  generated: string;
};

export type ImportPreviewCatalogConstraint = {
  name: string;
  type: string;
  deferrable: boolean;
  deferred: boolean;
  validated: boolean;
  localColumns: string[];
  referencedSchema: string | null;
  referencedRelation: string | null;
  referencedColumns: string[];
  updateAction: string | null;
  deleteAction: string | null;
  matchType: string | null;
  backingIndex: string | null;
};

export type ImportPreviewCatalogIndex = {
  name: string;
  unique: boolean;
  primary: boolean;
  exclusion: boolean;
  immediate: boolean;
  valid: boolean;
  ready: boolean;
  live: boolean;
  keyCount: number;
  attributeCount: number;
  method: string;
  expressions: string | null;
  predicate: string | null;
  columns: string[];
  opclasses: string[];
};

export type ImportPreviewCatalog = {
  relations: ImportPreviewCatalogRelation[];
  columns: ImportPreviewCatalogColumn[];
  constraints: ImportPreviewCatalogConstraint[];
  indexes: ImportPreviewCatalogIndex[];
  triggers: string[];
};

export type ImportPreviewSchemaState =
  | "absent"
  | "legacy"
  | "final"
  | "incompatible";

export type ImportPreviewSchemaReport = {
  state: ImportPreviewSchemaState;
  errors: string[];
};

const TABLE_NAME = "ImportPreview";
const PRIMARY_INDEX_NAME = "ImportPreview_pkey";

const LEGACY_INDEX_NAMES = [
  "ImportPreview_actorId_entityType_idx",
  "ImportPreview_expiresAt_idx",
  PRIMARY_INDEX_NAME,
  "ImportPreview_tokenHash_key",
] as const;

const FINAL_INDEX_NAMES = [
  ...LEGACY_INDEX_NAMES,
  "ImportPreview_auditEventId_idx",
  "ImportPreview_committedAt_idx",
] as const;

export const IMPORT_PREVIEW_RESERVED_RELATION_NAMES = [
  TABLE_NAME,
  ...FINAL_INDEX_NAMES,
] as const;

export function importPreviewSchemaTargetError(
  connectionString: string,
  currentSchema: string | null,
): string | null {
  let configuredSchema: string | null;
  try {
    configuredSchema = new URL(connectionString).searchParams.get("schema");
  } catch {
    return "DATABASE_URL is not a valid URL";
  }
  if (configuredSchema && configuredSchema !== "public") {
    return "DATABASE_URL must not target a non-public Prisma schema";
  }
  if (currentSchema !== "public") {
    return "the active PostgreSQL schema must be public";
  }
  return null;
}

const legacyColumns: ImportPreviewCatalogColumn[] = [
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
];

const finalColumns: ImportPreviewCatalogColumn[] = [
  ...legacyColumns,
  column(10, "payload", "jsonb", false),
  column(11, "report", "jsonb", false),
  column(12, "stateHash", "text", false),
  column(13, "fileName", "text", false),
  column(14, "committedAt", "timestamp(3) without time zone", false),
  column(15, "auditEventId", "text", false),
  column(16, "result", "jsonb", false),
];

const primaryConstraint: ImportPreviewCatalogConstraint = {
  name: PRIMARY_INDEX_NAME,
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
  backingIndex: PRIMARY_INDEX_NAME,
};

const actorConstraint: ImportPreviewCatalogConstraint = foreignKey(
  "ImportPreview_actorId_fkey",
  "actorId",
  "User",
  "c",
  "c",
);

const auditConstraint: ImportPreviewCatalogConstraint = foreignKey(
  "ImportPreview_auditEventId_fkey",
  "auditEventId",
  "AuditEvent",
  "c",
  "n",
);

const expectedIndexes: Record<string, ImportPreviewCatalogIndex> = {
  ImportPreview_actorId_entityType_idx: index(
    "ImportPreview_actorId_entityType_idx",
    false,
    false,
    ['"actorId"', '"entityType"'],
    ["text_ops", "text_ops"],
  ),
  ImportPreview_auditEventId_idx: index(
    "ImportPreview_auditEventId_idx",
    false,
    false,
    ['"auditEventId"'],
    ["text_ops"],
  ),
  ImportPreview_committedAt_idx: index(
    "ImportPreview_committedAt_idx",
    false,
    false,
    ['"committedAt"'],
    ["timestamp_ops"],
  ),
  ImportPreview_expiresAt_idx: index(
    "ImportPreview_expiresAt_idx",
    false,
    false,
    ['"expiresAt"'],
    ["timestamp_ops"],
  ),
  [PRIMARY_INDEX_NAME]: index(
    PRIMARY_INDEX_NAME,
    true,
    true,
    ["id"],
    ["text_ops"],
  ),
  ImportPreview_tokenHash_key: index(
    "ImportPreview_tokenHash_key",
    true,
    false,
    ['"tokenHash"'],
    ["text_ops"],
  ),
};

function column(
  ordinal: number,
  name: string,
  dataType: string,
  notNull: boolean,
  defaultExpression: string | null = null,
): ImportPreviewCatalogColumn {
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

function foreignKey(
  name: string,
  localColumn: string,
  referencedRelation: string,
  updateAction: string,
  deleteAction: string,
): ImportPreviewCatalogConstraint {
  return {
    name,
    type: "f",
    deferrable: false,
    deferred: false,
    validated: true,
    localColumns: [localColumn],
    referencedSchema: "public",
    referencedRelation,
    referencedColumns: ["id"],
    updateAction,
    deleteAction,
    matchType: "s",
    backingIndex: null,
  };
}

function index(
  name: string,
  unique: boolean,
  primary: boolean,
  columns: string[],
  opclasses: string[],
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

function normalizeDefault(expression: string | null): string | null {
  if (expression === null) return null;
  const compact = expression.replace(/\s+/g, "").toLowerCase();
  return compact === "current_timestamp" || compact === "now()"
    ? "CURRENT_TIMESTAMP"
    : expression;
}

function canonicalCatalog(catalog: ImportPreviewCatalog): ImportPreviewCatalog {
  return {
    relations: [...catalog.relations].sort((left, right) =>
      left.name.localeCompare(right.name)),
    columns: [...catalog.columns]
      .map((item) => ({
        ...item,
        defaultExpression: normalizeDefault(item.defaultExpression),
      }))
      .sort((left, right) => left.ordinal - right.ordinal),
    constraints: [...catalog.constraints].sort((left, right) =>
      left.name.localeCompare(right.name)),
    indexes: [...catalog.indexes].sort((left, right) =>
      left.name.localeCompare(right.name)),
    triggers: [...catalog.triggers].sort(),
  };
}

function expectedCatalog(
  state: "legacy" | "final",
): ImportPreviewCatalog {
  const indexNames = state === "legacy"
    ? [...LEGACY_INDEX_NAMES]
    : [...FINAL_INDEX_NAMES];
  const indexes = indexNames
    .map((name) => expectedIndexes[name])
    .sort((left, right) => left.name.localeCompare(right.name));
  const relations: ImportPreviewCatalogRelation[] = [
    {
      name: TABLE_NAME,
      kind: "r",
      persistence: "p",
      rowSecurity: false,
      forceRowSecurity: false,
    },
    ...indexes.map((item) => ({
      name: item.name,
      kind: "i",
      persistence: "p",
      rowSecurity: false,
      forceRowSecurity: false,
    })),
  ].sort((left, right) => left.name.localeCompare(right.name));
  return {
    relations,
    columns: state === "legacy" ? legacyColumns : finalColumns,
    constraints: (
      state === "legacy"
        ? [actorConstraint, primaryConstraint]
        : [actorConstraint, auditConstraint, primaryConstraint]
    ).sort((left, right) => left.name.localeCompare(right.name)),
    indexes,
    triggers: [],
  };
}

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function mismatchErrors(
  actual: ImportPreviewCatalog,
  expected: ImportPreviewCatalog,
): string[] {
  const errors: string[] = [];
  if (!same(actual.relations, expected.relations)) {
    errors.push("ImportPreview table and reserved index relations do not exactly match");
  }
  if (!same(actual.columns, expected.columns)) {
    errors.push("ImportPreview columns do not exactly match");
  }
  if (!same(actual.constraints, expected.constraints)) {
    errors.push("ImportPreview constraints do not exactly match");
  }
  if (!same(actual.indexes, expected.indexes)) {
    errors.push("ImportPreview indexes do not exactly match");
  }
  if (!same(actual.triggers, expected.triggers)) {
    errors.push("ImportPreview must not have non-internal triggers");
  }
  return errors;
}

export function verifyImportPreviewCatalog(
  suppliedCatalog: ImportPreviewCatalog,
): ImportPreviewSchemaReport {
  const catalog = canonicalCatalog(suppliedCatalog);
  const table = catalog.relations.find((relation) => relation.name === TABLE_NAME);

  if (!table) {
    const errors: string[] = [];
    if (catalog.relations.length > 0) {
      errors.push("reserved ImportPreview relation names already exist without the table");
    }
    if (
      catalog.columns.length > 0 ||
      catalog.constraints.length > 0 ||
      catalog.indexes.length > 0 ||
      catalog.triggers.length > 0
    ) {
      errors.push("catalog details were returned for an absent ImportPreview table");
    }
    return {
      state: errors.length === 0 ? "absent" : "incompatible",
      errors,
    };
  }

  const legacyErrors = mismatchErrors(catalog, expectedCatalog("legacy"));
  if (legacyErrors.length === 0) {
    return { state: "legacy", errors: [] };
  }

  const finalErrors = mismatchErrors(catalog, expectedCatalog("final"));
  if (finalErrors.length === 0) {
    return { state: "final", errors: [] };
  }

  const errors = catalog.columns.length === legacyColumns.length
    ? legacyErrors
    : catalog.columns.length === finalColumns.length
      ? finalErrors
      : [...new Set([...legacyErrors, ...finalErrors])];
  return { state: "incompatible", errors };
}
