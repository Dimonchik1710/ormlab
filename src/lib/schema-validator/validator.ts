import { parseSchema } from "./parser";
import { RULES } from "./rules";
import type { Issue, ParsedSchema } from "./types";

export interface ValidationResult {
  issues: Issue[];
  schema: ParsedSchema;
}

export function validateSchema(source: string): ValidationResult {
  const schema = parseSchema(source);
  const issues: Issue[] = [];
  for (const rule of RULES) {
    try {
      issues.push(...rule.run(schema));
    } catch (e) {
      issues.push({
        line: 1,
        message: `Rule "${rule.id}" crashed: ${
          e instanceof Error ? e.message : String(e)
        }`,
        severity: "warning",
        ruleId: rule.id,
      });
    }
  }
  issues.sort(
    (a, b) =>
      a.line - b.line ||
      severityOrder(a.severity) - severityOrder(b.severity),
  );
  return { issues, schema };
}

function severityOrder(s: Issue["severity"]): number {
  return s === "error" ? 0 : s === "warning" ? 1 : 2;
}

export { RULES } from "./rules";
export type { Issue, ParsedSchema, Rule, Severity } from "./types";
