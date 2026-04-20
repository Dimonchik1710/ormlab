import type {
  PrismaSchema,
  PrismaModel,
  PrismaField,
  PrismaEnum,
  FieldAttribute,
  DrizzleDialect,
  ConversionResult,
} from "./types";
import {
  mapPrismaType,
  toCamelCase,
  getTableBuilder,
  getEnumBuilder,
  getDrizzleImportPath,
} from "./type-mapper";

/**
 * Convert a parsed PrismaSchema into a Drizzle TypeScript source string.
 */
export function formatDrizzleSchema(
  schema: PrismaSchema,
  dialect: DrizzleDialect
): ConversionResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const imports = new Set<string>();

  // Build a map of known enum names so type-mapper can recognize custom enum refs
  const knownEnums = new Set(schema.enums.map((e) => e.name));

  // ---- Generate enum declarations ----
  const enumBlocks: string[] = [];
  const enumBuilder = getEnumBuilder(dialect);

  for (const e of schema.enums) {
    if (enumBuilder) {
      // Postgres: pgEnum
      imports.add(enumBuilder);
      enumBlocks.push(formatEnum(e, enumBuilder));
    } else {
      // MySQL / SQLite: TypeScript string union (no runtime equivalent)
      enumBlocks.push(formatEnumAsUnion(e));
      warnings.push(
        `Enum "${e.name}" emitted as TypeScript union — ${dialect === "mysql" ? "MySQL" : "SQLite"} has no first-class enum. You may need to store values as strings and validate at app layer.`
      );
    }
  }

  // ---- Generate model (table) declarations ----
  const tableBuilder = getTableBuilder(dialect);
  imports.add(tableBuilder);

  const tableBlocks: string[] = [];

  for (const model of schema.models) {
    const result = formatModel(model, dialect, knownEnums, schema.models);
    tableBlocks.push(result.block);
    result.imports.forEach((imp) => imports.add(imp));
    result.warnings.forEach((w) => warnings.push(w));
  }

  // ---- Build import statement ----
  const importPath = getDrizzleImportPath(dialect);
  const sortedImports = Array.from(imports).sort();
  const importLine = `import { ${sortedImports.join(", ")} } from "${importPath}";`;

  // ---- Assemble final code ----
  const sections: string[] = [importLine, ""];
  if (enumBlocks.length > 0) {
    sections.push(...enumBlocks, "");
  }
  sections.push(...tableBlocks);

  const code = sections.join("\n").replace(/\n{3,}/g, "\n\n") + "\n";

  return {
    success: errors.length === 0,
    drizzleCode: code,
    errors,
    warnings,
  };
}

// ===================== ENUM FORMATTING =====================

function formatEnum(e: PrismaEnum, builder: string): string {
  const varName = toCamelCase(e.name) + "Enum";
  const values = e.values.map((v) => `"${v}"`).join(", ");
  return `export const ${varName} = ${builder}("${e.name}", [${values}]);`;
}

function formatEnumAsUnion(e: PrismaEnum): string {
  const values = e.values.map((v) => `"${v}"`).join(" | ");
  return `export type ${e.name} = ${values};`;
}

// ===================== MODEL FORMATTING =====================

interface ModelFormatResult {
  block: string;
  imports: string[];
  warnings: string[];
}

function formatModel(
  model: PrismaModel,
  dialect: DrizzleDialect,
  knownEnums: Set<string>,
  allModels: PrismaModel[]
): ModelFormatResult {
  const tableBuilder = getTableBuilder(dialect);
  const imports: string[] = [];
  const warnings: string[] = [];

  const varName = toCamelCase(model.name);
  const tableName = model.mappedName ?? model.name;

  const fieldLines: string[] = [];

  for (const field of model.fields) {
    // Skip list-of-models (e.g. posts Post[]) — these are Prisma backrefs
    if (field.isList && isModelReference(field.type, allModels)) {
      continue;
    }
    // Skip singular relations to other models without @relation (implicit side)
    if (isModelReference(field.type, allModels) && !hasRelationAttribute(field)) {
      continue;
    }

    const result = formatField(field, dialect, knownEnums, allModels);
    if (result) {
      fieldLines.push(`  ${field.name}: ${result.expression},`);
      result.imports.forEach((imp) => imports.push(imp));
      result.warnings.forEach((w) => warnings.push(w));
    }
  }

  // Handle composite primary key / unique / index warnings
  for (const blockAttr of model.blockAttributes) {
    if (blockAttr.name === "id") {
      warnings.push(
        `Model "${model.name}" has composite @@id — not fully auto-translated. Add a manual primaryKey() using Drizzle's primaryKey() helper.`
      );
    } else if (blockAttr.name === "unique") {
      warnings.push(
        `Model "${model.name}" has composite @@unique — add a manual unique() index using Drizzle's unique() helper.`
      );
    } else if (blockAttr.name === "index") {
      warnings.push(
        `Model "${model.name}" has @@index — Drizzle indexes require a second callback argument on the table. Add manually.`
      );
    }
  }

  const block = `export const ${varName} = ${tableBuilder}("${tableName}", {\n${fieldLines.join("\n")}\n});`;

  return { block, imports, warnings };
}

