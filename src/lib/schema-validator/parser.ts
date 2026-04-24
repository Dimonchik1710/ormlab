import type {
  ParsedColumn,
  ParsedSchema,
  ParsedTable,
  TableDialect,
} from "./types";

const BUILDER_DIALECTS: Record<string, TableDialect> = {
  pgTable: "postgresql",
  mysqlTable: "mysql",
  sqliteTable: "sqlite",
};

function offsetToLine(source: string, offset: number): number {
  let line = 1;
  for (let i = 0; i < offset && i < source.length; i++) {
    if (source[i] === "\n") line++;
  }
  return line;
}

function findMatchingBrace(source: string, openIndex: number): number {
  const open = source[openIndex];
  const close = open === "{" ? "}" : open === "(" ? ")" : null;
  if (!close) return -1;

  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      if (ch === "\n") inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inString) {
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch as '"' | "'" | "`";
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function splitTopLevel(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let inString: '"' | "'" | "`" | null = null;
  let current = "";

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    const next = body[i + 1];

    if (inString) {
      current += ch;
      if (ch === "\\") {
        current += next ?? "";
        i++;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch as '"' | "'" | "`";
      current += ch;
      continue;
    }
    if (ch === "{" || ch === "(" || ch === "[") depth++;
    else if (ch === "}" || ch === ")" || ch === "]") depth--;

    if (ch === "," && depth === 0) {
      if (current.trim()) parts.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current);
  return parts;
}

function parseColumns(
  body: string,
  bodyOffset: number,
  source: string,
): ParsedColumn[] {
  const parts = splitTopLevel(body);
  const columns: ParsedColumn[] = [];

  let cursor = bodyOffset;
  for (const raw of parts) {
    // match segment start in source from cursor for line calc
    const segmentStart = source.indexOf(raw.trim(), cursor);
    const line = segmentStart >= 0 ? offsetToLine(source, segmentStart) : 1;
    cursor = segmentStart + raw.length;

    const trimmed = raw.trim();
    // key: value  — key could be identifier or "quoted"
    const m = trimmed.match(/^(?:"([^"]+)"|'([^']+)'|([A-Za-z_$][\w$]*))\s*:\s*([\s\S]+)$/);
    if (!m) continue;
    const name = m[1] ?? m[2] ?? m[3] ?? "";
    const expr = (m[4] ?? "").trim();

    // Skip composite PK / index helpers etc — those are not columns.
    // Heuristic: if the expression starts with primaryKey(/unique(/index(/foreignKey( treat as table-level helper, not a column.
    const tableHelpers = /^(?:primaryKey|unique|index|uniqueIndex|foreignKey|check)\s*\(/;
    if (tableHelpers.test(expr)) {
      columns.push({
        name,
        builderName: "__tableHelper__",
        builderArgs: "",
        chain: expr,
        raw: trimmed,
        line,
      });
      continue;
    }

    // Column builder: builderName("colName"?, opts?).chain()...
    const builderMatch = expr.match(/^([A-Za-z_$][\w$]*)\s*\(([\s\S]*)$/);
    if (!builderMatch) continue;
    const builderName = builderMatch[1];
    const afterOpen = builderMatch[2];
    // Find the matching ) for the builder call
    let depth = 1;
    let inString: '"' | "'" | "`" | null = null;
    let end = -1;
    for (let i = 0; i < afterOpen.length; i++) {
      const ch = afterOpen[i];
      if (inString) {
        if (ch === "\\") {
          i++;
          continue;
        }
        if (ch === inString) inString = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") {
        inString = ch as '"' | "'" | "`";
        continue;
      }
      if (ch === "(") depth++;
      else if (ch === ")") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end < 0) continue;
    const builderArgs = afterOpen.slice(0, end).trim();
    const chain = afterOpen.slice(end + 1).trim();

    columns.push({
      name,
      builderName,
      builderArgs,
      chain,
      raw: trimmed,
      line,
    });
  }

  return columns;
}

function parseImports(source: string): ParsedSchema["imports"] {
  const imports: ParsedSchema["imports"] = {
    drizzleOrm: new Set(),
    pg: new Set(),
    mysql: new Set(),
    sqlite: new Set(),
  };
  const re = /import\s*\{([^}]+)\}\s*from\s*["']([^"']+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const names = m[1]
      .split(",")
      .map((s) =>
        s
          .replace(/\s+as\s+[A-Za-z_$][\w$]*/, "")
          .trim(),
      )
      .filter(Boolean);
    const from = m[2];
    let bucket: Set<string> | null = null;
    if (from === "drizzle-orm") bucket = imports.drizzleOrm;
    else if (from.includes("pg-core")) bucket = imports.pg;
    else if (from.includes("mysql-core")) bucket = imports.mysql;
    else if (from.includes("sqlite-core")) bucket = imports.sqlite;
    if (bucket) names.forEach((n) => bucket.add(n));
  }
  return imports;
}

export function parseSchema(source: string): ParsedSchema {
  const imports = parseImports(source);
  const tables: ParsedTable[] = [];

  // Match: export? const? VAR = pgTable("name", { ... })  (also without export / const)
  const re =
    /(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(pgTable|mysqlTable|sqliteTable)\s*\(/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const variableName = m[1];
    const builder = m[2];
    const dialect = BUILDER_DIALECTS[builder];
    const openParen = m.index + m[0].length - 1;
    const closeParen = findMatchingBrace(source, openParen);
    if (closeParen < 0) continue;

    const argSection = source.slice(openParen + 1, closeParen);
    // First arg: "name"
    const nameMatch = argSection.match(/^\s*["'`]([^"'`]+)["'`]\s*,/);
    if (!nameMatch) continue;
    const tableName = nameMatch[1];

    // Find the { after the name literal
    const afterName = argSection.indexOf(nameMatch[0]) + nameMatch[0].length;
    const braceIdxLocal = argSection.indexOf("{", afterName);
    if (braceIdxLocal < 0) continue;
    const braceIdxGlobal = openParen + 1 + braceIdxLocal;
    const braceCloseGlobal = findMatchingBrace(source, braceIdxGlobal);
    if (braceCloseGlobal < 0) continue;

    const body = source.slice(braceIdxGlobal + 1, braceCloseGlobal);
    const columns = parseColumns(body, braceIdxGlobal + 1, source);

    // Anything after the closing brace and before closeParen = extras (e.g. second arg)
    const extras = source.slice(braceCloseGlobal + 1, closeParen).trim();

    tables.push({
      variableName,
      tableName,
      dialect,
      builder,
      columns,
      extras,
      line: offsetToLine(source, m.index),
      endLine: offsetToLine(source, closeParen),
    });
  }

  return { tables, imports, source };
}
