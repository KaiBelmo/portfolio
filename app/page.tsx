"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Whoami from "./_components/sections/whoami";
import SelectedProjects from "./_components/sections/selectedProjects";
import Contact from "./_components/sections/contact";
import { useProjectsStore } from "@/app/store/useProjectStore";
import AnimationWrapper from "./_components/AnimationWrapper";

export default function Home() {
  const pathname = usePathname();
  const { projects, getSelectedProjects, fetchStars, isItFetched } = useProjectsStore();

  useEffect(() => {
    if (!isItFetched) fetchStars();
    console.log(projects);
  }, [isItFetched, fetchStars]);

  return (
    <AnimationWrapper pageKey={pathname}>
      <Whoami />
      <SelectedProjects selectedProjects={getSelectedProjects(3)} />
      <Contact />
    </AnimationWrapper>
  );
}