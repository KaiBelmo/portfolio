// File: app/_components/BackToProjectsLink.tsx
import Link from "next/link";

interface BackToProjectsLinkProps {
  href: string;
}

export default function BackToProjectsLink({ href }: BackToProjectsLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors mb-7 group"
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Back to Projects
    </Link>
  );
}