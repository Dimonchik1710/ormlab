import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ormlab — Free tools for modern TypeScript ORMs",
  description:
    "Free developer tools for Drizzle ORM — convert SQL schemas, Prisma schemas, validate types, and more. 100% in your browser. Open-source and ad-free.",
  keywords: [
    "drizzle orm tools",
    "drizzle converter",
    "prisma to drizzle",
    "sql to drizzle",
    "typescript orm",
    "drizzle schema generator",
  ],
  alternates: {
    canonical: "https://ormlab.dev",
  },
  openGraph: {
    title: "ormlab — Free tools for modern TypeScript ORMs",
    description:
      "Free developer tools for Drizzle ORM. Convert SQL and Prisma schemas, validate types, and more — all in your browser.",
    url: "https://ormlab.dev",
    siteName: "ormlab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ormlab — Free tools for modern TypeScript ORMs",
    description:
      "Free developer tools for Drizzle ORM. Convert schemas, validate types, all in your browser.",
  },
};

interface Tool {
  href: string;
  title: string;
  description: string;
  available: boolean;
  badge?: string;
}

const TOOLS: Tool[] = [
  {
    href: "/tools/sql-to-drizzle",
    title: "SQL → Drizzle",
    description:
      "Paste your PostgreSQL CREATE TABLE statements and get a ready-to-use Drizzle ORM schema in TypeScript.",
    available: true,
    badge: "Popular",
  },
  {
    href: "/tools/prisma-to-drizzle",
    title: "Prisma → Drizzle",
    description:
      "Convert your schema.prisma file into Drizzle ORM code. Supports PostgreSQL, MySQL, and SQLite dialects.",
    available: true,
    badge: "New",
  },
  {
    href: "#",
    title: "Schema Validator",
    description:
      "Paste your Drizzle schema to check syntax, detect common issues, and get improvement suggestions.",
    available: false,
  },
  {
    href: "#",
    title: "Type Reference",
    description:
      "Quick lookup table for SQL types to Drizzle ORM types across PostgreSQL, MySQL, and SQLite.",
    available: false,
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ormlab",
  url: "https://ormlab.dev",
  description:
    "Free developer tools for Drizzle ORM — convert SQL schemas, Prisma schemas, and more.",
  publisher: {
    "@type": "Organization",
    name: "ormlab",
    url: "https://ormlab.dev",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <a href="/" className="text-xl font-bold text-gray-900">
                ormlab
              </a>
              <nav className="flex gap-6 text-sm text-gray-600">
                <a href="#tools" className="hover:text-gray-900">
                  Tools
                </a>
                <a
                  href="https://github.com/Dimonchik1710/ormlab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900"
                >
                  GitHub ↗
                </a>
              </nav>
            </div>
          </div>
        </div>

        {/* Hero */}
<section className="max-w-7xl mx-auto px-4 pt-16 pb-12 sm:px-6 lg:px-8 lg:pt-24 lg:pb-16">
  <div className="max-w-3xl mx-auto text-center">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
      Free tools for modern TypeScript ORMs
    </h1>
    <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
      Stop writing schema boilerplate. Convert SQL and Prisma schemas to Drizzle ORM in one click — free, open-source, and 100% in your browser.
    </p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <a
        href="/tools/sql-to-drizzle"
        className="px-6 py-3 text-sm font-medium text-white bg-gray-900 rounded-md
                   hover:bg-gray-800 transition-colors"
      >
        Try SQL → Drizzle
      </a>
      
      <a
        href="/tools/prisma-to-drizzle"
        className="px-6 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md
                   hover:bg-gray-50 transition-colors"
      >
        Try Prisma → Drizzle
      </a>
    </div>
  </div>
</section>

        {/* Tools grid */}
        <section id="tools" className="max-w-7xl mx-auto px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">
            Tools
          </h2>
          <p className="text-gray-600 mb-8 text-center">
            Everything you need to work with Drizzle ORM. No signup, no data collection.
          </p>

          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            {TOOLS.map((tool) => {
              const CardContent = (
                <div
                  className={`h-full p-6 border rounded-lg transition-colors ${
                    tool.available
                      ? "border-gray-200 bg-white hover:border-gray-900 hover:shadow-sm"
                      : "border-gray-200 bg-gray-50 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        tool.available ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {tool.title}
                    </h3>
                    {tool.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-900 text-white rounded">
                        {tool.badge}
                      </span>
                    )}
                    {!tool.available && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                        Soon
                      </span>
                    )}
                  </div>
                  <p
                    className={`text-sm leading-relaxed ${
                      tool.available ? "text-gray-600" : "text-gray-400"
                    }`}
                  >
                    {tool.description}
                  </p>
                  {tool.available && (
                    <p className="mt-4 text-sm font-medium text-gray-900">
                      Try it →
                    </p>
                  )}
                </div>
              );

              return tool.available ? (
                <a key={tool.title} href={tool.href} className="block">
                  {CardContent}
                </a>
              ) : (
                <div key={tool.title}>{CardContent}</div>
              );
            })}
          </div>
        </section>

        {/* Why this site */}
        <section className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
              Why ormlab
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Privacy first
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  All tools run 100% in your browser. Your schemas, SQL, and code never touch our servers. Verify it yourself in DevTools.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  No signup, no cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  No accounts to create, no tracking cookies. Just working tools that do one thing well.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Open-source
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Every tool is{" "}
                  <a
                    href="https://github.com/Dimonchik1710/ormlab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-900"
                  >
                    MIT-licensed on GitHub
                  </a>
                  . Read the code, fork it, contribute improvements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Articles teaser */}
        <section className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Guides & Articles
          </h2>
          <p className="text-gray-600 mb-8">
            In-depth walkthroughs for migrating, optimizing, and debugging Drizzle schemas.
          </p>
          <div className="p-8 border border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-gray-500">
              First articles coming soon — migration guides, Drizzle vs Prisma comparisons, and schema patterns.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">ormlab</h3>
                <p className="text-sm text-gray-600">
                  Free tools for modern TypeScript ORMs.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Tools</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a href="/tools/sql-to-drizzle" className="hover:text-gray-900">
                      SQL → Drizzle
                    </a>
                  </li>
                  <li>
                    <a href="/tools/prisma-to-drizzle" className="hover:text-gray-900">
                      Prisma → Drizzle
                    </a>
                  </li>
                  <li className="text-gray-400">Schema validator (soon)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a
                      href="https://orm.drizzle.team"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900"
                    >
                      Drizzle Docs ↗
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/drizzle-team/drizzle-orm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900"
                    >
                      Drizzle on GitHub ↗
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">About</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <a
                      href="https://github.com/Dimonchik1710/ormlab"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900"
                    >
                      Source code ↗
                    </a>
                  </li>
                  <li className="text-gray-400">Privacy (soon)</li>
                </ul>
              </div>
            </div>
            <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-gray-500">
                © 2026 ormlab.dev · Built with Next.js, deployed on Vercel
              </p>
              <p className="text-xs text-gray-400">
                Not affiliated with Drizzle Team or Prisma
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}