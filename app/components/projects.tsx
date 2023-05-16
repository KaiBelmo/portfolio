import projects from "@/data/projects.json";
import "@/assets/css/main.css";
import "@/assets/css/font.css";
import "@/assets/css/buttons.css";
import { openLink } from "@/assets/ts/utils";
import { ProjectItem } from "../interfaces/project";
import ProjectCard from "./projectCard";
import Image from "next/image";
export default function Projects() {
  return (
    <section className="md:relative z-20 md:h-screen w-full overflow-hidden max-md:overflow-visible bg-[#181a1b] max-md:bg-transparent text-white">
      <div className="container flex flex-col w-full h-full mx-auto max-xl:px-8">
        <div className="flex flex-row-reverse justify-between mt-24 mb-6 max-md:mt-5 max-lg:justify-center">
          <div className="w-[24%] max-lg:w-60">
            <div className="flex flex-col">
              <div className="flex items-center">
                <Image
                  className="rounded-full mr-3 border-[#444c56] max-md:border-[#dededf] border-solid border-2 shadow-[#cdd9e51a] shadow-sm"
                  src="/github_profile.jpg"
                  width="85"
                  height="85"
                  alt="my github profile picture"
                />
                <div className="pt-2 pb-3">
                  <h4 className="text-lg text-[#adbac7] max-md:text-[#1f2328] font-semibold">
                    凯 - kǎi
                  </h4>
                  <h5 className="font-light  text-sm text-[#768390] max-md:text-[#656d76]">
                    KaiBelmo
                  </h5>
                  <h5 className="font-normal text-sm text-[#bacadb] max-md:text-[#1f2328]">
                    kai is my virtual name.
                  </h5>
                </div>
              </div>
              <button
                className="github_btn"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  openLink(e, "https://github.com/KaiBelmo", "_blank");
                }}
              >
                Follow
              </button>
            </div>
          </div>
          <div className="flex items-center w-3/4 pr-5 max-xl:text-base max-lg:hidden">
            <p className="font-normal text-[#bacadb] max-md:text-[#212121] font-inter">
              Here are some of my personal/open source projects that you can
              access directly from Github. As a developer, you are welcome to
              contribute to these projects by making pull requests. <br />
              Your contributions are highly appreciated.
            </p>
          </div>
        </div>
        <div className="flex-1 pb-14">
          <div className="grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
            {projects.map((project: ProjectItem) => (
              <div key={project.name}>
                <ProjectCard
                  name={project.name}
                  technologies={project.technologies}
                  description={project.description}
                  githubRepo={project.githubRepo}
                  iconColor={project.iconColor}
                  borderColor={project.borderColor}
                ></ProjectCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
