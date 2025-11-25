// File: app/_components/ProjectDemo.tsx
import dynamic from "next/dynamic";
import { Project } from "@/types/project";

// Dynamically import AsciinemaPlayer with no SSR
const AsciinemaPlayer = dynamic(
  () => import("@/app/_components/ui/AsciinemaPlayer"),
  { ssr: false }
);

interface ProjectDemoProps {
  project: Project;
}

export default function ProjectDemo({ project }: ProjectDemoProps) {
  return (
    <section className="hidden md:block mt-10 md:mt-14 bg-white/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 rounded-full bg-red-400"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <h2 className="ml-4 text-xl font-semibold text-gray-800 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          See It in Action
        </h2>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200 shadow-inner bg-gray-900">
        <AsciinemaPlayer
          src={`/casts/${project.asciinemaId}.cast`}
          coverSeconds={project.coverSeconds}
          className="w-full"
        />
      </div>
    </section>
  );
}