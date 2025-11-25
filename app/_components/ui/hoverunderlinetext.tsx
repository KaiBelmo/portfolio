import Link from 'next/link';

interface HoverUnderlineProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
}

export default function HoverUnderline({ children, href = '#', className }: HoverUnderlineProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative inline-block group ${className}`}
    >
      <span>{children}</span>
      <span
        className="absolute left-0 -bottom-0.5 w-0 h-[2px] bg-current transition-all duration-300 group-hover:w-full"
      />
    </Link>
  );
}

