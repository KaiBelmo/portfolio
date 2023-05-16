import { ProjectItem } from "@/app/interfaces/project";
import { openLink } from "@/assets/ts/utils";

export default function projectCard({
  name,
  technologies,
  description,
  githubRepo,
  iconColor,
  borderColor,
}: ProjectItem) {
  return (
    <>
      <div className="font-medium font-inter bg-transparent px-5 py-4 border-2 border-[#30363d] max-md:border-[#d0d7de] border-solid rounded-md w-full">
        <h3 className="text-[#5392f9] max-md:text-[#0969da] flex items-center">
          <span className="repo_logo"></span>
          <span
            className="ml-1 cursor-pointer max-lg:text-sm"
            onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
              openLink(e, githubRepo, "_blank");
            }}
          >
            {name}
          </span>
        </h3>
        <p className="font-normal text-sm mt-1.5 max-lg:h-5 overflow-y-auto max-md:text-sm text-[#98a2ae] max-md:text-[#656d76]">
          {description}
        </p>
        <div className="flex items-center mt-2 font-normal text-xs max-lg:text-xs text-[#98a2ae] max-md:text-[#656d76]">
          <div
            className="w-3 h-3 mr-1 border-white rounded-full"
            style={{
              backgroundColor: iconColor,
              border: "1px solid",
              borderColor: borderColor,
            }}
          ></div>
          <div>{technologies}</div>
        </div>
      </div>
    </>
  );
}
