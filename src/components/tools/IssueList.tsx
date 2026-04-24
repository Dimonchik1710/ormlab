"use client";

import type { Issue } from "@/lib/schema-validator/validator";

interface IssueListProps {
  issues: Issue[];
  onSelect: (line: number) => void;
}

function severityBadge(severity: Issue["severity"]): {
  label: string;
  cls: string;
} {
  if (severity === "error")
    return {
      label: "error",
      cls: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
    };
  if (severity === "warning")
    return {
      label: "warn",
      cls: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-300 border-yellow-500/30",
    };
  return {
    label: "info",
    cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30",
  };
}

export default function IssueList({ issues, onSelect }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 rounded-lg border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 text-sm text-green-800 dark:text-green-300">
        No issues detected. Your schema looks healthy.
      </div>
    );
  }

  const counts = {
    error: issues.filter((i) => i.severity === "error").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    info: issues.filter((i) => i.severity === "info").length,
  };

  return (
    <div className="h-full flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-400">
        <span>{issues.length} issue{issues.length === 1 ? "" : "s"}</span>
        {counts.error > 0 && (
          <span className="text-red-600 dark:text-red-400">
            {counts.error} error{counts.error === 1 ? "" : "s"}
          </span>
        )}
        {counts.warning > 0 && (
          <span className="text-yellow-700 dark:text-yellow-400">
            {counts.warning} warning{counts.warning === 1 ? "" : "s"}
          </span>
        )}
        {counts.info > 0 && (
          <span className="text-blue-600 dark:text-blue-400">
            {counts.info} info
          </span>
        )}
      </div>
      <ul className="flex-1 divide-y divide-gray-200 dark:divide-gray-800 overflow-auto">
        {issues.map((issue, i) => {
          const badge = severityBadge(issue.severity);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => onSelect(issue.line)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
              >
                <span
                  className={`mt-0.5 inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-wide font-semibold border rounded ${badge.cls}`}
                >
                  {badge.label}
                </span>
                <span className="mt-0.5 text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums min-w-[3ch]">
                  L{issue.line}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 dark:text-gray-200">
                    {issue.message}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-500 font-mono">
                    {issue.ruleId}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
