import type { Dialect } from "@/lib/shared/types";

export interface TypeRow {
  name: string;
  drizzle: string;
  sql: string;
  tsType: string;
  category: "numeric" | "string" | "boolean" | "datetime" | "json" | "binary" | "uuid" | "enum" | "other";
  notes?: string;
}

const postgresql: TypeRow[] = [
  { name: "integer", drizzle: 'integer("col")', sql: "INTEGER", tsType: "number", category: "numeric" },
  { name: "smallint", drizzle: 'smallint("col")', sql: "SMALLINT", tsType: "number", category: "numeric" },
  { name: "bigint", drizzle: 'bigint("col", { mode: "number" })', sql: "BIGINT", tsType: "number | bigint", category: "numeric", notes: 'mode: "bigint" yields bigint' },
  { name: "serial", drizzle: 'serial("col")', sql: "SERIAL", tsType: "number", category: "numeric", notes: "Auto-increment primary key" },
  { name: "bigserial", drizzle: 'bigserial("col", { mode: "number" })', sql: "BIGSERIAL", tsType: "number | bigint", category: "numeric" },
  { name: "smallserial", drizzle: 'smallserial("col")', sql: "SMALLSERIAL", tsType: "number", category: "numeric" },
  { name: "numeric", drizzle: 'numeric("col", { precision: 10, scale: 2 })', sql: "NUMERIC(p,s)", tsType: "string", category: "numeric", notes: "Returned as string to preserve precision" },
  { name: "decimal", drizzle: 'decimal("col", { precision: 10, scale: 2 })', sql: "DECIMAL(p,s)", tsType: "string", category: "numeric" },
  { name: "real", drizzle: 'real("col")', sql: "REAL", tsType: "number", category: "numeric" },
  { name: "doublePrecision", drizzle: 'doublePrecision("col")', sql: "DOUBLE PRECISION", tsType: "number", category: "numeric" },
  { name: "boolean", drizzle: 'boolean("col")', sql: "BOOLEAN", tsType: "boolean", category: "boolean" },
  { name: "text", drizzle: 'text("col")', sql: "TEXT", tsType: "string", category: "string" },
  { name: "varchar", drizzle: 'varchar("col", { length: 255 })', sql: "VARCHAR(n)", tsType: "string", category: "string" },
  { name: "char", drizzle: 'char("col", { length: 2 })', sql: "CHAR(n)", tsType: "string", category: "string" },
  { name: "uuid", drizzle: 'uuid("col").defaultRandom()', sql: "UUID", tsType: "string", category: "uuid" },
  { name: "date", drizzle: 'date("col")', sql: "DATE", tsType: "string", category: "datetime", notes: 'Use mode: "date" for JS Date' },
  { name: "time", drizzle: 'time("col")', sql: "TIME", tsType: "string", category: "datetime" },
  { name: "timestamp", drizzle: 'timestamp("col")', sql: "TIMESTAMP", tsType: "Date", category: "datetime" },
  { name: "timestamp w/ tz", drizzle: 'timestamp("col", { withTimezone: true })', sql: "TIMESTAMPTZ", tsType: "Date", category: "datetime" },
  { name: "interval", drizzle: 'interval("col")', sql: "INTERVAL", tsType: "string", category: "datetime" },
  { name: "json", drizzle: 'json("col").$type<MyShape>()', sql: "JSON", tsType: "unknown (typed via $type)", category: "json" },
  { name: "jsonb", drizzle: 'jsonb("col").$type<MyShape>()', sql: "JSONB", tsType: "unknown (typed via $type)", category: "json" },
  { name: "bytea", drizzle: 'bytea("col")', sql: "BYTEA", tsType: "Buffer", category: "binary" },
  { name: "pgEnum", drizzle: 'pgEnum("role", ["admin", "user"])', sql: "CREATE TYPE ... AS ENUM", tsType: "union of literals", category: "enum", notes: "Declared outside pgTable" },
  { name: "array", drizzle: 'integer("col").array()', sql: "INTEGER[]", tsType: "number[]", category: "other" },
];

