// File: app/_components/ProjectHeroLeft.tsx
import HoverLinkText from "@/app/_components/ui/hoverlinktext";
import type { Project } from "@/types/project";
import FeatureWithLinks from "./FeatureWithLinks";

interface ProjectHeroLeftProps {
  project: Project;
}

export default function ProjectHeroLeft({ project }: ProjectHeroLeftProps) {
  return (
    <div className="space-y-3">
      <div className="block">
        <span className="inline-block px-3 py-1 text-sm font-medium bg-white rounded-full border border-gray-200 text-gray-700">
          {project.typeOfProject}
        </span>
      </div>
      <div className="pt-1">
        <HoverLinkText
          className="text-5xl font-bold text-gray-900 block"
          as="h1"
          href={project.link}
        >
          {project.name}
        </HoverLinkText>
      </div>

      <div className="flex flex-wrap gap-2">
        {project.category.map((c) => (
          <span
            key={c}
            className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full border border-gray-200"
          >
            {c}
          </span>
        ))}
      </div>

      <div className="pt-4">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Project Overview
        </h2>
        <p className="text-gray-600 leading-relaxed mb-5">
          {project.description}
        </p>

        {project.features && project.features.length > 0 && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
              {project.typeOfProject !== "Open Source Contribution"
                ? "Features"
                : "Contributions"}
            </h3>
            <ul className="space-y-2 pl-5 list-disc">
              {project.features.map((feature, index) => (
                <li
                  key={index}
                  className="text-gray-700 pl-1 -indent-2.5"
                >
                  <FeatureWithLinks
                    feature={feature}
                    githubLink={project.githubLink}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}