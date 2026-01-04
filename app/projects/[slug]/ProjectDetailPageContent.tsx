'use client';

import { useSearchParams } from "next/navigation";
import { Project } from "@/types/project";
import BackToProjectsLink from "./BackToProjectsLink";
import ProjectHeroLeft from "./ProjectHeroLeft";
import ProjectHeroRight from "./ProjectHeroRight";
import ProjectDemo from "./ProjectDemo";
import ViewAllProjectsCTA from "./ViewAllProjectsCTA";
import AnimationWrapper from "@/app/_components/AnimationWrapper";
import { memo } from "react";

interface ProjectDetailPageContentProps {
  project: Project;
}

export const ProjectDetailPageContent = memo(function ProjectDetailPageContent({ project }: ProjectDetailPageContentProps) {
  const searchParams = useSearchParams();
  const backPage = searchParams?.get('page') || '1';
  const backHref = `/projects?page=${backPage}`;

  return (
    <AnimationWrapper pageKey={project.slug} className="min-h-screen">
      <div className="container mx-auto px-7 mt-20 lg:mt-24 pb-10 md:pb-14">
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
});
