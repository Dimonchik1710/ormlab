export type Severity = "error" | "warning" | "info";

export type TableDialect = "postgresql" | "mysql" | "sqlite";

export interface Issue {
  line: number;
  column?: number;
  message: string;
  severity: Severity;
  ruleId: string;
}

export interface ParsedColumn {
  name: string;
  builderName: string;
  builderArgs: string;
  chain: string;
  raw: string;
  line: number;
}

export interface ParsedTable {
  variableName: string;
  tableName: string;
  dialect: TableDialect;
  builder: string;
  columns: ParsedColumn[];
  extras: string;
  line: number;
  endLine: number;
}

export interface ParsedSchema {
  tables: ParsedTable[];
  imports: {
    drizzleOrm: Set<string>;
    pg: Set<string>;
    mysql: Set<string>;
    sqlite: Set<string>;
  };
  source: string;
}

export interface Rule {
  id: string;
  description: string;
  run: (schema: ParsedSchema) => Issue[];
}
