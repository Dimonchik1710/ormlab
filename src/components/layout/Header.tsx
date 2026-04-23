import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-gray-900 dark:text-gray-100"
          >
            ormlab
          </Link>
          <nav className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href="/#tools"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Tools
            </Link>
            <Link
              href="/blog"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Blog
            </Link>
            <a
              href="https://github.com/Dimonchik1710/ormlab"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              GitHub ↗
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </div>
    </div>
  );
}
