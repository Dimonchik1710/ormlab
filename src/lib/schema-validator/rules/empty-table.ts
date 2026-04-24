import type { Issue, Rule } from "../types";

export const emptyTable: Rule = {
  id: "EmptyTable",
  description: "Table has no columns.",
  run(schema) {
    const issues: Issue[] = [];
    for (const t of schema.tables) {
      const columnCount = t.columns.filter(
        (c) => c.builderName !== "__tableHelper__",
      ).length;
      if (columnCount === 0) {
        issues.push({
          line: t.line,
          message: `Table "${t.tableName}" has no columns.`,
          severity: "warning",
          ruleId: "EmptyTable",
        });
      }
    }
    return issues;
  },
};