// ===================== FIELD FORMATTING =====================

interface FieldFormatResult {
  expression: string;
  imports: string[];
  warnings: string[];
}

function formatField(
  field: PrismaField,
  dialect: DrizzleDialect,
  knownEnums: Set<string>,
  allModels: PrismaModel[]
): FieldFormatResult | null {
  const imports: string[] = [];
  const warnings: string[] = [];

  // Detect special case: @id + @default(autoincrement()) → serial/primaryKey helper
  const isAutoIncrement = field.attributes.some(
    (a) => a.name === "default" && a.args[0]?.replace(/\s/g, "") === "autoincrement()"
  );
  const isId = field.attributes.some((a) => a.name === "id");

  if (isAutoIncrement && isId && (field.type === "Int" || field.type === "BigInt")) {
    // Postgres: serial; MySQL: int with autoincrement; SQLite: integer primaryKey
    if (dialect === "postgresql") {
      imports.push("serial");
      let expr = `serial("${getMappedFieldName(field)}").primaryKey()`;
      return { expression: expr, imports, warnings };
    }
    if (dialect === "mysql") {
      imports.push("int");
      let expr = `int("${getMappedFieldName(field)}").autoincrement().primaryKey()`;
      return { expression: expr, imports, warnings };
    }
    // SQLite
    imports.push("integer");
    const expr = `integer("${getMappedFieldName(field)}", { mode: "number" }).primaryKey({ autoIncrement: true })`;
    return { expression: expr, imports, warnings };
  }

  // Normal mapping
  const mapped = mapPrismaType(field.type, dialect, knownEnums);
  if (mapped.warning) warnings.push(`Field "${field.name}": ${mapped.warning}`);

  for (const imp of mapped.imports) imports.push(imp);

  const mappedColName = getMappedFieldName(field);

  // Compose the builder call
  let expression: string;
  if (mapped.isEnumRef) {
    expression = `${mapped.builder}("${mappedColName}")`;
  } else if (mapped.extraArgs) {
    expression = `${mapped.builder}("${mappedColName}", ${mapped.extraArgs})`;
  } else {
    expression = `${mapped.builder}("${mappedColName}")`;
  }

  // Build the chain: .notNull() / .unique() / .primaryKey() / .default(...) / .references(...)
  // Order is based on Drizzle convention
  if (isId && !isAutoIncrement) {
    expression += ".primaryKey()";
  }
  if (!field.isOptional && !field.isList) {
    expression += ".notNull()";
  }
  if (field.attributes.some((a) => a.name === "unique")) {
    expression += ".unique()";
  }

  // @default handling
  const defaultAttr = field.attributes.find((a) => a.name === "default");
  if (defaultAttr && !isAutoIncrement) {
    const defaultExpr = formatDefault(defaultAttr, field, knownEnums);
    if (defaultExpr) expression += defaultExpr;
  }

  // @updatedAt — no direct Drizzle equivalent
  if (field.attributes.some((a) => a.name === "updatedAt")) {
    warnings.push(
      `Field "${field.name}" uses @updatedAt — Drizzle has no direct equivalent. Use .$onUpdate(() => new Date()) manually or configure at DB trigger level.`
    );
  }

  // @relation handling
  const relationAttr = field.attributes.find((a) => a.name === "relation");
  if (relationAttr) {
    // Extract "fields" and "references" from the relation args string
    const rel = parseRelationArgs(relationAttr.args.join(","));
    if (rel.fields.length > 0 && rel.references.length > 0) {
      // This field itself is the relation object (like `author User`)
      // — but in Drizzle, the FK lives on the actual FK column (authorId).
      // So we emit nothing here; the FK column handles .references().
      // Return null to skip this field entirely.
      return null;
    }
  }

  // Check if this field is an FK column for any relation in this model
  const relationInfo = findRelationForFkField(field, allModels);
  if (relationInfo) {
    const targetModel = relationInfo.targetModel;
    const targetVar = toCamelCase(targetModel);
    const targetField = relationInfo.targetField;
    let refChain = `.references(() => ${targetVar}.${targetField}`;
    if (relationInfo.onDelete) {
      refChain += `, { onDelete: "${relationInfo.onDelete}" }`;
    }
    refChain += ")";
    expression += refChain;
  }

  return { expression, imports, warnings };
}

