import type { Issue, Rule } from "../types";

export const duplicateTableName: Rule = {
  id: "DuplicateTableName",
  description: "Two tables share the same SQL name.",
  run(schema) {
    const issues: Issue[] = [];
    const seen = new Map<string, number>();
    for (const t of schema.tables) {
      const prev = seen.get(t.tableName);
      if (prev !== undefined) {
        issues.push({
          line: t.line,
          message: `Duplicate table name "${t.tableName}" — already declared on line ${prev}.`,
          severity: "error",
          ruleId: "DuplicateTableName",
        });
      } else {
        seen.set(t.tableName, t.line);
      }
    }
    return issues;
  },
};

export const duplicateColumnName: Rule = {
  id: "DuplicateColumnName",
  description: "Two columns in the same table share the same name.",
  run(schema) {
    const issues: Issue[] = [];
    for (const t of schema.tables) {
      const seen = new Map<string, number>();
      for (const c of t.columns) {
        if (c.builderName === "__tableHelper__") continue;
        const prev = seen.get(c.name);
        if (prev !== undefined) {
          issues.push({
            line: c.line,
            message: `Duplicate column "${c.name}" in table "${t.tableName}" (first declared on line ${prev}).`,
            severity: "error",
            ruleId: "DuplicateColumnName",
          });
        } else {
          seen.set(c.name, c.line);
        }
      }
    }
    return issues;
  },
};
