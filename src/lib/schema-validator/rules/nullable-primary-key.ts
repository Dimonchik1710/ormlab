import type { Issue, Rule } from "../types";

export const nullablePrimaryKey: Rule = {
  id: "NullablePrimaryKey",
  description: "Primary key columns should not be nullable.",
  run(schema) {
    const issues: Issue[] = [];
    for (const t of schema.tables) {
      for (const c of t.columns) {
        if (c.builderName === "__tableHelper__") continue;
        const isPK = /\.primaryKey\s*\(/.test(c.chain);
        if (!isPK) continue;
        const hasNotNull = /\.notNull\s*\(/.test(c.chain);
        // Drizzle treats primaryKey() as NOT NULL implicitly, so this is info-level.
        if (!hasNotNull) {
          issues.push({
            line: c.line,
            message: `Column "${t.tableName}.${c.name}" is a primary key — .notNull() is redundant but adding it makes intent explicit.`,
            severity: "info",
            ruleId: "NullablePrimaryKey",
          });
        }
      }
    }
    return issues;
  },
};
