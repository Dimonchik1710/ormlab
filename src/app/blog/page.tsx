import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog — Drizzle & Prisma Guides | ormlab",
  description:
    "In-depth articles on migrating, optimizing, and debugging Drizzle ORM schemas. Prisma vs Drizzle, performance tips, and real-world TypeScript ORM patterns.",
  keywords: [
    "drizzle orm blog",
    "prisma to drizzle",
    "drizzle vs prisma",
    "typescript orm guides",
    "drizzle migration guide",
  ],
  alternates: {
    canonical: "https://ormlab.dev/blog",
  },
  openGraph: {
    title: "ormlab Blog — Drizzle & Prisma Guides",
    description:
      "Practical guides on Drizzle ORM, schema migrations, and modern TypeScript ORMs.",
    url: "https://ormlab.dev/blog",
    siteName: "ormlab",
    type: "website",
  },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-gray-900">
              ormlab
            </Link>
            <nav className="flex gap-6 text-sm text-gray-600">
              <Link href="/#tools" className="hover:text-gray-900">
                Tools
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium">
                Blog
              </Link>
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

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900">
          Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 leading-relaxed">
          Deep dives on Drizzle ORM, schema design, and the messy reality of
          migrating between TypeScript ORMs.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
            No posts yet. Check back soon.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block py-8 group"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {formatDate(post.date)} · {post.readingTime} min read
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900 group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-gray-600 leading-relaxed">
                    {post.description}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            © 2026 ormlab.dev · Built with Next.js, deployed on Vercel
          </p>
        </div>
      </footer>
    </main>
  );
}
