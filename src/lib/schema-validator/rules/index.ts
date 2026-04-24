import type { Rule } from "../types";
import { checkMissingPrimaryKey } from "./check-missing-primary-key";
import { typeMismatchInRelations } from "./type-mismatch-in-relations";
import { duplicateColumnName, duplicateTableName } from "./duplicates";
import { mixedDialects } from "./mixed-dialects";
import { emptyTable } from "./empty-table";
import { nullablePrimaryKey } from "./nullable-primary-key";

export const RULES: Rule[] = [
  checkMissingPrimaryKey,
  typeMismatchInRelations,
  duplicateTableName,
  duplicateColumnName,
  mixedDialects,
  emptyTable,
  nullablePrimaryKey,
];
