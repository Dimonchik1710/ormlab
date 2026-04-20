import type { Metadata } from "next";
import PrismaToDrizzleClient from "./client";

export const metadata: Metadata = {
  title: "Prisma to Drizzle ORM Converter — Free Online Tool | ormlab",
  description:
    "Convert your Prisma schema to Drizzle ORM TypeScript code instantly. Free, open-source, works 100% in your browser. Supports PostgreSQL, MySQL, and SQLite.",
  keywords: [
    "prisma to drizzle",
    "prisma to drizzle orm",
    "prisma to drizzle converter",
    "migrate prisma to drizzle",
    "prisma drizzle migration",
    "schema.prisma to drizzle",
    "prisma schema converter",
    "drizzle orm migration",
    "typescript orm converter",
  ],
  alternates: {
    canonical: "https://ormlab.dev/tools/prisma-to-drizzle",
  },
  openGraph: {
    title: "Prisma to Drizzle ORM Converter — Free Online Tool",
    description:
      "Paste your schema.prisma and get ready-to-use Drizzle ORM TypeScript code. Free, open-source, works entirely in your browser.",
    url: "https://ormlab.dev/tools/prisma-to-drizzle",
    siteName: "ormlab",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prisma to Drizzle ORM Converter",
    description:
      "Convert Prisma schemas to Drizzle ORM code instantly. Free and open-source.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Prisma to Drizzle ORM Converter",
  description:
    "Free online tool to convert Prisma schema files to Drizzle ORM TypeScript code. Supports PostgreSQL, MySQL, and SQLite.",
  url: "https://ormlab.dev/tools/prisma-to-drizzle",
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

export default function PrismaToDrizzlePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PrismaToDrizzleClient />
    </>
  );
}