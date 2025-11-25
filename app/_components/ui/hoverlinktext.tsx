import { Link as LinkIcon } from "lucide-react";
import { ElementType, ReactNode } from "react";

interface HoverLinkTextProps<T extends ElementType = "span"> {
  href?: string;
  text?: string;
  className?: string;
  as?: T;
  children?: ReactNode;
  githubLink?: string;
}

export default function HoverLinkText<T extends ElementType = "span">({
  href,
  text,
  className,
  as,
  children,
  githubLink,
  ...props
}: HoverLinkTextProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Tag = as || "span";
  const content = children || text;
  const finalHref = href || githubLink;

  const renderContent = () => {
    if (!githubLink) return content;
    
    const prRegex = /#(\d+)/g;
    const parts = String(content).split(prRegex);
    const matches = Array.from(String(content).matchAll(prRegex));
    
    if (matches.length === 0) return content;
    
    return parts.map((part, index) => {
      if (index < matches.length) {
        const prNumber = matches[index][1];
        return (
          <span key={index}>
            {part}
            <a 
              href={`${githubLink}/pull/${prNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              #{prNumber}
            </a>
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Tag 
      className={`group relative inline-flex items-center gap-2 ${className || ""}`}
      {...props}
    >
      <span className="leading-snug">{renderContent()}</span>

      {finalHref && (
        <a
          href={finalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-gray-400"
          aria-label="Open link"
        >
          <LinkIcon size={18} />
        </a>
      )}
    </Tag>
  );
}
