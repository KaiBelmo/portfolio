"use client";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Star } from "lucide-react";
import type { Project } from "@/types/project";
import dynamic from "next/dynamic";
import PlayerWrapper from "./PlayerWrapper";
import { useRef } from "react";

// Dynamically import the AsciinemaPlayer with no SSR
const AsciinemaPlayer = dynamic(() => import("./AsciinemaPlayer"), {
  ssr: false,
});

interface ProjectCardProps {
  projectInfo: Project;
  index: number;
  layout?: "right" | "left" | "alternate";
  currentPage?: number; // <-- NEW
}

export default function ProjectCard({
  projectInfo,
  index,
  layout = "alternate",
  currentPage = 1, // <-- DEFAULT
}: ProjectCardProps) {
  const {
    name,
    description,
    category,
    typeOfProject,
    date,
    slug,
    asciinemaId,
    stars,
  } = projectInfo;

  const router = useRouter();

  const shouldReverse =
    layout === "alternate" ? index % 2 === 1 : layout === "left";

  const ref = useRef(null);

  const formatK = (n: number) =>
    n < 1000 ? n : (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";

  // ⭐ FIX: Navigate with page param preserved
  const handleClick = () => {
    router.push(`/projects/${slug}?page=${currentPage}`);
  };

  return (
    <div
      ref={ref}
      onClick={handleClick}
      className="group relative border-t border-gray-100 py-8 px-5 md:py-10 md:px-9 bg-white hover:bg-gray-50 shadow-sm sm:shadow-lg rounded-xl cursor-pointer active:scale-[0.99] sm:active:scale-100 transition-all"
    >
      <div className="w-full">
        <div
          className={`flex flex-col ${
            shouldReverse ? "lg:flex-row-reverse" : "lg:flex-row"
          } gap-8 lg:gap-12`}
        >
          {/* Text */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-medium text-gray-900 group-hover:underline decoration-1 underline-offset-4">
                  {name}
                </h3>
                <ArrowUpRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 flex-shrink-0" />
              </div>

              {stars && (
                <div className="flex items-center gap-1 bg-gray-100/70 border px-2.5 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-gray-400 text-gray-400" />
                  <span>{formatK(parseInt(stars))}</span>
                </div>
              )}
            </div>

            <div className="text-gray-600 text-base leading-relaxed line-clamp-3" title={description}>
              {description}
            </div>

            {/* Categories */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {category.map((el) => (
                <span
                  key={el}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full border border-gray-200/60"
                >
                  {el}
                </span>
              ))}
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-400 pt-2 flex items-center gap-0.5 md:gap-2">
              <span className="font-medium text-gray-500">{typeOfProject}</span>
              <span className="text-gray-300">•</span>
              <span>{date}</span>
            </div>
          </div>

          {/* Media */}
          <div className="w-full lg:w-3/5 h-auto min-h-[200px] hidden md:block">
            {typeOfProject === "Open Source Contribution" ? (
              <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-center space-y-4 p-8">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-50 text-blue-600 mb-2 border border-blue-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-7 h-7"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                      <path d="M9 18c-4.51 2-5-2-7-2"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      Open Source Contribution
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      Contributed to{" "}
                      <span className="font-medium text-gray-700">{name}</span>
                    </p>
                  </div>
                  {projectInfo.githubLink && (
                    <a
                      href={projectInfo.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline mt-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on GitHub{" "}
                      <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <PlayerWrapper className="w-full transition-all duration-300 group-hover:opacity-90 group-hover:scale-[1.01]">
                <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-900 shadow-lg">
                  <AsciinemaPlayer
                    src={`/casts/${asciinemaId}.cast`}
                    className="w-full"
                    coverSeconds={projectInfo.coverSeconds}
                  />
                </div>
              </PlayerWrapper>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
