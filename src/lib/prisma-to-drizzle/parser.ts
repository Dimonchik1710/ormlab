import type {
  PrismaSchema,
  PrismaModel,
  PrismaField,
  PrismaEnum,
  PrismaDatasource,
  FieldAttribute,
  BlockAttribute,
  ParseResult,
} from "./types";
import { tokenize, type Token } from "./tokenizer";

/**
 * Parse Prisma schema text into a structured AST.
 * Returns schema + any errors/warnings.
 */
export function parsePrismaSchema(input: string): ParseResult {
  const result: ParseResult = {
    schema: { models: [], enums: [] },
    errors: [],
    warnings: [],
  };

  if (!input.trim()) {
    result.errors.push("Prisma schema input is empty");
    return result;
  }

  const tokens = tokenize(input);
  if (tokens.length === 0) {
    result.errors.push("No tokens could be parsed from input");
    return result;
  }

  const state = { tokens, pos: 0 };

  while (state.pos < state.tokens.length) {
    const token = state.tokens[state.pos];

    if (token.type === "keyword") {
      try {
        if (token.value === "model") {
          const model = parseModel(state, result);
          if (model) result.schema.models.push(model);
        } else if (token.value === "enum") {
          const enumDef = parseEnum(state, result);
          if (enumDef) result.schema.enums.push(enumDef);
        } else if (token.value === "datasource") {
          const ds = parseDatasource(state, result);
          if (ds) result.schema.datasource = ds;
        } else if (token.value === "generator") {
          // We don't need generator info, just skip the block
          skipBlock(state);
        } else if (token.value === "type" || token.value === "view") {
          // Prisma composite types and views — not supported in MVP
          result.warnings.push(
            `${token.value === "type" ? "Composite types" : "Views"} are not yet supported — block skipped.`
          );
          skipBlock(state);
        } else {
          state.pos++;
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        result.errors.push(`Parse error near line ${token.line}: ${msg}`);
        // Try to recover — skip to next top-level keyword
        skipToNextTopLevel(state);
      }
    } else {
      // Unexpected token at top level — skip
      state.pos++;
    }
  }

  if (
    result.schema.models.length === 0 &&
    result.schema.enums.length === 0 &&
    result.errors.length === 0
  ) {
    result.errors.push(
      "No models or enums found. Make sure your input is valid Prisma schema."
    );
  }

  return result;
}

// ===================== INTERNAL PARSER STATE =====================

interface ParserState {
  tokens: Token[];
  pos: number;
}

function peek(state: ParserState, offset = 0): Token | undefined {
  return state.tokens[state.pos + offset];
}

function consume(state: ParserState): Token | undefined {
  return state.tokens[state.pos++];
}

function expect(state: ParserState, value: string, errorMsg: string): Token {
  const tok = state.tokens[state.pos];
  if (!tok || tok.value !== value) {
    throw new Error(
      `${errorMsg} (got ${tok?.value ?? "end of input"} at line ${tok?.line ?? "?"})`
    );
  }
  state.pos++;
  return tok;
}

// ===================== MODEL PARSER =====================

function parseModel(state: ParserState, result: ParseResult): PrismaModel | null {
  consume(state); // "model"
  const nameTok = consume(state);
  if (!nameTok || nameTok.type !== "identifier") {
    throw new Error("Expected model name after 'model' keyword");
  }

  expect(state, "{", "Expected '{' after model name");

  const model: PrismaModel = {
    name: nameTok.value,
    fields: [],
    blockAttributes: [],
  };

  while (state.pos < state.tokens.length && peek(state)?.value !== "}") {
    const tok = peek(state);
    if (!tok) break;

    // Block attributes: @@id, @@unique, @@index, @@map
    if (tok.type === "attribute" && tok.value.startsWith("@@")) {
      const attr = parseAttribute(state);
      if (attr) {
        model.blockAttributes.push(attr);
        // Handle @@map specifically
        if (attr.name === "map" && attr.args[0]) {
          model.mappedName = stripQuotes(attr.args[0]);
        }
      }
      continue;
    }

    // Regular field
    if (tok.type === "identifier") {
      const field = parseField(state, result);
      if (field) model.fields.push(field);
      continue;
    }

    // Unknown — skip
    state.pos++;
  }

  expect(state, "}", "Expected '}' to close model block");
  return model;
}

// ===================== FIELD PARSER =====================

function parseField(state: ParserState, result: ParseResult): PrismaField | null {
  const nameTok = consume(state);
  if (!nameTok || nameTok.type !== "identifier") return null;

  const typeTok = consume(state);
  if (!typeTok || typeTok.type !== "identifier") {
    result.warnings.push(
      `Field "${nameTok.value}" at line ${nameTok.line} has no type — skipped.`
    );
    // Skip rest of line roughly — advance until next newline/attribute/identifier boundary
    return null;
  }

  const field: PrismaField = {
    name: nameTok.value,
    type: typeTok.value,
    isOptional: false,
    isList: false,
    attributes: [],
  };

  // Check for array [] or optional ?
  while (state.pos < state.tokens.length) {
    const t = peek(state);
    if (!t) break;
    if (t.value === "[") {
      consume(state);
      if (peek(state)?.value === "]") {
        consume(state);
        field.isList = true;
      }
      continue;
    }
    if (t.value === "?") {
      consume(state);
      field.isOptional = true;
      continue;
    }
    break;
  }

  // Collect attributes until we hit end of field (next identifier on new line, or })
  while (state.pos < state.tokens.length) {
    const t = peek(state);
    if (!t) break;
    if (t.type === "attribute" && t.value.startsWith("@") && !t.value.startsWith("@@")) {
      const attr = parseAttribute(state);
      if (attr) field.attributes.push(attr);
      continue;
    }
    // End of field — next token is something else (identifier for next field, }, or @@ block attr)
    break;
  }

  return field;
}

// ===================== ATTRIBUTE PARSER =====================

function parseAttribute(state: ParserState): FieldAttribute | BlockAttribute | null {
  const tok = consume(state);
  if (!tok || tok.type !== "attribute") return null;

  // Strip leading @ or @@
  const name = tok.value.replace(/^@@?/, "");

  const attr: FieldAttribute & BlockAttribute = {
    name,
    args: [],
  };

  // Optional arguments: (arg1, arg2, ...)
  if (peek(state)?.value === "(") {
    consume(state); // (
    let depth = 1;
    let currentArg = "";
    while (state.pos < state.tokens.length && depth > 0) {
      const t = consume(state);
      if (!t) break;
      if (t.value === "(") {
        depth++;
        currentArg += t.value;
      } else if (t.value === ")") {
        depth--;
        if (depth === 0) {
          if (currentArg.trim()) attr.args.push(currentArg.trim());
          break;
        }
        currentArg += t.value;
      } else if (t.value === "," && depth === 1) {
        if (currentArg.trim()) attr.args.push(currentArg.trim());
        currentArg = "";
      } else {
        // Re-serialize token value, preserving strings with quotes
        if (t.type === "string") {
          currentArg += `"${t.value}"`;
        } else {
          currentArg += t.value;
        }
      }
    }
  }

  return attr;
}

// ===================== ENUM PARSER =====================

function parseEnum(state: ParserState, _result: ParseResult): PrismaEnum | null {
  consume(state); // "enum"
  const nameTok = consume(state);
  if (!nameTok || nameTok.type !== "identifier") {
    throw new Error("Expected enum name after 'enum' keyword");
  }

  expect(state, "{", "Expected '{' after enum name");

  const values: string[] = [];
  while (state.pos < state.tokens.length && peek(state)?.value !== "}") {
    const t = consume(state);
    if (!t) break;
    if (t.type === "identifier") {
      values.push(t.value);
      // Skip any attributes on enum values (like @map)
      while (state.pos < state.tokens.length && peek(state)?.type === "attribute") {
        parseAttribute(state);
      }
    }
  }

  expect(state, "}", "Expected '}' to close enum block");
  return { name: nameTok.value, values };
}

// ===================== DATASOURCE PARSER =====================

function parseDatasource(state: ParserState, _result: ParseResult): PrismaDatasource | null {
  consume(state); // "datasource"
  consume(state); // name (e.g. "db") — we don't use it
  expect(state, "{", "Expected '{' after datasource name");

  const ds: PrismaDatasource = { provider: "postgresql" };

  while (state.pos < state.tokens.length && peek(state)?.value !== "}") {
    const key = consume(state);
    if (!key) break;
    if (key.value === "provider") {
      // Skip "="
      if (peek(state)?.value === "=") consume(state);
      const val = consume(state);
      if (val?.type === "string") {
        ds.provider = val.value;
      }
    } else {
      // Skip other keys (url, shadowDatabaseUrl, etc.)
      // Advance past = and value
      if (peek(state)?.value === "=") consume(state);
      // Consume until next identifier-like key or }
      const v = consume(state);
      // If value is env("..."), skip the parens too
      if (v?.value === "env" && peek(state)?.value === "(") {
        let depth = 0;
        while (state.pos < state.tokens.length) {
          const t = consume(state);
          if (!t) break;
          if (t.value === "(") depth++;
          if (t.value === ")") {
            depth--;
            if (depth === 0) break;
          }
        }
      }
    }
  }

  expect(state, "}", "Expected '}' to close datasource block");
  return ds;
}

// ===================== UTILITIES =====================

function skipBlock(state: ParserState): void {
  // Advance until we find { then match its closing }
  while (state.pos < state.tokens.length && peek(state)?.value !== "{") {
    state.pos++;
  }
  if (peek(state)?.value !== "{") return;
  consume(state); // {
  let depth = 1;
  while (state.pos < state.tokens.length && depth > 0) {
    const t = consume(state);
    if (!t) break;
    if (t.value === "{") depth++;
    if (t.value === "}") depth--;
  }
}

function skipToNextTopLevel(state: ParserState): void {
  while (state.pos < state.tokens.length) {
    const t = peek(state);
    if (!t) break;
    if (
      t.type === "keyword" &&
      ["model", "enum", "datasource", "generator", "type", "view"].includes(t.value)
    ) {
      return;
    }
    state.pos++;
  }
}

function stripQuotes(s: string): string {
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1);
  }
  return s;
}