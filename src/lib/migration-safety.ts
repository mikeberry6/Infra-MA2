export interface MigrationSafetyIssue {
  statement: string;
  reason: string;
}

type SqlTokenKind = "word" | "identifier" | "literal" | "number" | "symbol";

interface SqlToken {
  kind: SqlTokenKind;
  value: string;
}

function compact(statement: string): string {
  return statement.replace(/\s+/g, " ").trim();
}

function readDollarQuoteDelimiter(sql: string, offset: number): string | null {
  const match = /^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/.exec(sql.slice(offset));
  return match?.[0] ?? null;
}

/**
 * Split SQL without treating semicolons in strings, identifiers, dollar-quoted
 * bodies, or comments as statement boundaries. Comments are discarded so
 * policy keywords in explanatory prose cannot cause false positives.
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let index = 0;

  const consumeQuoted = (quote: "'" | '"') => {
    current += quote;
    index += 1;
    while (index < sql.length) {
      const character = sql[index];
      current += character;
      index += 1;
      if (character !== quote) continue;
      if (sql[index] === quote) {
        current += sql[index];
        index += 1;
        continue;
      }
      return;
    }
    throw new Error(`Unterminated ${quote === "'" ? "string" : "quoted identifier"}.`);
  };

  while (index < sql.length) {
    if (sql.startsWith("--", index)) {
      index += 2;
      while (index < sql.length && sql[index] !== "\n" && sql[index] !== "\r") index += 1;
      current += " ";
      continue;
    }

    if (sql.startsWith("/*", index)) {
      index += 2;
      let depth = 1;
      while (index < sql.length && depth > 0) {
        if (sql.startsWith("/*", index)) {
          depth += 1;
          index += 2;
        } else if (sql.startsWith("*/", index)) {
          depth -= 1;
          index += 2;
        } else {
          index += 1;
        }
      }
      if (depth !== 0) throw new Error("Unterminated block comment.");
      current += " ";
      continue;
    }

    const character = sql[index];
    if (character === "'" || character === '"') {
      consumeQuoted(character);
      continue;
    }

    if (character === "$") {
      const delimiter = readDollarQuoteDelimiter(sql, index);
      if (delimiter) {
        const closeAt = sql.indexOf(delimiter, index + delimiter.length);
        if (closeAt < 0) throw new Error("Unterminated dollar-quoted string.");
        current += sql.slice(index, closeAt + delimiter.length);
        index = closeAt + delimiter.length;
        continue;
      }
    }

    if (character === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      index += 1;
      continue;
    }

    current += character;
    index += 1;
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

function tokenize(statement: string): SqlToken[] {
  const tokens: SqlToken[] = [];
  let index = 0;

  while (index < statement.length) {
    const character = statement[index];
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (character === "'" || character === '"') {
      const kind: SqlTokenKind = character === "'" ? "literal" : "identifier";
      const start = index;
      index += 1;
      let closed = false;
      while (index < statement.length) {
        if (statement[index] !== character) {
          index += 1;
          continue;
        }
        index += 1;
        if (statement[index] === character) {
          index += 1;
          continue;
        }
        closed = true;
        break;
      }
      if (!closed) throw new Error("Unterminated quoted token.");
      tokens.push({ kind, value: statement.slice(start, index) });
      continue;
    }

    if (character === "$") {
      const delimiter = readDollarQuoteDelimiter(statement, index);
      if (delimiter) {
        const closeAt = statement.indexOf(delimiter, index + delimiter.length);
        if (closeAt < 0) throw new Error("Unterminated dollar-quoted token.");
        const end = closeAt + delimiter.length;
        tokens.push({ kind: "literal", value: statement.slice(index, end) });
        index = end;
        continue;
      }
    }

    if (/[A-Za-z_]/.test(character)) {
      const start = index;
      index += 1;
      while (index < statement.length && /[A-Za-z0-9_$]/.test(statement[index])) index += 1;
      tokens.push({ kind: "word", value: statement.slice(start, index).toUpperCase() });
      continue;
    }

    if (/[0-9]/.test(character)) {
      const start = index;
      index += 1;
      while (index < statement.length && /[0-9.]/.test(statement[index])) index += 1;
      tokens.push({ kind: "number", value: statement.slice(start, index) });
      continue;
    }

    tokens.push({ kind: "symbol", value: character });
    index += 1;
  }

  return tokens;
}

function isWord(token: SqlToken | undefined, value: string): boolean {
  return token?.kind === "word" && token.value === value;
}

function skipQualifiedIdentifier(tokens: SqlToken[], start: number): number | null {
  const isIdentifier = (token: SqlToken | undefined) => token?.kind === "word" || token?.kind === "identifier";
  if (!isIdentifier(tokens[start])) return null;
  let index = start + 1;
  while (tokens[index]?.value === "." && isIdentifier(tokens[index + 1])) index += 2;
  return index;
}

function hasSingleParenthesizedBody(tokens: SqlToken[], start: number): boolean {
  if (tokens[start]?.value !== "(") return false;
  let depth = 0;
  for (let index = start; index < tokens.length; index += 1) {
    if (tokens[index].value === "(") depth += 1;
    if (tokens[index].value === ")") {
      depth -= 1;
      if (depth < 0) return false;
      if (depth === 0) return index === tokens.length - 1;
    }
  }
  return false;
}

