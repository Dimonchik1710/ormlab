import type { Metadata } from "next";
import TypeReferenceClient from "./client";

export const metadata: Metadata = {
  title: "Drizzle ORM Type Reference — PostgreSQL, MySQL, SQLite | ormlab",
  description:
    "Interactive Drizzle ORM type reference. Look up every column builder, its SQL equivalent, and inferred TypeScript type across PostgreSQL, MySQL, and SQLite. Click to copy.",
  keywords: [
    "drizzle orm types",
    "drizzle column types",
    "drizzle type reference",
    "drizzle sql types",
    "drizzle postgres types",
    "drizzle mysql types",
    "drizzle sqlite types",
    "pgTable types",
    "mysqlTable types",
    "sqliteTable types",
  ],
  alternates: {
    canonical: "https://ormlab.dev/tools/type-reference",
  },
  openGraph: {
    title: "Drizzle ORM Type Reference — PostgreSQL, MySQL, SQLite",
    description:
      "Searchable reference for every Drizzle column type with SQL and TypeScript mappings. Click-to-copy, runs 100% in your browser.",
    url: "https://ormlab.dev/tools/type-reference",
    siteName: "ormlab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drizzle ORM Type Reference",
    description:
      "Every Drizzle column type, its SQL equivalent, and TypeScript type — searchable and copy-ready.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Drizzle ORM Type Reference",
  description:
    "Interactive reference table for Drizzle ORM column types across PostgreSQL, MySQL, and SQLite.",
  url: "https://ormlab.dev/tools/type-reference",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "ormlab",
    url: "https://ormlab.dev",
  },
};

export default function TypeReferencePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TypeReferenceClient />
    </>
  );
}
