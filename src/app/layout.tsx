import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeScript from "@/components/layout/ThemeScript";
import BuyMeCoffeeButton from "@/components/layout/BuyMeCoffeeButton";
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
  description:
    "Free online tools and guides for Drizzle, Prisma, and modern TypeScript ORMs. Convert schemas, visualize relations, migrate between ORMs.",
  keywords: ["drizzle orm", "prisma", "typescript orm", "orm tools", "sql to drizzle"],
  openGraph: {
    title: "ormlab — Free Tools for TypeScript ORMs",
    description: "Free online tools and guides for Drizzle, Prisma, and modern TypeScript ORMs.",
    url: "https://ormlab.dev",
    siteName: "ormlab",
    type: "website",
  },
  verification: {
    google: "jitWVo-t4WneiAVKotYx4do9bezll7IXHD4PmZvWfMk",
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        {children}
        <BuyMeCoffeeButton />
      </body>
    </html>
  );
}
