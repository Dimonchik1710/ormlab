import type { Metadata } from "next";
import SqlToDrizzleClient from "./client";

export const metadata: Metadata = {
  title: "SQL to Drizzle ORM Converter — Free Online Tool | ormlab",
  description:
    "Convert PostgreSQL CREATE TABLE statements to Drizzle ORM schema instantly. Free, open-source, works in your browser. No sign-up, no data sent to server.",
  keywords: [
    "sql to drizzle",
    "sql to drizzle orm",
    "convert sql schema",
    "postgresql to drizzle",
    "drizzle schema generator",
    "sql drizzle converter",
  ],
  openGraph: {
    title: "SQL to Drizzle ORM Converter — Free Online Tool",
    description:
      "Convert PostgreSQL CREATE TABLE statements to Drizzle ORM schema instantly. Free, works in your browser.",
    url: "https://ormlab.dev/tools/sql-to-drizzle",
    siteName: "ormlab",
    type: "website",
  },
  alternates: {
    canonical: "https://ormlab.dev/tools/sql-to-drizzle",
  },
};

// JSON-LD structured data for SEO rich snippets
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "SQL to Drizzle ORM Converter",
  description:
    "Free online tool to convert SQL CREATE TABLE statements to Drizzle ORM TypeScript schema.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any (web-based)",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: "https://ormlab.dev/tools/sql-to-drizzle",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SqlToDrizzleClient />
    </>
  );
}