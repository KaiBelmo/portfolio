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

  return <ProjectDetailPageContent project={project} />;
}