"use client";

import type { Dialect } from "@/lib/shared/types";

interface DialectSelectorProps {
  value: Dialect;
  onChange: (dialect: Dialect) => void;
  label?: string;
  availableDialects?: Dialect[];
}

const ALL_DIALECTS: { value: Dialect; label: string }[] = [
  { value: "postgresql", label: "PostgreSQL" },
  { value: "mysql", label: "MySQL" },
  { value: "sqlite", label: "SQLite" },
];

export default function DialectSelector({
  value,
  onChange,
  label = "Target Dialect",
  availableDialects = ["postgresql"],
}: DialectSelectorProps) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor="dialect-select"
        className="text-sm font-medium text-gray-700 mb-2"
      >
        {label}
      </label>
      <select
        id="dialect-select"
        value={value}
        onChange={(e) => onChange(e.target.value as Dialect)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   cursor-pointer"
      >
        {ALL_DIALECTS.map((d) => {
          const isAvailable = availableDialects.includes(d.value);
          return (
            <option key={d.value} value={d.value} disabled={!isAvailable}>
              {d.label}
              {!isAvailable && " (coming soon)"}
            </option>
          );
        })}
      </select>
    </div>
  );
}