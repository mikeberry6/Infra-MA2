export type CatalogRelation = {
  name: string;
  kind: string;
  persistence: string;
  rowSecurity: boolean;
  forceRowSecurity: boolean;
};

export type CatalogColumn = {
  ordinal: number;
  name: string;
  dataType: string;
  notNull: boolean;
  defaultExpression: string | null;
  identity: string;
  generated: string;
};

export type CatalogConstraint = {
  name: string;
  type: string;
  deferrable: boolean;
  deferred: boolean;
  validated: boolean;
  definition: string;
};

export type CatalogIndex = {
  name: string;
  unique: boolean;
  primary: boolean;
  valid: boolean;
  ready: boolean;
  keyCount: number;
  attributeCount: number;
  method: string;
  expressions: string | null;
  predicate: string | null;
  columns: string[];
  opclasses: string[];
};

export type AuthThrottleCatalog = {
  relations: CatalogRelation[];
  columns: CatalogColumn[];
  constraints: CatalogConstraint[];
  indexes: CatalogIndex[];
  triggers: string[];
};

export type AuthThrottleSchemaReport = {
  state: "absent" | "compatible" | "incompatible";
  errors: string[];
};

const TABLE_NAME = "AuthThrottle";
const PRIMARY_INDEX_NAME = "AuthThrottle_pkey";
const OPTIONAL_INDEX_NAMES = [
  "AuthThrottle_lockedUntil_idx",
  "AuthThrottle_updatedAt_idx",
] as const;

export function authThrottleSchemaTargetError(
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

const expectedColumns: CatalogColumn[] = [
  {
    ordinal: 1,
    name: "keyHash",
    dataType: "text",
    notNull: true,
    defaultExpression: null,
    identity: "",
    generated: "",
  },
  {
    ordinal: 2,
    name: "failedAttempts",
    dataType: "integer",
    notNull: true,
    defaultExpression: "0",
    identity: "",
    generated: "",
  },
  {
    ordinal: 3,
    name: "windowStartedAt",
    dataType: "timestamp(3) without time zone",
    notNull: true,
    defaultExpression: "CURRENT_TIMESTAMP",
    identity: "",
    generated: "",
  },
  {
    ordinal: 4,
    name: "lockedUntil",
    dataType: "timestamp(3) without time zone",
    notNull: false,
    defaultExpression: null,
    identity: "",
    generated: "",
  },
  {
    ordinal: 5,
    name: "updatedAt",
    dataType: "timestamp(3) without time zone",
    notNull: true,
    defaultExpression: null,
    identity: "",
    generated: "",
  },
];

const expectedPrimaryConstraint: CatalogConstraint = {
  name: PRIMARY_INDEX_NAME,
  type: "p",
  deferrable: false,
  deferred: false,
  validated: true,
  definition: 'PRIMARY KEY ("keyHash")',
};

const expectedIndexes: Record<string, CatalogIndex> = {
  [PRIMARY_INDEX_NAME]: {
    name: PRIMARY_INDEX_NAME,
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
  [OPTIONAL_INDEX_NAMES[0]]: {
    name: OPTIONAL_INDEX_NAMES[0],
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
  [OPTIONAL_INDEX_NAMES[1]]: {
    name: OPTIONAL_INDEX_NAMES[1],
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
};

function same(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function verifyAuthThrottleCatalog(
  catalog: AuthThrottleCatalog,
): AuthThrottleSchemaReport {
  const errors: string[] = [];
  const table = catalog.relations.find((relation) => relation.name === TABLE_NAME);

  if (!table) {
    if (catalog.relations.length > 0) {
      errors.push("reserved AuthThrottle relation names already exist without the table");
    }
    if (
      catalog.columns.length > 0 ||
      catalog.constraints.length > 0 ||
      catalog.indexes.length > 0 ||
      catalog.triggers.length > 0
    ) {
      errors.push("catalog details were returned for an absent AuthThrottle table");
    }
    return {
      state: errors.length === 0 ? "absent" : "incompatible",
      errors,
    };
  }

  if (
    table.kind !== "r" ||
    table.persistence !== "p" ||
    table.rowSecurity ||
    table.forceRowSecurity
  ) {
    errors.push("AuthThrottle must be a permanent ordinary table with row-level security disabled");
  }

  if (!same(catalog.columns, expectedColumns)) {
    errors.push("AuthThrottle columns do not exactly match the approved schema");
  }
  if (
    catalog.constraints.length !== 1 ||
    !same(catalog.constraints[0], expectedPrimaryConstraint)
  ) {
    errors.push("AuthThrottle must have only the approved primary-key constraint");
  }
  if (catalog.triggers.length > 0) {
    errors.push("AuthThrottle must not have non-internal triggers");
  }

  const allowedIndexNames = new Set([
    PRIMARY_INDEX_NAME,
    ...OPTIONAL_INDEX_NAMES,
  ]);
  const actualIndexNames = new Set(catalog.indexes.map((index) => index.name));
  if (
    catalog.indexes.some((index) => !allowedIndexNames.has(index.name)) ||
    !actualIndexNames.has(PRIMARY_INDEX_NAME)
  ) {
    errors.push("AuthThrottle has a missing primary index or an unapproved extra index");
  }
  for (const index of catalog.indexes) {
    if (
      allowedIndexNames.has(index.name) &&
      !same(index, expectedIndexes[index.name])
    ) {
      errors.push(`${index.name} does not exactly match the approved index definition`);
    }
  }

  const expectedRelationNames = new Set([
    TABLE_NAME,
    ...catalog.indexes.map((index) => index.name),
  ]);
  if (
    catalog.relations.some(
      (relation) =>
        !expectedRelationNames.has(relation.name) ||
        (relation.name !== TABLE_NAME &&
          (relation.kind !== "i" || relation.persistence !== "p")),
    ) ||
    catalog.relations.length !== expectedRelationNames.size
  ) {
    errors.push("a reserved AuthThrottle index name is bound to an unexpected relation");
  }

  return {
    state: errors.length === 0 ? "compatible" : "incompatible",
    errors,
  };
}
