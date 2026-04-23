"use client";

import { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";

interface CodeOutputProps {
  code: string;
  warnings?: string[];
  errors?: string[];
}

export default function CodeOutput({ code, warnings = [], errors = [] }: CodeOutputProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current && code) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code]);

  return (
    <div className="w-full h-full">
      {errors.length > 0 && (
        <div className="mb-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
            {errors.length === 1 ? "Error" : "Errors"}
          </p>
          <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside space-y-1">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
            {warnings.length === 1 ? "Warning" : "Warnings"}
          </p>
          <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {code ? (
        <pre className="h-full w-full overflow-auto rounded-lg text-sm !m-0 !whitespace-pre-wrap block">
          <code ref={codeRef} className="language-typescript !whitespace-pre-wrap">
            {code}
          </code>
        </pre>
      ) : (
        <div className="h-full w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg
                        flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          Paste SQL on the left and click Convert
        </div>
      )}
    </div>
  );
}

interface OutputActionsProps {
  code: string;
}

export function OutputActions({ code }: OutputActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback handled by the user manually
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={handleCopy}
        disabled={!code}
        className="px-3 py-1 text-xs font-medium
                   bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200
                   border border-gray-300 dark:border-gray-700 rounded-md
                   hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
      <button
        onClick={handleDownload}
        disabled={!code}
        className="px-3 py-1 text-xs font-medium
                   bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200
                   border border-gray-300 dark:border-gray-700 rounded-md
                   hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Download
      </button>
    </div>
  );
}
