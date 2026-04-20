"use client";

import type { SqlDialect } from "@/lib/sql-to-drizzle/types";

interface DialectSelectorProps {
  value: SqlDialect;
  onChange: (dialect: SqlDialect) => void;
}

const DIALECTS: { value: SqlDialect; label: string; available: boolean }[] = [
  { value: "postgresql", label: "PostgreSQL", available: true },
  { value: "mysql", label: "MySQL", available: false },
  { value: "sqlite", label: "SQLite", available: false },
];

export default function DialectSelector({ value, onChange }: DialectSelectorProps) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor="dialect-select"
        className="text-sm font-medium text-gray-700 mb-2"
      >
        SQL Dialect
      </label>
      <select
        id="dialect-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SqlDialect)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   cursor-pointer"
      >
        {DIALECTS.map((d) => (
          <option key={d.value} value={d.value} disabled={!d.available}>
            {d.label}
            {!d.available && " (coming soon)"}
          </option>
        ))}
      </select>
    </div>
  );
}