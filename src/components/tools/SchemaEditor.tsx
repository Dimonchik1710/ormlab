"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Issue } from "@/lib/schema-validator/validator";

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  issues: Issue[];
  focusLine?: number | null;
  placeholder?: string;
}

function severityClass(severity: Issue["severity"]): string {
  if (severity === "error")
    return "bg-red-500 text-white";
  if (severity === "warning") return "bg-yellow-400 text-gray-900";
  return "bg-blue-500 text-white";
}

function severityRowHighlight(severity: Issue["severity"]): string {
  if (severity === "error") return "bg-red-500/10 dark:bg-red-500/20";
  if (severity === "warning") return "bg-yellow-400/15 dark:bg-yellow-500/20";
  return "bg-blue-500/10 dark:bg-blue-500/20";
}

export default function SchemaEditor({
  value,
  onChange,
  issues,
  focusLine,
  placeholder,
}: SchemaEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => {
    const count = value.length === 0 ? 1 : value.split("\n").length;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [value]);

  const issuesByLine = useMemo(() => {
    const map = new Map<number, Issue[]>();
    for (const issue of issues) {
      const arr = map.get(issue.line) ?? [];
      arr.push(issue);
      map.set(issue.line, arr);
    }
    return map;
  }, [issues]);

  // Worst severity per line (error > warning > info)
  const worstByLine = useMemo(() => {
    const m = new Map<number, Issue["severity"]>();
    for (const [line, arr] of issuesByLine) {
      const order: Issue["severity"][] = ["error", "warning", "info"];
      for (const sev of order) {
        if (arr.some((i) => i.severity === sev)) {
          m.set(line, sev);
          break;
        }
      }
    }
    return m;
  }, [issuesByLine]);

  // Sync scroll between textarea, gutter, overlay
  const handleScroll = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gutterRef.current) gutterRef.current.scrollTop = ta.scrollTop;
    if (overlayRef.current) {
      overlayRef.current.scrollTop = ta.scrollTop;
      overlayRef.current.scrollLeft = ta.scrollLeft;
    }
  };

  // Jump to focused line
  useEffect(() => {
    if (!focusLine || !textareaRef.current) return;
    const ta = textareaRef.current;
    const linesBefore = value.split("\n").slice(0, focusLine - 1);
    const offset = linesBefore.join("\n").length + (focusLine > 1 ? 1 : 0);
    ta.focus();
    ta.setSelectionRange(offset, offset);
    // Approximate scroll — one line ~= 20px
    const lineHeight = 20;
    ta.scrollTop = Math.max(0, (focusLine - 3) * lineHeight);
    handleScroll();
  }, [focusLine, value]);

  return (
    <div className="relative w-full h-full border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="flex h-full font-mono text-sm leading-5">
        {/* Gutter */}
        <div
          ref={gutterRef}
          className="flex-none w-14 py-4 overflow-hidden select-none bg-gray-100 dark:bg-gray-900/60 border-r border-gray-200 dark:border-gray-800 text-right"
          aria-hidden="true"
        >
          {lines.map((n) => {
            const sev = worstByLine.get(n);
            return (
              <div
                key={n}
                className="relative h-5 pr-2 flex items-center justify-end gap-1 text-xs text-gray-400 dark:text-gray-500"
              >
                {sev && (
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      sev === "error"
                        ? "bg-red-500"
                        : sev === "warning"
                          ? "bg-yellow-400"
                          : "bg-blue-500"
                    }`}
                    title={sev}
                  />
                )}
                <span>{n}</span>
              </div>
            );
          })}
        </div>

        {/* Editor + overlay stack */}
        <div className="relative flex-1 h-full">
          {/* Row-highlight overlay (pinned behind the textarea) */}
          <div
            ref={overlayRef}
            className="absolute inset-0 py-4 px-3 pointer-events-none overflow-hidden whitespace-pre font-mono text-sm leading-5"
            aria-hidden="true"
          >
            {lines.map((n) => {
              const sev = worstByLine.get(n);
              return (
                <div
                  key={n}
                  className={`h-5 -mx-3 px-3 ${
                    sev ? severityRowHighlight(sev) : ""
                  }`}
                >
                  <span className="invisible">·</span>
                </div>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder={placeholder}
            spellCheck={false}
            className="relative z-10 block w-full h-full py-4 px-3 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none font-mono text-sm leading-5"
          />
        </div>
      </div>

    </div>
  );
}

export function SchemaIssueBadges({ issues }: { issues: Issue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="flex gap-1 text-xs">
      {(["error", "warning", "info"] as Issue["severity"][]).map((sev) => {
        const count = issues.filter((i) => i.severity === sev).length;
        if (count === 0) return null;
        return (
          <span
            key={sev}
            className={`px-2 py-0.5 rounded font-medium ${severityClass(sev)}`}
          >
            {count} {sev}
          </span>
        );
      })}
    </div>
  );
}
