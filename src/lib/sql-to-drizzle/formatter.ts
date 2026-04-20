import type {
  ColumnDefinition,
  TableDefinition,
  ConvertOptions,
  SqlDialect,
} from "./types";
import {
  mapSqlTypeToDrizzle,
  getDrizzleImportPath,
  getTableBuilderName,
} from "./type-mapper";

/**
 * Generate a complete Drizzle schema file from parsed tables.
 * Returns { code, warnings } — warnings are types we couldn't map.
 */
export function formatDrizzleSchema(
  tables: TableDefinition[],
  options: ConvertOptions
): { code: string; warnings: string[] } {
  const warnings: string[] = [];
  const usedImports = new Set<string>();
  const usesSql = { flag: false }; // whether we need `import { sql }`

  // Generate each table's code
  const tableBlocks: string[] = [];

  for (const table of tables) {
    const block = formatTable(table, options, usedImports, usesSql, warnings);
    tableBlocks.push(block);
  }

  // Build imports section
  const imports = buildImports(
    options.dialect,
    usedImports,
    usesSql.flag
  );

  const code = [imports, "", ...tableBlocks].join("\n");

  return { code, warnings };
}

/**
 * Format a single table as a pgTable/mysqlTable/sqliteTable declaration.
 */
function formatTable(
  table: TableDefinition,
  options: ConvertOptions,
  usedImports: Set<string>,
  usesSql: { flag: boolean },
  warnings: string[]
): string {
  const tableBuilder = getTableBuilderName(options.dialect);
  usedImports.add(tableBuilder);

  const varName = toCamelCase(table.name);

  const columnLines: string[] = [];

  for (const col of table.columns) {
    const line = formatColumn(col, options, usedImports, usesSql, warnings);
    if (line) columnLines.push(`  ${line},`);
  }

  return (
    `export const ${varName} = ${tableBuilder}("${table.name}", {\n` +
    columnLines.join("\n") +
    `\n});`
  );
}

/**
 * Format a single column as a Drizzle column definition line.
 * Example: `email: varchar("email", { length: 255 }).notNull().unique()`
 */
function formatColumn(
  col: ColumnDefinition,
  options: ConvertOptions,
  usedImports: Set<string>,
  usesSql: { flag: boolean },
  warnings: string[]
): string | null {
  const mapped = mapSqlTypeToDrizzle(
    col.sqlType,
    col.name,
    col.typeParams ?? [],
    options.dialect
  );

  if (!mapped) {
    warnings.push(
      `Unknown SQL type "${col.sqlType}" on column "${col.name}" — fell back to text()`
    );
    // Fallback: use text() so output is still valid
    usedImports.add("text");
    return `${toCamelCase(col.name)}: text("${col.name}")${buildModifiers(col, usesSql)}`;
  }

  usedImports.add(mapped.import);

  const fieldName = toCamelCase(col.name);
  const modifiers = buildModifiers(col, usesSql);

  // FOREIGN KEY — only if enabled in options
  let referencesChain = "";
  if (options.includeRelations && col.references) {
    const targetTable = toCamelCase(col.references.table);
    const targetColumn = toCamelCase(col.references.column);
    referencesChain = `.references(() => ${targetTable}.${targetColumn}`;
    if (col.references.onDelete) {
      const action = normalizeOnDelete(col.references.onDelete);
      referencesChain += `, { onDelete: "${action}" }`;
    }
    referencesChain += `)`;
  }

  return `${fieldName}: ${mapped.drizzleType}${modifiers}${referencesChain}`;
}

/**
 * Build the chain of .notNull() .primaryKey() .unique() .default() etc.
 */
function buildModifiers(
  col: ColumnDefinition,
  usesSql: { flag: boolean }
): string {
  const parts: string[] = [];

  if (!col.nullable) parts.push(".notNull()");
  if (col.primaryKey) parts.push(".primaryKey()");
  if (col.unique && !col.primaryKey) parts.push(".unique()");

  if (col.defaultValue !== undefined) {
    // Check if it uses sql`...` syntax — we need to import sql
    if (col.defaultValue.startsWith("sql`")) {
      usesSql.flag = true;
      parts.push(`.default(${col.defaultValue})`);
    } else {
      parts.push(`.default(${col.defaultValue})`);
    }
  }

  return parts.join("");
}

/**
 * Build the imports block at the top of the generated file.
 */
function buildImports(
  dialect: SqlDialect,
  usedImports: Set<string>,
  needsSql: boolean
): string {
  const path = getDrizzleImportPath(dialect);
  const sorted = Array.from(usedImports).sort();

  const lines: string[] = [];
  lines.push(`import { ${sorted.join(", ")} } from "${path}";`);
  if (needsSql) {
    lines.push(`import { sql } from "drizzle-orm";`);
  }

  return lines.join("\n");
}

/**
 * Convert snake_case or kebab-case column/table name to camelCase variable name.
 * Example: "user_id" → "userId", "created-at" → "createdAt"
 */
function toCamelCase(name: string): string {
  return name.replace(/[_-](\w)/g, (_, c) => c.toUpperCase());
}

/**
 * Normalize SQL ON DELETE action to Drizzle format.
 * Example: "CASCADE" → "cascade", "SET NULL" → "set null"
 */
function normalizeOnDelete(action: string): string {
  const a = action.toLowerCase().trim();
  const valid = ["cascade", "restrict", "no action", "set null", "set default"];
  if (valid.includes(a)) return a;
  return "no action";
}