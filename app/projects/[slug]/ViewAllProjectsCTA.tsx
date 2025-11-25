// File: app/_components/ViewAllProjectsCTA.tsx
import Link from "next/link";

export default function ViewAllProjectsCTA() {
  return (
    <div className="mt-10 md:mt-5 text-center">
      <Link
        href="/projects"
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-black hover:bg-gray-800 transition-colors"
      >
        View All Projects
      </Link>
    </div>
  );
}