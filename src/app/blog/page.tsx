import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <Header />

      <section className="max-w-3xl mx-auto px-4 pt-16 pb-8 sm:px-6 lg:px-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Blog
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
          Deep dives on Drizzle ORM, schema design, and the messy reality of
          migrating between TypeScript ORMs.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-20 sm:px-6 lg:px-8">
        {posts.length === 0 ? (
          <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-gray-500 dark:text-gray-400">
            No posts yet. Check back soon.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800 border-t border-b border-gray-200 dark:border-gray-800">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="block py-8 group"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {formatDate(post.date)} · {post.readingTime} min read
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100 group-hover:underline">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {post.description}
                  </p>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded"
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

      <Footer />
    </main>
  );
}
