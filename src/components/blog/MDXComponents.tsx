import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function flattenChildren(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(flattenChildren).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    if (props?.children) return flattenChildren(props.children);
  }
  return "";
}

export const mdxComponents: MDXComponents = {
  h1: ({ children, ...props }: ComponentPropsWithoutRef<"h1">) => (
    <h1
      className="mt-12 mb-6 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => {
    const id = slugify(flattenChildren(children));
    return (
      <h2
        id={id}
        className="mt-14 mb-5 text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 scroll-mt-20"
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => {
    const id = slugify(flattenChildren(children));
    return (
      <h3
        id={id}
        className="mt-10 mb-3 text-xl sm:text-2xl font-semibold text-gray-900 scroll-mt-20"
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }: ComponentPropsWithoutRef<"h4">) => (
    <h4
      className="mt-8 mb-2 text-lg font-semibold text-gray-900"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<"p">) => (
    <p className="my-5 text-[17px] leading-[1.75] text-gray-700" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }: ComponentPropsWithoutRef<"a">) => {
    const isExternal = href?.startsWith("http");
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 transition-colors"
        {...props}
      >
        {children}
      </a>
    );
  },
  ul: ({ children, ...props }: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="my-5 ml-6 list-disc space-y-2 text-[17px] leading-[1.75] text-gray-700 marker:text-gray-400"
      {...props}
    >
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="my-5 ml-6 list-decimal space-y-2 text-[17px] leading-[1.75] text-gray-700 marker:text-gray-400"
      {...props}
    >
      {children}
    </ol>
  ),
  li: ({ children, ...props }: ComponentPropsWithoutRef<"li">) => (
    <li className="pl-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({
    children,
    ...props
  }: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-gray-900 bg-gray-50 px-5 py-3 text-gray-700 italic"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[0.9em] text-gray-900 before:content-none after:content-none"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg border border-gray-200 bg-[#0b1021] p-5 text-[14px] leading-[1.6] text-gray-100 shadow-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  hr: (props: ComponentPropsWithoutRef<"hr">) => (
    <hr className="my-10 border-gray-200" {...props} />
  ),
  table: ({ children, ...props }: ComponentPropsWithoutRef<"table">) => (
    <div className="my-8 overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-[15px]"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b-2 border-gray-300 bg-gray-50" {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }: ComponentPropsWithoutRef<"th">) => (
    <th
      className="px-4 py-3 text-sm font-semibold text-gray-900"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border-b border-gray-200 px-4 py-3 text-gray-700"
      {...props}
    >
      {children}
    </td>
  ),
  strong: ({ children, ...props }: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-gray-900" {...props}>
      {children}
    </strong>
  ),
};
