import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { SanityBlock } from "@/lib/sanity/queries";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");
      return (
        <a href={href} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
          {children}
        </a>
      );
    },
  },
};

export function PortableContentRenderer({ value }: { value?: SanityBlock[] | null }) {
  if (!value?.length) return null;

  return (
    <div className="portable-content">
      <PortableText value={value} components={components} />
    </div>
  );
}
