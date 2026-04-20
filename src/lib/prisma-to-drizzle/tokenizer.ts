// Token types that tokenizer produces
export type TokenType =
  | "keyword"      // model, enum, datasource, generator
  | "identifier"   // User, email, Int, String
  | "attribute"    // @id, @unique, @@map
  | "string"       // "hello", "postgresql"
  | "number"       // 42, 3.14
  | "punctuation"  // {, }, (, ), [, ], =, ,, ?
  | "comment";     // // ... or /// ...

export interface Token {
  type: TokenType;
  value: string;
  line: number;    // for error messages
}

// Keywords that start top-level blocks
const KEYWORDS = new Set([
  "model",
  "enum",
  "datasource",
  "generator",
  "type", // Prisma 5+ composite types
  "view", // Prisma views
]);

/**
 * Split Prisma schema text into a flat list of tokens.
 * Ignores whitespace and comments.
 */
export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let line = 1;

  while (i < input.length) {
    const ch = input[i];

    // Newline — track line number for errors
    if (ch === "\n") {
      line++;
      i++;
      continue;
    }

    // Whitespace — skip
    if (ch === " " || ch === "\t" || ch === "\r") {
      i++;
      continue;
    }

    // Comments: // single-line or /// documentation
    if (ch === "/" && input[i + 1] === "/") {
      // Skip until end of line
      while (i < input.length && input[i] !== "\n") {
        i++;
      }
      continue;
    }

    // String literals: "..."
    if (ch === '"') {
      const start = i;
      i++; // skip opening quote
      let value = "";
      while (i < input.length && input[i] !== '"') {
        // Handle escaped quotes \"
        if (input[i] === "\\" && input[i + 1] === '"') {
          value += '"';
          i += 2;
          continue;
        }
        if (input[i] === "\n") line++;
        value += input[i];
        i++;
      }
      i++; // skip closing quote
      tokens.push({ type: "string", value, line });
      continue;
    }

    // Numbers: 42, 3.14, -5
    if (isDigit(ch) || (ch === "-" && isDigit(input[i + 1]))) {
      let value = "";
      if (ch === "-") {
        value += ch;
        i++;
      }
      while (i < input.length && (isDigit(input[i]) || input[i] === ".")) {
        value += input[i];
        i++;
      }
      tokens.push({ type: "number", value, line });
      continue;
    }

    // Attributes: @id, @unique, @@map
    if (ch === "@") {
      let value = "@";
      i++;
      // Double @@ for block-level attributes
      if (input[i] === "@") {
        value += "@";
        i++;
      }
      // Attribute name — identifier chars
      while (i < input.length && isIdentChar(input[i])) {
        value += input[i];
        i++;
      }
      tokens.push({ type: "attribute", value, line });
      continue;
    }

    // Punctuation
    if ("{}()[]=,?:".includes(ch)) {
      tokens.push({ type: "punctuation", value: ch, line });
      i++;
      continue;
    }

    // Identifiers / keywords: start with letter or _
    if (isIdentStart(ch)) {
      let value = "";
      while (i < input.length && isIdentChar(input[i])) {
        value += input[i];
        i++;
      }
      const type: TokenType = KEYWORDS.has(value) ? "keyword" : "identifier";
      tokens.push({ type, value, line });
      continue;
    }

    // Unknown character — skip with silent tolerance
    // (could throw, but we prefer lenient parsing)
    i++;
  }

  return tokens;
}

function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

function isIdentStart(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_"
  );
}

function isIdentChar(ch: string): boolean {
  return isIdentStart(ch) || isDigit(ch);
}