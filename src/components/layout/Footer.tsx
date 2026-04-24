import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              ormlab
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Free tools for modern TypeScript ORMs.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Tools
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/tools/sql-to-drizzle"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  SQL → Drizzle
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/prisma-to-drizzle"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Prisma → Drizzle
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/schema-validator"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Schema Validator
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Learn
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Blog
                </Link>
              </li>
              <li>
                <a
                  href="https://orm.drizzle.team"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Drizzle Docs ↗
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/drizzle-team/drizzle-orm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Drizzle on GitHub ↗
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              About
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="https://github.com/Dimonchik1710/ormlab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Source code ↗
                </a>
              </li>
              <li className="text-gray-400 dark:text-gray-600">
                Privacy (soon)
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-900 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © 2026 ormlab.dev · Built with Next.js, deployed on Vercel
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Not affiliated with Drizzle Team or Prisma
          </p>
        </div>
      </div>
    </footer>
  );
}
