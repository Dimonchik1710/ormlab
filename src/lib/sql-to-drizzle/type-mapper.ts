import type { SqlDialect } from "./types";

// Mapping of SQL types to Drizzle functions.
// Each entry returns a Drizzle code snippet for given column.
// Example: { sqlType: "VARCHAR", params: [255], columnName: "email" }
// → `varchar("email", { length: 255 })`

type TypeMapper = (
  columnName: string,
  typeParams: number[]
) => { drizzleType: string; import: string };

// ============ POSTGRESQL ============

const POSTGRES_TYPES: Record<string, TypeMapper> = {
  // Integer types
  SMALLINT: (col) => ({
    drizzleType: `smallint("${col}")`,
    import: "smallint",
  }),
  INTEGER: (col) => ({
    drizzleType: `integer("${col}")`,
    import: "integer",
  }),
  INT: (col) => ({
    drizzleType: `integer("${col}")`,
    import: "integer",
  }),
  BIGINT: (col) => ({
    drizzleType: `bigint("${col}", { mode: "number" })`,
    import: "bigint",
  }),
  SERIAL: (col) => ({
    drizzleType: `serial("${col}")`,
    import: "serial",
  }),
  BIGSERIAL: (col) => ({
    drizzleType: `bigserial("${col}", { mode: "number" })`,
    import: "bigserial",
  }),

  // String types
  VARCHAR: (col, params) => {
    const length = params[0];
    if (length) {
      return {
        drizzleType: `varchar("${col}", { length: ${length} })`,
        import: "varchar",
      };
    }
    return {
      drizzleType: `varchar("${col}")`,
      import: "varchar",
    };
  },
  CHARACTER_VARYING: (col, params) => {
    const length = params[0];
    return {
      drizzleType: length
        ? `varchar("${col}", { length: ${length} })`
        : `varchar("${col}")`,
      import: "varchar",
    };
  },
  CHAR: (col, params) => {
    const length = params[0];
    return {
      drizzleType: length
        ? `char("${col}", { length: ${length} })`
        : `char("${col}")`,
      import: "char",
    };
  },
  TEXT: (col) => ({
    drizzleType: `text("${col}")`,
    import: "text",
  }),

  // Boolean
  BOOLEAN: (col) => ({
    drizzleType: `boolean("${col}")`,
    import: "boolean",
  }),
  BOOL: (col) => ({
    drizzleType: `boolean("${col}")`,
    import: "boolean",
  }),

  // Date/Time
  TIMESTAMP: (col) => ({
    drizzleType: `timestamp("${col}")`,
    import: "timestamp",
  }),
  TIMESTAMPTZ: (col) => ({
    drizzleType: `timestamp("${col}", { withTimezone: true })`,
    import: "timestamp",
  }),
  DATE: (col) => ({
    drizzleType: `date("${col}")`,
    import: "date",
  }),
  TIME: (col) => ({
    drizzleType: `time("${col}")`,
    import: "time",
  }),

  // Numeric
  NUMERIC: (col, params) => {
    const [precision, scale] = params;
    if (precision && scale !== undefined) {
      return {
        drizzleType: `numeric("${col}", { precision: ${precision}, scale: ${scale} })`,
        import: "numeric",
      };
    }
    return {
      drizzleType: `numeric("${col}")`,
      import: "numeric",
    };
  },
  DECIMAL: (col, params) => {
    const [precision, scale] = params;
    if (precision && scale !== undefined) {
      return {
        drizzleType: `decimal("${col}", { precision: ${precision}, scale: ${scale} })`,
        import: "decimal",
      };
    }
    return {
      drizzleType: `decimal("${col}")`,
      import: "decimal",
    };
  },
  REAL: (col) => ({
    drizzleType: `real("${col}")`,
    import: "real",
  }),
  DOUBLE_PRECISION: (col) => ({
    drizzleType: `doublePrecision("${col}")`,
    import: "doublePrecision",
  }),

  // JSON
  JSON: (col) => ({
    drizzleType: `json("${col}")`,
    import: "json",
  }),
  JSONB: (col) => ({
    drizzleType: `jsonb("${col}")`,
    import: "jsonb",
  }),

  // UUID
  UUID: (col) => ({
    drizzleType: `uuid("${col}")`,
    import: "uuid",
  }),
};

// Main mapping function
export function mapSqlTypeToDrizzle(
  sqlType: string,
  columnName: string,
  typeParams: number[],
  dialect: SqlDialect
): { drizzleType: string; import: string } | null {
  // Normalize type name: uppercase, replace spaces with underscores
  const normalized = sqlType.toUpperCase().replace(/\s+/g, "_");

  if (dialect === "postgresql") {
    const mapper = POSTGRES_TYPES[normalized];
    if (mapper) {
      return mapper(columnName, typeParams);
    }
  }

  // MySQL and SQLite will be added later
  // For unknown types, return null — caller will add warning
  return null;
}

// Used by formatter.ts to generate import statement
export function getDrizzleImportPath(dialect: SqlDialect): string {
  switch (dialect) {
    case "postgresql":
      return "drizzle-orm/pg-core";
    case "mysql":
      return "drizzle-orm/mysql-core";
    case "sqlite":
      return "drizzle-orm/sqlite-core";
  }
}

// Helper: which builder function corresponds to dialect
export function getTableBuilderName(dialect: SqlDialect): string {
  switch (dialect) {
    case "postgresql":
      return "pgTable";
    case "mysql":
      return "mysqlTable";
    case "sqlite":
      return "sqliteTable";
  }
}