// File: app/projects/[slug]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProjects, getProjectBySlug } from "@/data/projects";
import HoverLinkText from "@/app/_components/ui/hoverlinktext";
import dynamic from "next/dynamic";
import { Project } from "@/types/project";
import FeatureWithLinks from "./FeatureWithLinks";
import BackToProjectsLink from "./BackToProjectsLink";
import ProjectHeroLeft from "./ProjectHeroLeft";
import ProjectHeroRight from "./ProjectHeroRight";
import ProjectDemo from "./ProjectDemo";
import ViewAllProjectsCTA from "./ViewAllProjectsCTA";
import AnimationWrapper from "@/app/_components/AnimationWrapper";


export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

interface ProjectPageProps {
  params: { slug: string };
  searchParams?: { page?: string };
}

export default function ProjectDetailPage({ params, searchParams }: ProjectPageProps) {
  const project = getProjectBySlug(params.slug);
  if (!project) return notFound();

  const backPage = searchParams?.page ?? "1";
  const backHref = `/projects?page=${backPage}`;

  return (
    <AnimationWrapper pageKey={project.slug} className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 lg:mt-24 pb-10 md:pb-14">
        <BackToProjectsLink href={backHref} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-start">
          <ProjectHeroLeft project={project} />
          <ProjectHeroRight project={project} />
        </div>

        {project.typeOfProject !== "Open Source Contribution" && (
          <ProjectDemo project={project} />
        )}

        <ViewAllProjectsCTA />
      </div>
    </AnimationWrapper>
  );
}