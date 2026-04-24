import type { Issue, Rule } from "../types";

export const mixedDialects: Rule = {
  id: "MixedDialects",
  description: "Schema uses multiple dialects which cannot coexist.",
  run(schema) {
    const issues: Issue[] = [];
    const dialects = new Map<string, { line: number; builder: string }>();
    for (const t of schema.tables) {
      if (!dialects.has(t.dialect)) {
        dialects.set(t.dialect, { line: t.line, builder: t.builder });
      }
    }
    if (dialects.size <= 1) return issues;

    for (const t of schema.tables) {
      issues.push({
        line: t.line,
        message: `Mixed dialects detected: "${t.builder}" (${t.dialect}) in a schema that also uses ${[
          ...dialects.keys(),
        ]
          .filter((d) => d !== t.dialect)
          .join(", ")}. Pick one ORM dialect per schema file.`,
        severity: "warning",
        ruleId: "MixedDialects",
      });
    }
    return issues;
  },
};
