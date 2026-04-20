import type { DrizzleDialect } from "./types";

/**
 * Result of mapping a Prisma type to a Drizzle column definition.
 * The `builder` is a stringified Drizzle function name like "text", "integer",
 * the `args` are extra args to that function (like `{ length: 255 }`),
 * and `imports` lists what we need to import from the Drizzle driver.
 */
export interface MappedType {
  builder: string;          // e.g. "text", "integer", "varchar"
  extraArgs?: string;       // e.g. '{ length: 255 }', '{ mode: "number" }'
  imports: string[];        // e.g. ["text"], ["varchar"]
  isEnumRef?: boolean;      // true if this is a reference to a user-defined enum
  warning?: string;         // optional warning to surface to the user
}

/**
 * Map a Prisma scalar type to a Drizzle column builder for the given dialect.
 *
 * Prisma scalars: String, Boolean, Int, BigInt, Float, Decimal, DateTime, Json, Bytes
 * Everything else is assumed to be a reference to a user-defined enum.
 */
export function mapPrismaType(
  prismaType: string,
  dialect: DrizzleDialect,
  knownEnums: Set<string>
): MappedType {
  // Check if it's a reference to a user-defined enum first
  if (knownEnums.has(prismaType)) {
    return {
      builder: toCamelCase(prismaType) + "Enum",
      imports: [],
      isEnumRef: true,
    };
  }

  if (dialect === "postgresql") {
    return mapPostgres(prismaType);
  }
  if (dialect === "mysql") {
    return mapMysql(prismaType);
  }
  return mapSqlite(prismaType);
}

// ===================== POSTGRESQL =====================

function mapPostgres(t: string): MappedType {
  switch (t) {
    case "String":
      return { builder: "text", imports: ["text"] };
    case "Boolean":
      return { builder: "boolean", imports: ["boolean"] };
    case "Int":
      return { builder: "integer", imports: ["integer"] };
    case "BigInt":
      return {
        builder: "bigint",
        extraArgs: '{ mode: "number" }',
        imports: ["bigint"],
      };
    case "Float":
      return { builder: "doublePrecision", imports: ["doublePrecision"] };
    case "Decimal":
      return {
        builder: "decimal",
        extraArgs: '{ precision: 65, scale: 30 }',
        imports: ["decimal"],
      };
    case "DateTime":
      return { builder: "timestamp", imports: ["timestamp"] };
    case "Json":
      return { builder: "jsonb", imports: ["jsonb"] };
    case "Bytes":
      // Drizzle doesn't have a first-class `bytea` helper — use customType
      return {
        builder: "text",
        imports: ["text"],
        warning:
          "Prisma `Bytes` has no direct Drizzle equivalent for PostgreSQL. Mapped to `text` — replace with a `customType` using bytea if needed.",
      };
    default:
      return {
        builder: "text",
        imports: ["text"],
        warning: `Unknown Prisma type "${t}" — mapped to text. Review manually.`,
      };
  }
}

// ===================== MYSQL =====================

function mapMysql(t: string): MappedType {
  switch (t) {
    case "String":
      return {
        builder: "varchar",
        extraArgs: "{ length: 255 }",
        imports: ["varchar"],
      };
    case "Boolean":
      return { builder: "boolean", imports: ["boolean"] };
    case "Int":
      return { builder: "int", imports: ["int"] };
    case "BigInt":
      return {
        builder: "bigint",
        extraArgs: '{ mode: "number" }',
        imports: ["bigint"],
      };
    case "Float":
      return { builder: "double", imports: ["double"] };
    case "Decimal":
      return {
        builder: "decimal",
        extraArgs: '{ precision: 65, scale: 30 }',
        imports: ["decimal"],
      };
    case "DateTime":
      return { builder: "datetime", imports: ["datetime"] };
    case "Json":
      return { builder: "json", imports: ["json"] };
    case "Bytes":
      return {
        builder: "varbinary",
        extraArgs: "{ length: 65535 }",
        imports: ["varbinary"],
      };
    default:
      return {
        builder: "varchar",
        extraArgs: "{ length: 255 }",
        imports: ["varchar"],
        warning: `Unknown Prisma type "${t}" — mapped to varchar. Review manually.`,
      };
  }
}

// ===================== SQLITE =====================

function mapSqlite(t: string): MappedType {
  switch (t) {
    case "String":
      return { builder: "text", imports: ["text"] };
    case "Boolean":
      return {
        builder: "integer",
        extraArgs: '{ mode: "boolean" }',
        imports: ["integer"],
      };
    case "Int":
      return { builder: "integer", imports: ["integer"] };
    case "BigInt":
      return { builder: "integer", imports: ["integer"] };
    case "Float":
      return { builder: "real", imports: ["real"] };
    case "Decimal":
      // SQLite has no native decimal — use numeric
      return {
        builder: "numeric",
        imports: ["numeric"],
        warning:
          "SQLite has no native Decimal type. Using `numeric` — precision is stored as text.",
      };
    case "DateTime":
      return {
        builder: "integer",
        extraArgs: '{ mode: "timestamp" }',
        imports: ["integer"],
      };
    case "Json":
      return {
        builder: "text",
        extraArgs: '{ mode: "json" }',
        imports: ["text"],
      };
    case "Bytes":
      return { builder: "blob", imports: ["blob"] };
    default:
      return {
        builder: "text",
        imports: ["text"],
        warning: `Unknown Prisma type "${t}" — mapped to text. Review manually.`,
      };
  }
}

/**
 * Converts "Role" -> "role", "UserRole" -> "userRole".
 * Used to generate enum variable names (pgEnum("Role", ...) → const role = ...).
 */
export function toCamelCase(s: string): string {
  if (!s) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/**
 * Gets the Drizzle table/column builder function name for the dialect.
 */
export function getTableBuilder(dialect: DrizzleDialect): string {
  if (dialect === "postgresql") return "pgTable";
  if (dialect === "mysql") return "mysqlTable";
  return "sqliteTable";
}

/**
 * Gets the enum builder name — only postgres has first-class pgEnum.
 */
export function getEnumBuilder(dialect: DrizzleDialect): string | null {
  if (dialect === "postgresql") return "pgEnum";
  // MySQL and SQLite don't have first-class enum — we return null and the
  // formatter will emit TypeScript string unions instead
  return null;
}

/**
 * Gets the Drizzle driver import path for the dialect.
 */
export function getDrizzleImportPath(dialect: DrizzleDialect): string {
  if (dialect === "postgresql") return "drizzle-orm/pg-core";
  if (dialect === "mysql") return "drizzle-orm/mysql-core";
  return "drizzle-orm/sqlite-core";
}