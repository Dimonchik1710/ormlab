import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
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
      <main className="min-h-screen bg-white dark:bg-gray-950">
        <Header />

        <article className="max-w-3xl mx-auto px-4 pt-12 pb-16 sm:px-6 lg:px-8 prose-blog">
          <Link
            href="/blog"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            ← Back to blog
          </Link>

          <header className="mt-6 mb-10">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {formatDate(post.date)} · {post.readingTime} min read
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100 leading-[1.15]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {post.description}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded"
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

        <Footer />
      </main>
    </>
  );
}
