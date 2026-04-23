"use client";

import { useState } from "react";
import CodeEditor from "@/components/tools/CodeEditor";
import CodeOutput, { OutputActions } from "@/components/tools/CodeOutput";
import DialectSelector from "@/components/tools/DialectSelector";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { parsePrismaSchema } from "@/lib/prisma-to-drizzle/parser";
import { formatDrizzleSchema } from "@/lib/prisma-to-drizzle/formatter";
import type { Dialect } from "@/lib/shared/types";

const EXAMPLE_PRISMA = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
  GUEST
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())

  @@map("users")
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  body      String?
  published Boolean  @default(false)
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
}`;

interface ConversionState {
  code: string;
  warnings: string[];
  errors: string[];
}

export default function PrismaToDrizzleClient() {
  const [prisma, setPrisma] = useState("");
  const [dialect, setDialect] = useState<Dialect>("postgresql");
  const [result, setResult] = useState<ConversionState>({
    code: "",
    warnings: [],
    errors: [],
  });
  const [isConverting, setIsConverting] = useState(false);

  const handleConvert = () => {
    if (!prisma.trim()) {
      setResult({
        code: "",
        warnings: [],
        errors: ["Prisma schema input is empty. Paste a schema.prisma file."],
      });
      return;
    }

    setIsConverting(true);

    setTimeout(() => {
      try {
        const parsed = parsePrismaSchema(prisma);

        // Auto-detect dialect from datasource if present
        let effectiveDialect = dialect;
        if (parsed.schema.datasource?.provider) {
          const provider = parsed.schema.datasource.provider.toLowerCase();
          if (provider === "postgresql" || provider === "postgres") {
            effectiveDialect = "postgresql";
          } else if (provider === "mysql") {
            effectiveDialect = "mysql";
          } else if (provider === "sqlite") {
            effectiveDialect = "sqlite";
          }
        }

        if (
          parsed.errors.length > 0 &&
          parsed.schema.models.length === 0 &&
          parsed.schema.enums.length === 0
        ) {
          setResult({
            code: "",
            warnings: parsed.warnings,
            errors: parsed.errors,
          });
          setIsConverting(false);
          return;
        }

        const formatted = formatDrizzleSchema(parsed.schema, effectiveDialect);

        setResult({
          code: formatted.drizzleCode ?? "",
          warnings: [...parsed.warnings, ...formatted.warnings],
          errors: [...parsed.errors, ...formatted.errors],
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
    setPrisma(EXAMPLE_PRISMA);
  };

  const handleClear = () => {
    setPrisma("");
    setResult({ code: "", warnings: [], errors: [] });
  };

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Prisma to Drizzle ORM Converter
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Paste your{" "}
            <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
              schema.prisma
            </code>{" "}
            file and get a ready-to-use Drizzle ORM schema. Works 100% in your
            browser — your schema never leaves this page.
          </p>
        </div>
      </div>

      {/* Tool */}
      <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 mb-6">
          <DialectSelector
            value={dialect}
            onChange={setDialect}
            label="Target Dialect"
            availableDialects={["postgresql", "mysql", "sqlite"]}
          />
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

        {/* Editor + Output — CSS grid for perfect alignment */}
        <div
          className="grid gap-x-6 gap-y-2 lg:grid-cols-2"
          style={{ gridTemplateRows: "2rem 24rem" }}
        >
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Prisma Schema
            </label>
          </div>
          <div className="flex items-center justify-between h-8">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drizzle Schema
            </label>
            <OutputActions code={result.code} />
          </div>

          <div className="h-96">
            <CodeEditor
              value={prisma}
              onChange={setPrisma}
              placeholder={`datasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id    Int    @id @default(autoincrement())\n  email String @unique\n}`}
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
              This tool parses your Prisma schema and generates equivalent
              Drizzle ORM schema definitions in TypeScript. It auto-detects your
              database dialect from the{" "}
              <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                datasource
              </code>{" "}
              block and produces code for PostgreSQL, MySQL, or SQLite.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The conversion happens entirely in your browser — no data is sent
              to any server.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              What&apos;s supported
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>All Prisma scalar types: String, Int, BigInt, Float, Decimal, Boolean, DateTime, Json, Bytes</li>
              <li>
                Custom enums →{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  pgEnum
                </code>{" "}
                (Postgres) or TypeScript union types (MySQL/SQLite)
              </li>
              <li>
                Field attributes:{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @id
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @unique
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @default
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @map
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @relation
                </code>
              </li>
              <li>
                Model attributes:{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @@map
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @@id
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @@unique
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @@index
                </code>
              </li>
              <li>
                Auto-increment primary keys →{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  serial()
                </code>{" "}
                /{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  int().autoincrement()
                </code>
              </li>
              <li>
                Foreign key relations with{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  onDelete
                </code>{" "}
                actions
              </li>
              <li>
                Auto-detection of dialect from{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  datasource
                </code>{" "}
                block
              </li>
              <li>
                Optional and list fields (
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  String?
                </code>
                ,{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  Post[]
                </code>
                )
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              Requires manual attention
            </h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
              <li>
                Composite primary keys (
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @@id([a, b])
                </code>
                ) — warning shown, add{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  primaryKey()
                </code>{" "}
                helper manually
              </li>
              <li>
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @updatedAt
                </code>{" "}
                — no direct Drizzle equivalent, use{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  .$onUpdate()
                </code>
              </li>
              <li>
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @default(cuid())
                </code>{" "}
                /{" "}
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @default(uuid())
                </code>{" "}
                — set with a manual default function
              </li>
              <li>
                Indexes (
                <code className="px-1 py-0.5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded text-sm">
                  @@index
                </code>
                ) — Drizzle syntax differs, add via table callback
              </li>
              <li>Composite types and views (Prisma 5+) — not supported yet</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-8 mb-3">
              Privacy
            </h3>
            <p className="text-gray-700 dark:text-gray-300">
              The converter runs entirely client-side in your browser. Your
              schema is never sent to our servers, stored, or logged. You can
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
