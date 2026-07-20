"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { Project } from "@/types/project";
import { GithubIcon } from "@/app/contact/contactData";
import ProjectVisual from "../../ui/ProjectVisual";
import SystemFrame from "../../system/SystemFrame";
import RecordHeader from "../../system/RecordHeader";
import DataRow from "../../system/DataRow";
import { actionLabel, iconActionClass, isOpenSource, projectActionClass, projectHref } from "./constants";
import { stateAnimationEase } from "../../ui/stateAnimations";

export default function RecordPreview({ project }: { project: Project }) {
  const reduceMotion = !!useReducedMotion();
  const openSource = isOpenSource(project);
  const projectGithubIcon = (
    <span className="[&>svg]:size-4">{GithubIcon}</span>
  );

  return (
    <motion.aside
      key={project.id}
      className="sticky top-[100px] w-full overflow-hidden border border-sys-line-strong tablet:hidden"
      aria-label={`${project.name} preview`}
      initial={reduceMotion ? false : { opacity: 0.72 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.16, ease: stateAnimationEase }}
    >
      <SystemFrame title="RECORD PREVIEW" classification={project.classification || "CONFIDENTIAL"}>
        <div className={`relative overflow-hidden border-b border-sys-line bg-sys-bg frame-${project.visualType}`}>
          <ProjectVisual project={project} priority />
        </div>
        <div className="p-[22px]">
          <RecordHeader
            id={project.id}
            name={project.name}
            category={project.projectType || ""}
            date={project.date}
            description={project.description}
          />
          {openSource && (
            <dl className="flex flex-col gap-1">
              <DataRow label="My Contribution" value={project.homepageEvidence} stacked noUppercase />
              {project.pullRequests && project.pullRequests.length > 0 && (
                <div className="py-2">
                  <span className="block font-display text-[0.65rem] uppercase tracking-wider text-sys-muted mb-2">
                    Pull Requests ({project.pullRequests.length})
                  </span>
                  <ul className="flex flex-col gap-1">
                    {project.pullRequests.map((pr) => (
                      <li key={pr.number}>
                        <a
                          href={pr.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-baseline justify-between gap-2 text-xs hover:text-sys-signal hover:underline transition-colors"
                        >
                          <span className="font-display text-sys-signal">{pr.number}</span>
                          {pr.title && (
                            <span className="min-w-0 flex-1 text-right text-sys-cream/70 text-[0.68rem] [overflow-wrap:anywhere]">
                              {pr.title}
                            </span>
                          )}
                          <span className="ml-auto text-sys-muted text-[0.65rem] shrink-0">open</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </dl>
          )}
          <div className={`flex gap-2 ${openSource ? "mt-4" : "mt-3"}`}>
            <a className={projectActionClass} href={projectHref(project)} target="_blank" rel="noreferrer">
              {actionLabel(project)}
              <ExternalLink size={14} aria-hidden="true" />
            </a>
            {project.link && !openSource ? (
              <a
                className={iconActionClass}
                href={project.githubLink}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} GitHub repository`}
              >
                {projectGithubIcon}
              </a>
            ) : null}
          </div>
        </div>
      </SystemFrame>
    </motion.aside>
  );
}
