import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ormlab — Free Tools for TypeScript ORMs",
  description: "Free online tools and guides for Drizzle, Prisma, and modern TypeScript ORMs. Convert schemas, visualize relations, migrate between ORMs.",
  keywords: ["drizzle orm", "prisma", "typescript orm", "orm tools", "sql to drizzle"],
  openGraph: {
    title: "ormlab — Free Tools for TypeScript ORMs",
    description: "Free online tools and guides for Drizzle, Prisma, and modern TypeScript ORMs.",
    url: "https://ormlab.dev",
    siteName: "ormlab",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
