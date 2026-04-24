import type { Issue, Rule } from "../types";

export const checkMissingPrimaryKey: Rule = {
  id: "CheckMissingPrimaryKey",
  description: "Every table should declare a primary key.",
  run(schema) {
    const issues: Issue[] = [];

    for (const table of schema.tables) {
      const hasColumnPK = table.columns.some(
        (c) =>
          c.builderName !== "__tableHelper__" &&
          /\.primaryKey\s*\(/.test(c.chain),
      );
      const hasCompositePK =
        table.columns.some(
          (c) =>
            c.builderName === "__tableHelper__" &&
            /^primaryKey\s*\(/.test(c.chain),
        ) || /primaryKey\s*\(/.test(table.extras);

      if (!hasColumnPK && !hasCompositePK) {
        issues.push({
          line: table.line,
          message: `Table "${table.tableName}" has no primary key. Add .primaryKey() to a column or use a composite primaryKey() helper.`,
          severity: "error",
          ruleId: "CheckMissingPrimaryKey",
        });
      }
    }

    return issues;
  },
};