const mysql: TypeRow[] = [
  { name: "int", drizzle: 'int("col")', sql: "INT", tsType: "number", category: "numeric" },
  { name: "tinyint", drizzle: 'tinyint("col")', sql: "TINYINT", tsType: "number", category: "numeric" },
  { name: "smallint", drizzle: 'smallint("col")', sql: "SMALLINT", tsType: "number", category: "numeric" },
  { name: "mediumint", drizzle: 'mediumint("col")', sql: "MEDIUMINT", tsType: "number", category: "numeric" },
  { name: "bigint", drizzle: 'bigint("col", { mode: "number" })', sql: "BIGINT", tsType: "number | bigint", category: "numeric" },
  { name: "serial", drizzle: 'serial("col")', sql: "SERIAL (BIGINT UNSIGNED AUTO_INCREMENT)", tsType: "number", category: "numeric" },
  { name: "float", drizzle: 'float("col")', sql: "FLOAT", tsType: "number", category: "numeric" },
  { name: "double", drizzle: 'double("col")', sql: "DOUBLE", tsType: "number", category: "numeric" },
  { name: "decimal", drizzle: 'decimal("col", { precision: 10, scale: 2 })', sql: "DECIMAL(p,s)", tsType: "string", category: "numeric" },
  { name: "real", drizzle: 'real("col")', sql: "REAL", tsType: "number", category: "numeric" },
  { name: "boolean", drizzle: 'boolean("col")', sql: "TINYINT(1)", tsType: "boolean", category: "boolean", notes: "Stored as TINYINT(1)" },
  { name: "text", drizzle: 'text("col")', sql: "TEXT", tsType: "string", category: "string" },
  { name: "tinytext", drizzle: 'tinytext("col")', sql: "TINYTEXT", tsType: "string", category: "string" },
  { name: "mediumtext", drizzle: 'mediumtext("col")', sql: "MEDIUMTEXT", tsType: "string", category: "string" },
  { name: "longtext", drizzle: 'longtext("col")', sql: "LONGTEXT", tsType: "string", category: "string" },
  { name: "varchar", drizzle: 'varchar("col", { length: 255 })', sql: "VARCHAR(n)", tsType: "string", category: "string" },
  { name: "char", drizzle: 'char("col", { length: 2 })', sql: "CHAR(n)", tsType: "string", category: "string" },
  { name: "binary", drizzle: 'binary("col", { length: 16 })', sql: "BINARY(n)", tsType: "string", category: "binary" },
  { name: "varbinary", drizzle: 'varbinary("col", { length: 255 })', sql: "VARBINARY(n)", tsType: "string", category: "binary" },
  { name: "date", drizzle: 'date("col")', sql: "DATE", tsType: "Date", category: "datetime" },
  { name: "datetime", drizzle: 'datetime("col")', sql: "DATETIME", tsType: "Date", category: "datetime" },
  { name: "timestamp", drizzle: 'timestamp("col")', sql: "TIMESTAMP", tsType: "Date", category: "datetime" },
  { name: "time", drizzle: 'time("col")', sql: "TIME", tsType: "string", category: "datetime" },
  { name: "year", drizzle: 'year("col")', sql: "YEAR", tsType: "string", category: "datetime" },
  { name: "json", drizzle: 'json("col").$type<MyShape>()', sql: "JSON", tsType: "unknown (typed via $type)", category: "json" },
  { name: "mysqlEnum", drizzle: 'mysqlEnum("col", ["a", "b"])', sql: "ENUM('a','b')", tsType: "union of literals", category: "enum" },
];

const sqlite: TypeRow[] = [
  { name: "integer", drizzle: 'integer("col")', sql: "INTEGER", tsType: "number", category: "numeric" },
  { name: "integer (boolean)", drizzle: 'integer("col", { mode: "boolean" })', sql: "INTEGER", tsType: "boolean", category: "boolean", notes: "0/1 stored in INTEGER" },
  { name: "integer (timestamp)", drizzle: 'integer("col", { mode: "timestamp" })', sql: "INTEGER", tsType: "Date", category: "datetime", notes: "Unix seconds stored in INTEGER" },
  { name: "integer (timestamp_ms)", drizzle: 'integer("col", { mode: "timestamp_ms" })', sql: "INTEGER", tsType: "Date", category: "datetime" },
  { name: "integer (bigint)", drizzle: 'integer("col", { mode: "bigint" })', sql: "INTEGER", tsType: "bigint", category: "numeric" },
  { name: "real", drizzle: 'real("col")', sql: "REAL", tsType: "number", category: "numeric" },
  { name: "numeric", drizzle: 'numeric("col")', sql: "NUMERIC", tsType: "string", category: "numeric" },
  { name: "text", drizzle: 'text("col")', sql: "TEXT", tsType: "string", category: "string" },
  { name: "text (enum)", drizzle: 'text("col", { enum: ["a", "b"] })', sql: "TEXT", tsType: "union of literals", category: "enum" },
  { name: "text (json)", drizzle: 'text("col", { mode: "json" }).$type<MyShape>()', sql: "TEXT", tsType: "unknown (typed via $type)", category: "json", notes: "Serialized as JSON string" },
  { name: "blob", drizzle: 'blob("col")', sql: "BLOB", tsType: "Buffer", category: "binary" },
  { name: "blob (bigint)", drizzle: 'blob("col", { mode: "bigint" })', sql: "BLOB", tsType: "bigint", category: "numeric" },
  { name: "blob (json)", drizzle: 'blob("col", { mode: "json" }).$type<MyShape>()', sql: "BLOB", tsType: "unknown (typed via $type)", category: "json" },
];

export const TYPE_DATA: Record<Dialect, TypeRow[]> = {
  postgresql,
  mysql,
  sqlite,
};

export const DIALECT_META: Record<Dialect, { label: string; importPath: string }> = {
  postgresql: { label: "PostgreSQL", importPath: "drizzle-orm/pg-core" },
  mysql: { label: "MySQL", importPath: "drizzle-orm/mysql-core" },
  sqlite: { label: "SQLite", importPath: "drizzle-orm/sqlite-core" },
};
