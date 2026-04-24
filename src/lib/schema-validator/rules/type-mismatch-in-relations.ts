import type { Issue, ParsedColumn, ParsedTable, Rule } from "../types";

// Group integer-like builders as compatible with each other within the same
// family; but `text`/`varchar` are string and must not reference an integer PK.
const TYPE_FAMILIES: Record<string, string> = {
  // integer family (pg)
  serial: "int",
  bigserial: "bigint",
  smallserial: "smallint",
  integer: "int",
  int: "int",
  bigint: "bigint",
  smallint: "smallint",
  // mysql/sqlite int
  mysqlInt: "int",
  tinyint: "int",
  mediumint: "int",
  // text / string
  text: "text",
  varchar: "text",
  char: "text",
  mysqlVarchar: "text",
  mysqlText: "text",
  // uuid
  uuid: "uuid",
  // decimal
  decimal: "decimal",
  numeric: "decimal",
  real: "real",
  doublePrecision: "real",
  // boolean / date
  boolean: "boolean",
  date: "date",
  timestamp: "timestamp",
  time: "time",
  json: "json",
  jsonb: "json",
};

function familyOf(builderName: string): string {
  return TYPE_FAMILIES[builderName] ?? builderName;
}

function findColumn(
  table: ParsedTable,
  columnName: string,
): ParsedColumn | undefined {
  return table.columns.find(
    (c) => c.name === columnName && c.builderName !== "__tableHelper__",
  );
}

export const typeMismatchInRelations: Rule = {
  id: "TypeMismatchInRelations",
  description:
    "Foreign key column type must match the referenced column's type.",
  run(schema) {
    const issues: Issue[] = [];
    const tableByVar = new Map(schema.tables.map((t) => [t.variableName, t]));

    // Pattern: references(() => targetVar.targetColumn)
    const refRe =
      /references\s*\(\s*\(\s*\)\s*=>\s*([A-Za-z_$][\w$]*)\s*\.\s*([A-Za-z_$][\w$]*)/;

    for (const table of schema.tables) {
      for (const col of table.columns) {
        if (col.builderName === "__tableHelper__") continue;
        const m = col.chain.match(refRe);
        if (!m) continue;
        const [, targetVar, targetCol] = m;
        const target = tableByVar.get(targetVar);
        if (!target) {
          issues.push({
            line: col.line,
            message: `Relation in "${table.tableName}.${col.name}" references unknown table "${targetVar}".`,
            severity: "error",
            ruleId: "TypeMismatchInRelations",
          });
          continue;
        }
        const targetColumn = findColumn(target, targetCol);
        if (!targetColumn) {
          issues.push({
            line: col.line,
            message: `Relation in "${table.tableName}.${col.name}" references unknown column "${targetVar}.${targetCol}".`,
            severity: "error",
            ruleId: "TypeMismatchInRelations",
          });
          continue;
        }
        const fromFam = familyOf(col.builderName);
        const toFam = familyOf(targetColumn.builderName);
        if (fromFam !== toFam) {
          issues.push({
            line: col.line,
            message: `Type mismatch in relation: "${table.tableName}.${col.name}" is ${col.builderName}() but references "${target.tableName}.${targetColumn.name}" which is ${targetColumn.builderName}().`,
            severity: "error",
            ruleId: "TypeMismatchInRelations",
          });
        }
        if (table.dialect !== target.dialect) {
          issues.push({
            line: col.line,
            message: `Cross-dialect relation: "${table.tableName}" (${table.dialect}) references "${target.tableName}" (${target.dialect}).`,
            severity: "error",
            ruleId: "TypeMismatchInRelations",
          });
        }
      }
    }

    return issues;
  },
};
