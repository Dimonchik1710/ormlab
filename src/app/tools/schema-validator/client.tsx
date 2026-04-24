"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SchemaEditor, { SchemaIssueBadges } from "@/components/tools/SchemaEditor";
import IssueList from "@/components/tools/IssueList";
import { validateSchema } from "@/lib/schema-validator/validator";

const EXAMPLE_SCHEMA = `import { pgTable, serial, text, integer, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name"),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  // Type mismatch: text references serial (int)
  authorId: text("author_id").references(() => users.id),
});

export const tags = pgTable("tags", {
  name: text("name"),
});
`;

export default function SchemaValidatorClient() {
  const [source, setSource] = useState("");
  const [focusLine, setFocusLine] = useState<number | null>(null);
  const [hasValidated, setHasValidated] = useState(false);

  const result = useMemo(() => {
    if (!source.trim()) return { issues: [], schema: null };
    return validateSchema(source);
  }, [source]);

  const handleLoadExample = () => {
    setSource(EXAMPLE_SCHEMA);
    setHasValidated(true);
  };

  const handleClear = () => {
    setSource("");
    setFocusLine(null);
    setHasValidated(false);
  };

  const handleSelectIssue = (line: number) => {
    setFocusLine(null);
    // toggle to retrigger effect even if same line
    requestAnimationFrame(() => setFocusLine(line));
  };

  const showResults = hasValidated || source.trim().length > 0;

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Drizzle Schema Validator
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Paste a Drizzle schema (<code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">pgTable</code>,{" "}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">mysqlTable</code>,{" "}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">sqliteTable</code>
            ) to detect missing primary keys, broken relations, and other common mistakes.
            Everything runs in your browser.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={handleLoadExample}
            className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Load example
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Clear
          </button>
          <div className="flex-1" />
          {showResults && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {result.schema
                ? `${result.schema.tables.length} table${
                    result.schema.tables.length === 1 ? "" : "s"
                  } parsed · ${result.issues.length} issue${
                    result.issues.length === 1 ? "" : "s"
                  }`
                : ""}
            </p>
          )}
        </div>

        <div className="grid gap-x-6 gap-y-2 lg:grid-cols-2" style={{ gridTemplateRows: "2rem 28rem" }}>
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drizzle Schema
            </label>
            <SchemaIssueBadges issues={result.issues} />
          </div>
          <div className="flex items-center h-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Issues
            </label>
          </div>

          <div className="h-[28rem]">
            <SchemaEditor
              value={source}
              onChange={(v) => {
                setSource(v);
                setHasValidated(true);
              }}
              issues={result.issues}
              focusLine={focusLine}
              placeholder={`import { pgTable, serial, text } from "drizzle-orm/pg-core";\n\nexport const users = pgTable("users", {\n  id: serial("id").primaryKey(),\n  email: text("email").notNull(),\n});`}
            />
          </div>

          <div className="h-[28rem]">
            {!showResults ? (
              <div className="h-full flex items-center justify-center p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-500 dark:text-gray-400 text-center">
                Paste a Drizzle schema on the left to see validation results here.
              </div>
            ) : (
              <IssueList issues={result.issues} onSelect={handleSelectIssue} />
            )}
          </div>
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What it checks
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>CheckMissingPrimaryKey</strong> — every table declares a primary key,
                either via <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">.primaryKey()</code> on a column or a composite{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">primaryKey(...)</code> helper.
              </li>
              <li>
                <strong>TypeMismatchInRelations</strong> — foreign key columns
                use the same type family as the column they reference (e.g. a{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">text</code>{" "}
                column cannot reference a <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">serial</code> id).
              </li>
              <li>
                <strong>DuplicateTableName</strong> / <strong>DuplicateColumnName</strong> — no collisions inside the schema.
              </li>
              <li>
                <strong>MixedDialects</strong> — warns when{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">pgTable</code>,{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">mysqlTable</code>, and{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">sqliteTable</code> coexist in one file.
              </li>
              <li>
                <strong>EmptyTable</strong> — a table with no columns is almost certainly a mistake.
              </li>
              <li>
                <strong>NullablePrimaryKey</strong> — info-level nudge to add an explicit{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">.notNull()</code> on PK columns.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              How it works
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The validator uses a small TypeScript parser to locate every{" "}
              <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">pgTable</code> /{" "}
              <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">mysqlTable</code> /{" "}
              <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">sqliteTable</code>{" "}
              definition, then runs a set of rules against the parsed schema.
              Each rule returns issues with a line number and severity, which
              get surfaced in the editor gutter and the list on the right.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
