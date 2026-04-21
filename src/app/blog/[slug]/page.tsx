import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog";
import { mdxComponents } from "@/components/blog/MDXComponents";
import "../prism-theme.css";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const canonical = post.canonical ?? `https://ormlab.dev/blog/${post.slug}`;

  return {
    title: `${post.title} | ormlab`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical },
    openGraph: {
      title: post.title,
      description: post.description,
      url: canonical,
      siteName: "ormlab",
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const canonical = post.canonical ?? `https://ormlab.dev/blog/${post.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      "@type": "Organization",
      name: post.author ?? "ormlab",
      url: "https://ormlab.dev",
    },
    publisher: {
      "@type": "Organization",
      name: "ormlab",
      url: "https://ormlab.dev",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    keywords: post.keywords?.join(", "),
  };

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
              <Link href="/" className="text-xl font-bold text-gray-900">
                ormlab
              </Link>
              <nav className="flex gap-6 text-sm text-gray-600">
                <Link href="/#tools" className="hover:text-gray-900">
                  Tools
                </Link>
                <Link href="/blog" className="hover:text-gray-900">
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

        <article className="max-w-3xl mx-auto px-4 pt-12 pb-16 sm:px-6 lg:px-8 prose-blog">
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Back to blog
          </Link>

          <header className="mt-6 mb-10">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {formatDate(post.date)} · {post.readingTime} min read
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 leading-[1.15]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              {post.description}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  rehypeSlug,
                  [rehypePrism, { ignoreMissing: true }],
                ],
              },
            }}
          />
        </article>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
            <p className="text-xs text-gray-500">
              © 2026 ormlab.dev · Built with Next.js, deployed on Vercel
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
