import { Suspense } from "react";
import { projects } from "@/data/projects";
import PageSkeleton from "@/app/_components/ui/PageSkeleton";
import ProjectIndex from "../_components/sections/ProjectIndex";

export default function ProjectsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectIndex projects={projects} totalProjects={projects.length} showViewAll={false} />
    </Suspense>
  );
}
