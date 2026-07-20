import { Suspense } from "react";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import PageSkeleton from "@/app/_components/ui/PageSkeleton";
import ProjectIndex from "../_components/sections/ProjectIndex";

export const metadata: Metadata = {
  title: "Projects | Kai Belmo",
  description: "Selected software engineering projects, open-source contributions, developer tools, and systems experiments by Kai Belmo.",
  alternates: { canonical: "/projects" },
};

export default function ProjectsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectIndex projects={projects} totalProjects={projects.length} showViewAll={false} />
    </Suspense>
  );
}