// ===================== HELPERS =====================

function getMappedFieldName(field: PrismaField): string {
  const mapAttr = field.attributes.find((a) => a.name === "map");
  if (mapAttr && mapAttr.args[0]) {
    return stripQuotes(mapAttr.args[0]);
  }
  return field.name;
}

function formatDefault(
  attr: FieldAttribute,
  field: PrismaField,
  knownEnums: Set<string>
): string | null {
  const raw = attr.args[0];
  if (!raw) return null;

  const trimmed = raw.trim();

  // Prisma function defaults
  if (trimmed === "now()") return ".defaultNow()";
  if (trimmed === "autoincrement()") return ""; // handled elsewhere
  if (trimmed === "cuid()" || trimmed === "uuid()") return ""; // skip, Drizzle needs a manual default fn
  if (trimmed === "dbgenerated()") return "";

  // String default
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return `.default(${trimmed})`;
  }

  // Numeric default
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return `.default(${trimmed})`;
  }

  // Boolean default
  if (trimmed === "true" || trimmed === "false") {
    return `.default(${trimmed})`;
  }

  // Enum value default (e.g. @default(USER) when field type is an enum)
  if (knownEnums.has(field.type)) {
    return `.default("${trimmed}")`;
  }

  // Array / object default — emit as-is
  return `.default(${trimmed})`;
}

function stripQuotes(s: string): string {
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  return s;
}

function isModelReference(type: string, allModels: PrismaModel[]): boolean {
  return allModels.some((m) => m.name === type);
}

function hasRelationAttribute(field: PrismaField): boolean {
  return field.attributes.some((a) => a.name === "relation");
}

interface RelationInfo {
  targetModel: string;
  targetField: string;
  onDelete?: string;
}

/**
 * Given a field like `authorId Int`, check whether any other field in the same
 * model (or any model) has @relation(fields: [authorId], references: [id]) that
 * points to this field.
 */
function findRelationForFkField(
  fkField: PrismaField,
  allModels: PrismaModel[]
): RelationInfo | null {
  for (const model of allModels) {
    for (const field of model.fields) {
      const relAttr = field.attributes.find((a) => a.name === "relation");
      if (!relAttr) continue;
      const rel = parseRelationArgs(relAttr.args.join(","));
      if (rel.fields.includes(fkField.name)) {
        const idx = rel.fields.indexOf(fkField.name);
        const targetField = rel.references[idx] ?? rel.references[0] ?? "id";
        return {
          targetModel: field.type,
          targetField,
          onDelete: rel.onDelete,
        };
      }
    }
  }
  return null;
}

/**
 * Parse the raw args of an @relation(...) attribute into structured info.
 * Example input: `fields:[authorId],references:[id],onDelete:Cascade`
 */
function parseRelationArgs(raw: string): {
  fields: string[];
  references: string[];
  onDelete?: string;
} {
  const result = { fields: [] as string[], references: [] as string[], onDelete: undefined as string | undefined };

  const fieldsMatch = raw.match(/fields\s*:\s*\[([^\]]+)\]/);
  if (fieldsMatch) {
    result.fields = fieldsMatch[1].split(",").map((s) => s.trim());
  }

  const refsMatch = raw.match(/references\s*:\s*\[([^\]]+)\]/);
  if (refsMatch) {
    result.references = refsMatch[1].split(",").map((s) => s.trim());
  }

  const onDeleteMatch = raw.match(/onDelete\s*:\s*(\w+)/);
  if (onDeleteMatch) {
    const action = onDeleteMatch[1].toLowerCase();
    if (["cascade", "restrict", "setnull", "setdefault", "noaction"].includes(action)) {
      // Normalize to Drizzle format: "cascade" | "restrict" | "set null" | "set default" | "no action"
      const normalized: Record<string, string> = {
        cascade: "cascade",
        restrict: "restrict",
        setnull: "set null",
        setdefault: "set default",
        noaction: "no action",
      };
      result.onDelete = normalized[action];
    }
  }

  return result;
}