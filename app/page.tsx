"use client";

import { useState, useEffect, WheelEvent } from "react";
import { scrollToElement } from "@/assets/ts/utils";
import { Section } from "./interfaces/section";
import { isMobile } from "@/assets/ts/utils";
import Whoami from "@/app/components/whoami";
import Navbar from "@/app/components/navbar";
import Contact from "@/app/components/contact";
import Projects from "@/app/components/projects";
import "@/assets/css/main.css";

const sections: Section[] = [
  { name: "whoami", domElement: null, component: Whoami },
  { name: "projects", domElement: null, component: Projects },
  { name: "contact", domElement: null, component: Contact },
];

export default function Home() {
  const [activeSectionIndex, setActiveSectionIndex] = useState<number>(0);
  const [wheelEventExecuted, setWheelEventExecuted] = useState<boolean>(false);
  const [isMobileDevice, setIsMobileDevice] = useState(isMobile());
  useEffect(() => {
    if (history.scrollRestoration) {
      history.scrollRestoration = "manual";
    } else {
      window.onbeforeunload = function () {
        window.scrollTo(0, 0);
      };
    }
    sections.forEach((section) => {
      section.domElement = document.querySelector(`#${section.name}`);
    });

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResize = () => {
    setIsMobileDevice(isMobile());
  };

  const scrollToSection = (direction: "up" | "down") => {
    let targetSectionIndex = activeSectionIndex;

    if (direction === "up" && activeSectionIndex > 0) {
      targetSectionIndex--;
    } else if (
      direction === "down" &&
      activeSectionIndex < sections.length - 1
    ) {
      targetSectionIndex++;
    }
    const targetSection = sections[targetSectionIndex];
    scrollToElement(targetSection.domElement, 1700);
    setActiveSectionIndex(targetSectionIndex);
  };

  const handleWheel = (e: WheelEvent<HTMLElement>): void => {
    let direction: "up" | "down" | null = null;
    if (!wheelEventExecuted) {
      if (e.deltaY < 0) {
        direction = "up";
        setActiveSectionIndex(
          activeSectionIndex > 0 ? activeSectionIndex - 1 : 0
        );
      } else if (e.deltaY > 0) {
        direction = "down";
        setActiveSectionIndex(
          activeSectionIndex < sections.length - 1
            ? activeSectionIndex + 1
            : sections.length - 1
        );
      } else {
        direction = null;
      }
      setWheelEventExecuted(true);
      setTimeout(() => {
        setWheelEventExecuted(false);
      }, 2000);
    }
    if (direction !== null) {
      e.preventDefault();
      scrollToSection(direction);
    }
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const targetSection = sections.find(
      (section) =>
        `#${section.name}` === event.currentTarget.getAttribute("href")
    );
    if (targetSection !== undefined) {
      scrollToElement(targetSection.domElement, 1200);
      setActiveSectionIndex(sections.indexOf(targetSection as Section));
    }
  };

  const handleDotClick = (index: number = 2) => {
    scrollToElement(sections[index].domElement, 1400);
    setActiveSectionIndex(index);
  };
  const dots = Array(sections.length)
    .fill(null)
    .map((_, index) => (
      <div
        key={index}
        className={`dot ${index === activeSectionIndex ? "active-dot" : ""}`}
        onClick={() => handleDotClick(index)}
      ></div>
    ));

  return (
    <>
      <Navbar handleLinkClick={handleLinkClick}></Navbar>
      <div
        className={`dots ${
          sections[activeSectionIndex].name === "projects" ? "invert" : ""
        }`}
      >
        {dots}
      </div>
      <main tabIndex={0} onWheel={isMobileDevice ? undefined : handleWheel}>
        {sections.map((section) => {
          const ChosenComponent = section.component;
          return (
            <section key={section.name} id={section.name}>
              <ChosenComponent />
            </section>
          );
        })}
      </main>
    </>
  );
}