function splitTopLevelClauses(tokens: SqlToken[]): SqlToken[][] | null {
  const clauses: SqlToken[][] = [];
  let clause: SqlToken[] = [];
  let depth = 0;
  for (const token of tokens) {
    if (token.value === "(") depth += 1;
    if (token.value === ")") {
      depth -= 1;
      if (depth < 0) return null;
    }
    if (token.value === "," && depth === 0) {
      if (clause.length === 0) return null;
      clauses.push(clause);
      clause = [];
    } else {
      clause.push(token);
    }
  }
  if (depth !== 0 || clause.length === 0) return null;
  clauses.push(clause);
  return clauses;
}

function isSafeAlterClause(clause: SqlToken[]): boolean {
  if (!isWord(clause[0], "ADD") || (!isWord(clause[1], "COLUMN") && !isWord(clause[1], "CONSTRAINT"))) {
    return false;
  }

  const forbidden = new Set(["ADD", "ALTER", "CREATE", "DROP", "INSERT", "RENAME", "SELECT", "TRUNCATE"]);
  let depth = 0;
  let previousTopLevelWord: string | null = null;
  for (let index = 2; index < clause.length; index += 1) {
    const token = clause[index];
    if (token.value === "(") depth += 1;
    if (token.value === ")") {
      depth -= 1;
      if (depth < 0) return false;
      continue;
    }
    if (depth !== 0 || token.kind !== "word") continue;
    if (forbidden.has(token.value)) return false;
    if ((token.value === "DELETE" || token.value === "UPDATE") && previousTopLevelWord !== "ON") return false;
    previousTopLevelWord = token.value;
  }
  return depth === 0 && clause.length > 2;
}

function isAllowedStatement(tokens: SqlToken[]): boolean {
  if (tokens.length === 2 && isWord(tokens[0], "SELECT") && tokens[1].kind === "number" && tokens[1].value === "1") {
    return true;
  }

  if (isWord(tokens[0], "COMMENT") && isWord(tokens[1], "ON")) return tokens.length >= 5;

  if (isWord(tokens[0], "CREATE") && isWord(tokens[1], "TYPE")) {
    const afterName = skipQualifiedIdentifier(tokens, 2);
    return afterName !== null
      && isWord(tokens[afterName], "AS")
      && isWord(tokens[afterName + 1], "ENUM")
      && hasSingleParenthesizedBody(tokens, afterName + 2);
  }

  if (isWord(tokens[0], "CREATE") && isWord(tokens[1], "TABLE")) {
    let index = 2;
    if (isWord(tokens[index], "IF") && isWord(tokens[index + 1], "NOT") && isWord(tokens[index + 2], "EXISTS")) index += 3;
    const afterName = skipQualifiedIdentifier(tokens, index);
    return afterName !== null && hasSingleParenthesizedBody(tokens, afterName);
  }

  if (isWord(tokens[0], "CREATE")) {
    let index = 1;
    if (isWord(tokens[index], "UNIQUE")) index += 1;
    if (!isWord(tokens[index], "INDEX")) return false;
    index += 1;
    if (isWord(tokens[index], "IF") && isWord(tokens[index + 1], "NOT") && isWord(tokens[index + 2], "EXISTS")) index += 3;
    const afterIndexName = skipQualifiedIdentifier(tokens, index);
    if (afterIndexName === null || !isWord(tokens[afterIndexName], "ON")) return false;
    index = afterIndexName + 1;
    if (isWord(tokens[index], "ONLY")) index += 1;
    const afterTableName = skipQualifiedIdentifier(tokens, index);
    if (afterTableName === null || afterTableName >= tokens.length) return false;
    const indexBody = tokens.slice(afterTableName);
    const forbidden = new Set(["ALTER", "CREATE", "DELETE", "DROP", "INSERT", "RENAME", "SELECT", "TRUNCATE", "UPDATE"]);
    return indexBody.some((token) => token.value === "(")
      && !indexBody.some((token) => token.kind === "word" && forbidden.has(token.value));
  }

  if (isWord(tokens[0], "ALTER") && isWord(tokens[1], "TABLE")) {
    let index = 2;
    if (isWord(tokens[index], "ONLY")) index += 1;
    if (isWord(tokens[index], "IF") && isWord(tokens[index + 1], "EXISTS")) index += 2;
    const afterTableName = skipQualifiedIdentifier(tokens, index);
    if (afterTableName === null) return false;
    const clauses = splitTopLevelClauses(tokens.slice(afterTableName));
    return clauses !== null && clauses.every(isSafeAlterClause);
  }

  return false;
}

/**
 * Production schema staging accepts only additive DDL. Data backfills and any
 * destructive/transforming DDL belong in separately reviewed, restartable
 * commands after compatible application code has shipped.
 */
export function auditAdditiveMigrationSql(sql: string): MigrationSafetyIssue[] {
  let statements: string[];
  try {
    statements = splitSqlStatements(sql);
  } catch (error) {
    return [{
      statement: compact(sql).slice(0, 240),
      reason: error instanceof Error ? error.message : "SQL could not be parsed safely.",
    }];
  }

  return statements.flatMap((statement) => {
    try {
      return isAllowedStatement(tokenize(statement))
        ? []
        : [{
            statement: compact(statement).slice(0, 240),
            reason: "Only enum/table/index creation, ADD COLUMN, ADD CONSTRAINT, COMMENT, or no-op SELECT 1 statements are permitted.",
          }];
    } catch (error) {
      return [{
        statement: compact(statement).slice(0, 240),
        reason: error instanceof Error ? error.message : "SQL could not be parsed safely.",
      }];
    }
  });
}
