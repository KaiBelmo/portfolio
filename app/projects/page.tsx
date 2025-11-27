"use client";
import Link from "next/link";
import { useState, useEffect, useMemo, Suspense, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ProjectCard from "@/app/_components/ui/projectCard";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectsStore } from "@/app/store/useProjectStore";
import AnimationWrapper from "@/app/_components/AnimationWrapper";

// Animation variants for the projects list
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Reduced stagger for quicker sequence
      delayChildren: 0, // Small initial delay
      when: "beforeChildren", // Ensure parent animates first
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1, // Reverse order on exit
      when: "afterChildren", // Animate children first on exit
    },
  },
};

// Animation variants for individual project items
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98, // Slight scale down when hidden
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 200,
      mass: 0.5,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

// Get all unique project types
type ProjectType = string;
function ProjectsPageContent() {
  const { projects, isItFetched, fetchStars } = useProjectsStore();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const hasMounted = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get initial page from URL instantly (no default 1 flash)
  const initialPage = (() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return isNaN(p) ? 1 : p;
  })();

  const [currentPage, setCurrentPage] = useState<number>(initialPage);

  // Prevent animation only on first render
  useEffect(() => {
    hasMounted.current = true;
    return () => {
      hasMounted.current = false;
    };
  }, []);

  // Fetch stars on mount
  useEffect(() => {
    if (!isItFetched) fetchStars();
  }, [isItFetched, fetchStars]);

  // Sync URL changes (Back/Forward navigation)
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    if (page !== currentPage && !isNaN(page)) {
      setCurrentPage(page);
    }
  }, [searchParams]);

  const [selectedType, setSelectedType] = useState<ProjectType | "all">("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const projectsPerPage = 3;
  // Get all unique project types
  const allProjectTypes = useMemo(
    () => Array.from(new Set(projects.map((project) => project.typeOfProject))),
    [projects]
  );
  // Filter projects based on selected type
  const filteredProjects = useMemo(() => {
    return selectedType === "all"
      ? projects
      : projects.filter((project) => project.typeOfProject === selectedType);
  }, [selectedType, projects]);

  // closes dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);
  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Handle page change with URL update
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    window.history.pushState(null, "", `?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <AnimationWrapper pageKey={`${pathname}?page=${currentPage}`}>
      <AnimatePresence mode="wait">
        <motion.main
          key={currentPage}
          className="container mx-auto px-4 sm:px-6 py-8 sm:py-12"
          // Prevents initial flicker page=1 → page=3
          initial={hasMounted.current ? { opacity: 0, y: 25 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -25 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-14 md:mt-6">
            <motion.h1
              className="text-3xl md:text-4xl font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {selectedType === "all" ? "All Projects" : `${selectedType}s`}
            </motion.h1>
            <motion.div
              ref={dropdownRef}
              className="relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.1,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
            >
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="w-full md:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2.5
                text-left text-gray-700 hover:border-gray-400 shadow-sm flex items-center
                justify-between transition-all duration-200"
              >
                <span>
                  {selectedType === "all" ? "All Project Types" : selectedType}
                </span>
                <motion.svg
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-4 w-4 text-gray-500 ml-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </motion.svg>
              </button>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="absolute mt-2 w-full md:w-[200px] bg-white rounded-lg shadow-xl z-20 overflow-hidden border border-gray-200"
                  >
                    <li
                      onClick={() => {
                        setSelectedType("all");
                        setDropdownOpen(false);
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700"
                    >
                      All Project Types
                    </li>
                    {allProjectTypes.map((type) => (
                      <li
                        key={type}
                        onClick={() => {
                          setSelectedType(type);
                          setDropdownOpen(false);
                          setCurrentPage(1);
                        }}
                        className="px-4 py-2.5 hover:bg-gray-100 cursor-pointer text-gray-700"
                      >
                        {type}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
          <motion.p
            className="text-gray-600 mt-2"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                delay: 0.2,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
          >
            Showing {filteredProjects.length === 0 ? 0 : startIndex + 1}-
            {Math.min(endIndex, filteredProjects.length)} of{" "}
            {filteredProjects.length}{" "}
            {selectedType === "all"
              ? "projects"
              : `${selectedType.toLowerCase()} projects`}
          </motion.p>
          <div className="flex flex-col gap-4 md:gap-10 my-8">
            {currentProjects.length === 0 ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
              >
                <p className="text-gray-500 text-lg">
                  No projects found matching the selected type.
                </p>
                <button
                  onClick={() => setSelectedType("all")}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="space-y-4 md:space-y-10"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                >
                  {currentProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      variants={itemVariants}
                      layout // keeps layout animations smooth if ProjectCard uses layout prop
                    >
                      <ProjectCard
                        projectInfo={project}
                        index={startIndex + index}
                        layout="alternate"
                        currentPage={currentPage}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>

          {totalPages > 1 && (
            <motion.div
              className="flex flex-wrap justify-center items-center gap-2 mt-6 sm:mt-8 px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: {
                  delay: 0.3,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
            >
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  } min-w-[36px] text-center`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </motion.div>
          )}

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: {
                delay: 0.4,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              },
            }}
          >
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="mr-2 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Home
            </Link>
          </motion.div>
        </motion.main>
      </AnimatePresence>
    </AnimationWrapper>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <ProjectsPageContent />
    </Suspense>
  );
}
