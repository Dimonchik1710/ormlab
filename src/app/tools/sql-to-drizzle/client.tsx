"use client";

import { useState } from "react";
import CodeEditor from "@/components/tools/CodeEditor";
import CodeOutput, { OutputActions } from "@/components/tools/CodeOutput";
import DialectSelector from "@/components/tools/DialectSelector";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { parseSql } from "@/lib/sql-to-drizzle/converter";
import { formatDrizzleSchema } from "@/lib/sql-to-drizzle/formatter";
import type { Dialect } from "@/lib/shared/types";

const EXAMPLE_SQL = `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT,
  published_at TIMESTAMP
);`;

interface ConversionState {
  code: string;
  warnings: string[];
  errors: string[];
}

export default function SqlToDrizzleClient() {
  const [sql, setSql] = useState("");
  const [dialect, setDialect] = useState<Dialect>("postgresql");
  const [result, setResult] = useState<ConversionState>({
    code: "",
    warnings: [],
    errors: [],
  });
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = () => {
    if (!sql.trim()) {
      setResult({
        code: "",
        warnings: [],
        errors: ["SQL input is empty. Paste a CREATE TABLE statement."],
      });
      return;
    }

    setIsConverting(true);

    setTimeout(() => {
      try {
        const parsed = parseSql(sql, dialect);

        if (parsed.errors.length > 0 && parsed.tables.length === 0) {
          setResult({
            code: "",
            warnings: parsed.warnings,
            errors: parsed.errors,
          });
          setIsConverting(false);
          return;
        }

        const formatted = formatDrizzleSchema(parsed.tables, {
          dialect,
          includeImports: true,
          includeRelations: true,
        });

        setResult({
          code: formatted.code,
          warnings: [...parsed.warnings, ...formatted.warnings],
          errors: parsed.errors,
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        setResult({
          code: "",
          warnings: [],
          errors: [`Unexpected error: ${msg}`],
        });
      } finally {
        setIsConverting(false);
      }
    }, 100);
  };

  const handleLoadExample = () => {
    setSql(EXAMPLE_SQL);
  };

  const handleClear = () => {
    setSql("");
    setResult({ code: "", warnings: [], errors: [] });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            SQL to Drizzle ORM Converter
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Paste your PostgreSQL{" "}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
              CREATE TABLE
            </code>{" "}
            statements and get a ready-to-use Drizzle ORM schema. Works 100% in
            your browser — your SQL never leaves this page.
          </p>
        </div>
      </div>

      {/* Tool */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <DialectSelector value={dialect} onChange={setDialect} />
          <div className="flex gap-2">
            <button
              onClick={handleLoadExample}
              className="px-4 py-2 text-sm font-medium
                         bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200
                         border border-gray-300 dark:border-gray-700 rounded-md
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Load example
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium
                         bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200
                         border border-gray-300 dark:border-gray-700 rounded-md
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
          <div className="flex-1" />
          <button
            onClick={handleConvert}
            disabled={isConverting}
            className="px-6 py-2 text-sm font-medium
                       text-white dark:text-gray-900
                       bg-gray-900 dark:bg-gray-100
                       rounded-md
                       hover:bg-gray-800 dark:hover:bg-white
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? "Converting..." : "Convert →"}
          </button>
        </div>

        {/* Editor + Output — using CSS grid with explicit row heights for perfect alignment */}
        <div className="grid gap-x-6 gap-y-2 lg:grid-cols-2" style={{ gridTemplateRows: "2rem 24rem" }}>
          {/* Row 1: headers */}
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              SQL Input
            </label>
          </div>
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drizzle Schema
            </label>
            <OutputActions code={result.code} />
          </div>

          {/* Row 2: content boxes */}
          <div className="h-96">
            <CodeEditor
              value={sql}
              onChange={setSql}
              placeholder={`CREATE TABLE users (\n  id SERIAL PRIMARY KEY,\n  email VARCHAR(255) NOT NULL\n);`}
            />
          </div>
          <div className="h-96">
            <CodeOutput
              code={result.code}
              warnings={result.warnings}
              errors={result.errors}
            />
          </div>
        </div>
      </div>

      {/* Info section for SEO content */}
      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How it works
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              This tool parses your PostgreSQL{" "}
              <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                CREATE TABLE
              </code>{" "}
              statements and generates equivalent Drizzle ORM schema definitions
              in TypeScript. The conversion happens entirely in your browser — no
              data is sent to any server.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              What&apos;s supported
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>Common PostgreSQL types: VARCHAR, TEXT, INTEGER, SERIAL, BIGINT, BOOLEAN, TIMESTAMP, DATE, NUMERIC, JSON, JSONB, UUID</li>
              <li>Constraints: PRIMARY KEY, UNIQUE, NOT NULL, DEFAULT, REFERENCES (foreign keys)</li>
              <li>Multiple CREATE TABLE statements in one input</li>
              <li>Inline and table-level constraints</li>
              <li>ON DELETE actions: CASCADE, SET NULL, RESTRICT, NO ACTION</li>
              <li>
                DEFAULT values including{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  NOW()
                </code>{" "}
                and{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  CURRENT_TIMESTAMP
                </code>
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              Not yet supported
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                Composite primary/foreign keys (a warning is shown; add{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  primaryKey()
                </code>{" "}
                manually)
              </li>
              <li>CHECK constraints</li>
              <li>
                Indexes (
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  CREATE INDEX
                </code>
                )
              </li>
              <li>Custom enums and user-defined types</li>
              <li>MySQL and SQLite dialects (coming soon)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              Privacy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The converter runs entirely client-side in your browser. Your SQL
              input is never sent to our servers, stored, or logged. You can
              verify this by checking the Network tab in your browser&apos;s
              DevTools.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
