import type {
  ColumnDefinition,
  TableDefinition,
  SqlDialect,
} from "./types";

// Result of parsing stage (before Drizzle generation)
export interface ParseResult {
  tables: TableDefinition[];
  errors: string[];
  warnings: string[];
}

/**
 * Parse SQL input into a normalized list of tables.
 * Uses a simple regex-based approach — handles the common 90% of CREATE TABLE cases.
 */
export function parseSql(sql: string, _dialect: SqlDialect): ParseResult {
  const result: ParseResult = {
    tables: [],
    errors: [],
    warnings: [],
  };

  if (!sql.trim()) {
    result.errors.push("SQL input is empty");
    return result;
  }

  // Remove SQL comments (both -- single-line and /* multi-line */)
  const cleaned = sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  // Find all CREATE TABLE statements
  const tableStatements = extractCreateTableStatements(cleaned);

  if (tableStatements.length === 0) {
    result.errors.push(
      "No CREATE TABLE statements found. Make sure your SQL contains valid CREATE TABLE syntax."
    );
    return result;
  }

  for (const stmt of tableStatements) {
    const table = parseCreateTable(stmt, result);
    if (table) {
      result.tables.push(table);
    }
  }

  return result;
}

/**
 * Extract individual CREATE TABLE statements from SQL text.
 * Handles multiple statements separated by semicolons.
 */
