"use client";

import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { DIALECT_META, TYPE_DATA, type TypeRow } from "@/lib/type-reference/data";
import type { Dialect } from "@/lib/shared/types";

const DIALECTS: Dialect[] = ["postgresql", "mysql", "sqlite"];

function matches(row: TypeRow, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    row.name.toLowerCase().includes(q) ||
    row.drizzle.toLowerCase().includes(q) ||
    row.sql.toLowerCase().includes(q) ||
    row.tsType.toLowerCase().includes(q) ||
    (row.notes?.toLowerCase().includes(q) ?? false)
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      title={copied ? "Copied!" : "Click to copy"}
      className={`ml-2 px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold rounded border transition-colors ${
        copied
          ? "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300"
          : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function TypeReferenceClient() {
  const [dialect, setDialect] = useState<Dialect>("postgresql");
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return TYPE_DATA[dialect].filter((r) => matches(r, query));
  }, [dialect, query]);

  const meta = DIALECT_META[dialect];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Drizzle ORM Type Reference
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Quick lookup table for Drizzle column builders, their SQL
            equivalents, and inferred TypeScript types — across PostgreSQL,
            MySQL, and SQLite. Click any Drizzle method to copy it.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Database dialect"
          className="flex flex-wrap gap-1 p-1 mb-4 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg w-fit"
        >
          {DIALECTS.map((d) => {
            const active = d === dialect;
            return (
              <button
                key={d}
                role="tab"
                aria-selected={active}
                onClick={() => setDialect(d)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                {DIALECT_META[d].label}
              </button>
            );
          })}
        </div>

        {/* Search + meta row */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search types (e.g. timestamp, uuid, json)…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Import from{" "}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-xs font-mono">
              {meta.importPath}
            </code>{" "}
            · {rows.length} of {TYPE_DATA[dialect].length} shown
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900/80 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-400">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Type</th>
                <th className="text-left px-4 py-3 font-semibold">
                  Drizzle method
                </th>
                <th className="text-left px-4 py-3 font-semibold">
                  SQL equivalent
                </th>
                <th className="text-left px-4 py-3 font-semibold">
                  TypeScript type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              {rows.map((row) => (
                <tr
                  key={`${dialect}-${row.name}`}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/60 transition-colors"
                >
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {row.name}
                    </div>
                    {row.notes && (
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {row.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(row.drizzle).catch(() => {});
                        }}
                        title="Click to copy"
                        className="font-mono text-xs text-left px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-copy"
                      >
                        {row.drizzle}
                      </button>
                      <CopyButton text={row.drizzle} />
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <code className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {row.sql}
                    </code>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <code className="font-mono text-xs text-gray-700 dark:text-gray-300">
                      {row.tsType}
                    </code>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No types match{" "}
                    <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-xs">
                      {query}
                    </code>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <section className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              How to read this table
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                <strong>Type</strong> — short name of the Drizzle column type,
                including variants like{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  integer (timestamp)
                </code>{" "}
                for SQLite mode options.
              </li>
              <li>
                <strong>Drizzle method</strong> — the exact call you write inside{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  pgTable
                </code>{" "}
                /{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  mysqlTable
                </code>{" "}
                /{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  sqliteTable
                </code>
                . Click it to copy.
              </li>
              <li>
                <strong>SQL equivalent</strong> — what{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  drizzle-kit
                </code>{" "}
                emits in your migration files.
              </li>
              <li>
                <strong>TypeScript type</strong> — what{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  InferSelectModel
                </code>{" "}
                infers for that column by default.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              Tips
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>
                For <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">json</code> /{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">jsonb</code> columns, use{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  .$type&lt;Shape&gt;()
                </code>{" "}
                to get a typed payload instead of{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">unknown</code>.
              </li>
              <li>
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">numeric</code> /{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">decimal</code>{" "}
                return strings in JS — Drizzle avoids silent float rounding.
              </li>
              <li>
                SQLite has no native boolean, date, or JSON types —{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  integer
                </code>{" "}
                and{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">
                  text
                </code>{" "}
                with{" "}
                <code className="px-1 bg-white dark:bg-gray-800 rounded text-sm">mode</code>{" "}
                handle them.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
