// Supported Drizzle dialects — Prisma can target PostgreSQL, MySQL, SQLite
import type { Dialect } from "@/lib/shared/types";

// Alias kept for readability — DrizzleDialect === Dialect
export type DrizzleDialect = Dialect;

// A single field in a Prisma model
export interface PrismaField {
  name: string;                    // e.g. "email"
  type: string;                    // e.g. "String", "Int", "DateTime"
  isOptional: boolean;             // String? → true
  isList: boolean;                 // Post[] → true
  attributes: FieldAttribute[];    // @id, @unique, @default(...), etc.
}

// Attribute like @id, @unique, @default(now()), @map("email_address")
export interface FieldAttribute {
  name: string;                    // "id", "unique", "default", "map", etc.
  args: string[];                  // raw argument strings, e.g. ["now()"], ["\"users\""]
}

// A Prisma model = one table
export interface PrismaModel {
  name: string;                    // "User"
  mappedName?: string;             // @@map("users") → "users"
  fields: PrismaField[];
  blockAttributes: BlockAttribute[]; // @@id, @@unique, @@index, @@map
}

// Block attribute like @@id([col1, col2]) or @@index([email])
export interface BlockAttribute {
  name: string;                    // "id", "unique", "index", "map"
  args: string[];                  // raw argument strings
}

// A Prisma enum
export interface PrismaEnum {
  name: string;                    // "Role"
  values: string[];                // ["USER", "ADMIN", "GUEST"]
}

// Datasource declaration — tells us which SQL dialect to generate
export interface PrismaDatasource {
  provider: string;                // "postgresql", "mysql", "sqlite"
}

// Full parsed schema
export interface PrismaSchema {
  datasource?: PrismaDatasource;
  models: PrismaModel[];
  enums: PrismaEnum[];
}

// Result of parsing stage
export interface ParseResult {
  schema: PrismaSchema;
  errors: string[];
  warnings: string[];
}

// Final conversion result
export interface ConversionResult {
  success: boolean;
  drizzleCode?: string;
  errors: string[];
  warnings: string[];
}

// Options
export interface ConvertOptions {
  dialect: DrizzleDialect;         // can be forced, or auto-detected from datasource
  includeImports: boolean;
  includeRelations: boolean;
}