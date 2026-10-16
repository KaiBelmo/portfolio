import { Suspense } from "react";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { pageMetadata } from "@/lib/seo";
import PageSkeleton from "@/app/_components/ui/PageSkeleton";
import ProjectIndex from "../_components/sections/ProjectIndex";

export const metadata: Metadata = pageMetadata({
  title: "Projects | Kai Belmo",
  description: "Selected software engineering projects, open-source contributions, developer tools, and systems experiments by Kai Belmo.",
  path: "/projects",
});

// ProjectIndex reads the filter query with useSearchParams. On a statically
// prerendered page that bails out to the Suspense fallback, so crawlers only
// saw the skeleton. Awaiting searchParams renders the list on the server.
export default async function ProjectsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await searchParams;

  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProjectIndex projects={projects} totalProjects={projects.length} showViewAll={false} />
    </Suspense>
  );
}
