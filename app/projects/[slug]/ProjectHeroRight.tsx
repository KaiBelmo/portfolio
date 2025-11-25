// File: app/_components/ProjectHeroRight.tsx
import Image from "next/image";
import type { Project } from "@/types/project";

interface ProjectHeroRightProps {
  project: Project;
}

export default function ProjectHeroRight({ project }: ProjectHeroRightProps) {
  return (
    <div className="space-y-4 mt-6 md:mt-0">
      {project.imageLink && (
        <div className="relative w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl border border-gray-200 transform transition-all hover:scale-[1.02]">
          <Image
            src={project.imageLink}
            alt={`${project.name} showcase`}
            fill
            className={`object-cover ${project.imagePosition === "left"
              ? "object-left"
              : project.imagePosition === "right"
                ? "object-right"
                : "object-center"
              }`}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-6">
            <span className="text-white text-sm font-medium">
              {new Date(project.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      )}
      {project.githubLink && (
        <a
          href={project.githubLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg
            className="w-6 h-6 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          View on GitHub
        </a>
      )}
    </div>
  );
}