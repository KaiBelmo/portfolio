import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/data/projects";
import AnimationWrapper from "@/app/_components/AnimationWrapper";
import { Suspense } from "react";
import { ProjectDetailPageContent } from "@/app/projects/[slug]/ProjectDetailPageContent";

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectDetailPage({ 
  params 
}: { 
  params: { 
    slug: string;
  } 
}) {
  const project = getProjectBySlug(params.slug);
  
  if (!project) {
    notFound();
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <div className="animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-24">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ProjectDetailPageContent project={project} />
    </Suspense>
  );
}