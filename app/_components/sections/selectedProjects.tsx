import ProjectCard from "@/app/_components/ui/projectCard";
import { Project } from "@/types/project";
import Link from "next/link";

interface SelectedProjectsProps {
  selectedProjects: Array<Project>;
}

export default function SelectedProjects({ selectedProjects }: SelectedProjectsProps) {
  return (
    <section id="projects" className="mb-0 md:mb-36 container mx-auto px-6">
      <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4 md:mb-12">
        Selected projects
      </h2>
      
      <div className="flex flex-col gap-4 md:gap-10">
        {selectedProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            projectInfo={project}
            index={index}
            layout="right"
          />
        ))}
      </div>

      {/* View All Projects Button */}
      <div className="flex justify-center mt-12 md:mt-16">
        <Link
          href="/projects"
          className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm md:text-base"
        >
          View All Projects
          <svg
            className="ml-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}