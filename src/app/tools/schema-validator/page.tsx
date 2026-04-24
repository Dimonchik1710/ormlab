import type { Metadata } from "next";
import SchemaValidatorClient from "./client";

export const metadata: Metadata = {
  title: "Drizzle Schema Validator — Free Online Tool | ormlab",
  description:
    "Validate your Drizzle ORM schema for missing primary keys, broken relations, duplicate names, and type mismatches. Free, open-source, runs entirely in your browser.",
  keywords: [
    "drizzle schema validator",
    "drizzle orm validator",
    "drizzle schema linter",
    "drizzle schema check",
    "drizzle primary key check",
    "drizzle relations validator",
    "typescript orm validator",
  ],
  alternates: {
    canonical: "https://ormlab.dev/tools/schema-validator",
  },
  openGraph: {
    title: "Drizzle Schema Validator — Free Online Tool",
    description:
      "Paste your Drizzle schema and instantly catch missing primary keys, type-mismatched relations, and other common bugs.",
    url: "https://ormlab.dev/tools/schema-validator",
    siteName: "ormlab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Drizzle Schema Validator",
    description:
      "Validate Drizzle ORM schemas instantly. Free and open-source.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Drizzle Schema Validator",
  description:
    "Free online tool to validate Drizzle ORM schemas. Detects missing primary keys, broken relations, duplicate names, and type mismatches.",
  url: "https://ormlab.dev/tools/schema-validator",
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

export default function SchemaValidatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SchemaValidatorClient />
    </>
  );
}