function extractCreateTableStatements(sql: string): string[] {
  const statements: string[] = [];
  // Match: CREATE TABLE [IF NOT EXISTS] name ( ... );
  // The body is balanced parens — we track depth manually
  const regex = /create\s+table\s+(?:if\s+not\s+exists\s+)?[^(]+\(/gi;
  let match;

  while ((match = regex.exec(sql)) !== null) {
    const startIdx = match.index;
    const parenStart = match.index + match[0].length - 1; // position of opening (

    // Find matching closing paren
    let depth = 1;
    let i = parenStart + 1;
    while (i < sql.length && depth > 0) {
      const ch = sql[i];
      if (ch === "(") depth++;
      else if (ch === ")") depth--;
      i++;
    }

    if (depth === 0) {
      statements.push(sql.slice(startIdx, i));
    }
  }

  return statements;
}

/**
 * Parse a single CREATE TABLE statement into a TableDefinition.
 */
function parseCreateTable(
  stmt: string,
  result: ParseResult
): TableDefinition | null {
  // Extract table name: "CREATE TABLE [IF NOT EXISTS] name ("
  const nameMatch = stmt.match(
    /create\s+table\s+(?:if\s+not\s+exists\s+)?([`"]?)([a-zA-Z_][a-zA-Z0-9_]*)\1\s*\(/i
  );

  if (!nameMatch) {
    result.errors.push("Could not determine table name from CREATE TABLE");
    return null;
  }

  const tableName = nameMatch[2];

  // Extract body between outermost parens
  const bodyStart = stmt.indexOf("(");
  const bodyEnd = stmt.lastIndexOf(")");
  if (bodyStart < 0 || bodyEnd < 0 || bodyEnd <= bodyStart) {
    result.errors.push(`Malformed CREATE TABLE body for "${tableName}"`);
    return null;
  }
  const body = stmt.slice(bodyStart + 1, bodyEnd);

  // Split body by top-level commas (ignore commas inside parens)
  const parts = splitTopLevel(body);

  const columns: ColumnDefinition[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Table-level constraint: PRIMARY KEY (...), FOREIGN KEY (...), UNIQUE (...)
    if (/^(primary\s+key|foreign\s+key|unique|constraint|check)\b/i.test(trimmed)) {
      applyConstraint(trimmed, columns, result);
      continue;
    }

    // Regular column definition
    const col = parseColumn(trimmed, result);
    if (col) columns.push(col);
  }

  if (columns.length === 0) {
    result.warnings.push(`Table "${tableName}" has no columns`);
  }

  return { name: tableName, columns };
}

/**
 * Split a string by commas at depth 0 (ignoring commas inside parentheses).
 */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth--;

    if (ch === "," && depth === 0) {
      parts.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) parts.push(current);
  return parts;
}

/**
 * Parse a single column definition line.
 * Example: `email VARCHAR(255) NOT NULL UNIQUE DEFAULT 'anon'`
 */
function parseColumn(
  text: string,
  result: ParseResult
): ColumnDefinition | null {
  // First token: column name (may be quoted)
  const nameMatch = text.match(/^([`"]?)([a-zA-Z_][a-zA-Z0-9_]*)\1\s+/);
  if (!nameMatch) {
    result.warnings.push(`Skipped malformed column definition: "${text.slice(0, 40)}..."`);
    return null;
  }

  const name = nameMatch[2];
  const rest = text.slice(nameMatch[0].length);

  // Next: data type — possibly with params like VARCHAR(255) or NUMERIC(10, 2)
  const typeMatch = rest.match(/^([a-zA-Z_][a-zA-Z0-9_ ]*?)(?:\s*\(([^)]*)\))?(\s|$)/);
  if (!typeMatch) {
    result.warnings.push(`Column "${name}" has no data type, skipped`);
    return null;
  }

  const sqlType = typeMatch[1].trim().replace(/\s+/g, "_");
  const typeParams: number[] = [];
  if (typeMatch[2]) {
    for (const raw of typeMatch[2].split(",")) {
      const n = parseInt(raw.trim(), 10);
      if (!Number.isNaN(n)) typeParams.push(n);
    }
  }

  // Remaining text after type — contains constraints
  const constraints = rest.slice(typeMatch[0].length).trim();
  const upper = constraints.toUpperCase();

  // Detect constraints
  const primaryKey = /\bPRIMARY\s+KEY\b/.test(upper);
  const unique = /\bUNIQUE\b/.test(upper) && !primaryKey;
  const nullable = !/\bNOT\s+NULL\b/.test(upper);
  const autoIncrement =
    sqlType.toUpperCase() === "SERIAL" ||
    sqlType.toUpperCase() === "BIGSERIAL" ||
    /\bAUTO_INCREMENT\b/.test(upper) ||
    /\bGENERATED\s+(ALWAYS|BY\s+DEFAULT)\s+AS\s+IDENTITY\b/.test(upper);

  // DEFAULT value
  let defaultValue: string | undefined;
  const defaultMatch = constraints.match(/\bdefault\s+(.+?)(?=\s+(?:not\s+null|null|unique|primary\s+key|references|check|$))/i);
  if (defaultMatch) {
    defaultValue = parseDefaultValue(defaultMatch[1].trim());
  }

  // Inline REFERENCES (foreign key)
  let references: ColumnDefinition["references"] | undefined;
  const refMatch = constraints.match(
    /\breferences\s+([`"]?)([a-zA-Z_][a-zA-Z0-9_]*)\1\s*\(\s*([`"]?)([a-zA-Z_][a-zA-Z0-9_]*)\3\s*\)(?:\s+on\s+delete\s+([a-z\s]+?))?(?:\s+on\s+update|$|\s)/i
  );
  if (refMatch) {
    references = {
      table: refMatch[2],
      column: refMatch[4],
    };
    if (refMatch[5]) {
      references.onDelete = refMatch[5].trim().toLowerCase();
    }
  }

  return {
    name,
    sqlType,
    typeParams,
    nullable,
    primaryKey,
    unique,
    defaultValue,
    autoIncrement,
    references,
  };
}

/**
 * Apply a table-level constraint to the list of already-parsed columns.
 */
function applyConstraint(
  text: string,
  columns: ColumnDefinition[],
  result: ParseResult
): void {
  // PRIMARY KEY (col1, col2, ...)
  const pkMatch = text.match(/^primary\s+key\s*\(([^)]+)\)/i);
  if (pkMatch) {
    const cols = pkMatch[1].split(",").map((s) => s.trim().replace(/[`"]/g, ""));
    if (cols.length === 1) {
      const col = columns.find((c) => c.name === cols[0]);
      if (col) col.primaryKey = true;
    } else {
      result.warnings.push(
        `Composite primary key on (${cols.join(", ")}) — use Drizzle's primaryKey() in a table callback manually.`
      );
    }
    return;
  }

  // FOREIGN KEY (col) REFERENCES other(id) [ON DELETE ...]
  const fkMatch = text.match(
    /^foreign\s+key\s*\(([^)]+)\)\s*references\s+([`"]?)([a-zA-Z_][a-zA-Z0-9_]*)\2\s*\(([^)]+)\)(?:\s+on\s+delete\s+([a-z\s]+?))?(?:\s+on\s+update|$)/i
  );
  if (fkMatch) {
    const localCols = fkMatch[1].split(",").map((s) => s.trim().replace(/[`"]/g, ""));
    const refTable = fkMatch[3];
    const refCols = fkMatch[4].split(",").map((s) => s.trim().replace(/[`"]/g, ""));

    if (localCols.length === 1 && refCols.length === 1) {
      const col = columns.find((c) => c.name === localCols[0]);
      if (col) {
        col.references = {
          table: refTable,
          column: refCols[0],
        };
        if (fkMatch[5]) {
          col.references.onDelete = fkMatch[5].trim().toLowerCase();
        }
      }
    } else {
      result.warnings.push(
        `Composite foreign key on (${localCols.join(", ")}) → ${refTable}(${refCols.join(", ")}) — not fully supported, review output manually.`
      );
    }
    return;
  }

  // UNIQUE (col)
  const uniqueMatch = text.match(/^unique\s*\(([^)]+)\)/i);
  if (uniqueMatch) {
    const cols = uniqueMatch[1].split(",").map((s) => s.trim().replace(/[`"]/g, ""));
    if (cols.length === 1) {
      const col = columns.find((c) => c.name === cols[0]);
      if (col) col.unique = true;
    } else {
      result.warnings.push(
        `Composite unique constraint on (${cols.join(", ")}) — use Drizzle's uniqueIndex() manually.`
      );
    }
    return;
  }

  // CHECK constraints — not supported in MVP
  if (/^check\b/i.test(text)) {
    result.warnings.push("CHECK constraint found — not supported in MVP, skipped.");
    return;
  }

  // CONSTRAINT <name> ... — try to apply inner constraint
  const namedMatch = text.match(/^constraint\s+[`"]?[a-zA-Z_][a-zA-Z0-9_]*[`"]?\s+(.+)$/i);
  if (namedMatch) {
    applyConstraint(namedMatch[1], columns, result);
    return;
  }
}

/**
 * Convert a raw default value expression into a Drizzle-compatible string.
 */
function parseDefaultValue(raw: string): string {
  const v = raw.trim();

  // NULL
  if (/^null$/i.test(v)) return "null";

  // Boolean
  if (/^true$/i.test(v)) return "true";
  if (/^false$/i.test(v)) return "false";

  // Function calls: NOW(), CURRENT_TIMESTAMP, gen_random_uuid(), etc.
  if (/^(now|current_timestamp)\s*\(\s*\)?$/i.test(v)) {
    return "sql`now()`";
  }
  if (/^current_timestamp$/i.test(v)) {
    return "sql`now()`";
  }
  if (/^[a-z_][a-z0-9_]*\s*\(\s*\)$/i.test(v)) {
    return `sql\`${v.toLowerCase()}\``;
  }

  // String literal: 'foo'
  const strMatch = v.match(/^'(.*)'$/);
  if (strMatch) {
    return `"${strMatch[1].replace(/"/g, '\\"')}"`;
  }

  // Numeric
  if (/^-?\d+(\.\d+)?$/.test(v)) {
    return v;
  }

  // Anything else — wrap in sql`...`
  return `sql\`${v}\``;
}