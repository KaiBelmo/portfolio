import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "voidgen",
    slug: "voidgen",
    name: "VoidGen",
    link: "",
    githubLink: "https://github.com/KaiBelmo/VoidGen",
    category: [
      "TypeScript",
      "Mock API",
      "REST API"
    ],
    typeOfProject: "Personal Project",
    date: "2025-12-01",
    description: "VoidGen is a lightweight, configurable mock API server that generates RESTful endpoints from JSON and other structured data formats. It is designed for frontend development, testing, rapid prototyping, and any scenario where you need a reliable API without building a full backend.",
    features: [
      "Instant REST API from JSON files (additional data formats planned).",
      "Supports both singleton and collection resources.",
      "In-memory data store with automatic reload on file changes.",
      "Tested with Jest."
    ],
    stars: "0"
  },
  {
    id: "infill",
    slug: "infill",
    name: "Infill",
    link: "https://useinfill.com/",
    githubLink: "https://github.com/KaiBelmo/infill",
    category: [
      "Browser extension",
      "TypeScript",
      "Forms"
    ],
    typeOfProject: "Personal Project",
    date: "2026-07-11",
    description: "Infill is an open-source browser extension that helps users fill forms faster while staying in control of what gets written into the page. It scans form fields, suggests mappings from saved profile facts, and avoids filling sensitive inputs unless the user explicitly approves the action.",
    features: [
      "Scans the active tab for fillable form fields and suggests mappings from saved profile facts.",
      "Keeps the user in control by surfacing suggestions before filling and blocking sensitive-field autofill by default.",
      "Supports extension-local profile storage with optional encrypted sync through a backend passphrase flow."
    ],
    stars: "0"
  },
  {
    id: "portfolio-current",
    slug: "portfolio-current",
    name: "Portfolio",
    link: "https://www.kaibelmo.dev/",
    githubLink: "https://github.com/KaiBelmo/portfolio",
    category: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS"
    ],
    typeOfProject: "Personal Project",
    date: "2026-01-17",
    description: "My current portfolio website, built with Next.js and TypeScript. It combines a project archive, blog, GitHub star integration, pull-request parsing, terminal-style presentation, and downloadable résumé access in a single responsive site.",
    features: [
      "Project index with GitHub star fetching and direct repository linking.",
      "Pull request parsing that turns referenced PR numbers into repository-specific links.",
      "Responsive portfolio and blog experience with custom system-style visuals and motion."
    ],
    stars: "6"
  },
  {
    id: "actual-budget",
    slug: "actual-budget",
    name: "Actual",
    link: "https://actualbudget.org/",
    githubLink: "https://github.com/actualbudget/actual",
    category: [
      "Next.js",
      "TypeScript",
    ],
    typeOfProject: "Open Source Contribution",
    date: "2023-11-04",
    description: "Actual is a local-first personal finance tool. It's built to be fast and fully private, with optional syncing.",
    features: [
      "Enhanced the CSV importer by adding support for user-selectable delimiters (like ',' or '|'), increasing compatibility with various bank file formats (#1774).",
      "Fixed styling and mobile UI issues on the transaction and budget pages, improving readability and usability on smaller devices, including making budget category group rows fully tappable for easier expand/collapse interactions (#1820, #6272).",
    ],
    stars: "23300"
  },
  {
    id: "lessshare",
    slug: "lessshare",
    name: "LessShare",
    link: "https://lessshare-frontend.vercel.app/",
    githubLink: "https://github.com/kaibelmo/lessshare",
    category: ["Vue.js", "WebRTC", "Socket.io"],
    typeOfProject: "Thesis Project",
    date: "2025-09-25",
    description: "A browser-based decentralized file-sharing platform that enables secure peer-to-peer transfers without relying on centralized servers. Built with WebRTC and Vue.js, the system ensures privacy, speed, and full user control over shared data.",
    features: [
      "Direct Peer-to-Peer File Transfer — Uses WebRTC DataChannels for real-time, serverless communication between browsers.",
      "Adaptive Chunking — Efficiently handles large files by splitting them into optimized segments for faster transmission.",
      "User-Friendly Interface — Built with Vue.js for seamless connection setup, file selection, and real-time transfer monitoring."
    ],
    stars: "2"
  },
  {
    id: "code-racer",
    slug: "code-racer",
    name: "Code Racer",
    link: "",
    githubLink: "https://github.com/webdevcody/code-racer",
    category: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS"
    ],
    typeOfProject: "Open Source Contribution",
    date: "2023-07-09",
    description: "Code Racer is a multiplayer coding game where developers can compete against each other to solve programming challenges in real-time. Sharpen your coding skills, challenge your peers, and have fun while racing against the clock!",
    features: [
      "Developed the initial Type Racer mode, including typing logic and restart functionality, laying the foundation for competitive code-typing gameplay.",
      "Contributed multiple pull requests (#47, #90, #183, #229) addressing features and bugs, strengthening open-source collaboration and community growth."
    ],
    stars: "709"
  },
  {
    id: "portfolio-w95",
    slug: "portfolio-w95",
    name: "Windows 95 Portfolio",
    link: "https://portfolio-win95.vercel.app/",
    githubLink: "https://github.com/KaiBelmo/portfolio-win95",
    category: [
      "Vue.js",
      "TypeScript",
      "Canvas"
    ],
    typeOfProject: "Personal Project",
    date: "2023-01-22",
    description: "A creative experiment blending retro aesthetics with modern web engineering. This portfolio reimagines the Windows 95 desktop experience using Vue.js, TypeScript, and Canvas, focusing on interactive UI elements, smooth state management with Pinia, and pixel-perfect nostalgia.",
    features: [
      "Component-based retro UI toolkit built from scratch.",
      "Interactive desktop with draggable apps and marquee selection.",
      "Modular SCSS architecture mimicking Windows 95 palette.",
    ],
    stars: "36"
  },
  {
    id: "libC",
    slug: "libC",
    name: "libC--",
    githubLink: "https://github.com/KaiBelmo/libC--",
    description: "A C++ container library implementing standard template library (STL) compatible data structures. The project focuses on providing efficient, well-tested implementations of common data structures including vectors, lists, queues, and more, with a clean and modern C++ interface.",
    category: ["Data Structures", "STL"],
    typeOfProject: "Personal Project",
    date: "2022-01-30",
    features: [
      "STL-compatible, header-only container library featuring vector, list, deque, etc...",
      "Memory-efficient implementation.",
    ],
    stars: "30"
  },
  {
    id: "b1m0-dbg",
    slug: "b1m0-dbg",
    name: "b1m0-dbg",
    githubLink: "https://github.com/KaiBelmo/b1m0-dbg",
    description: "A Linux debugger (syscall tracer, elf parser) for x86_64, coded from scratch for educational purposes. It allows for parsing ELF files, tracing syscalls, and controlling process execution.",
    category: ["Debugger", "ELF Parser", "C"],
    typeOfProject: "Personal Project",
    date: "2020-08-02",
    features: [
      "Developed a custom Linux debugger (b1m0-dbg) from scratch for x86_64 architecture, focusing on educational purposes to deepen understanding of low-level system programming, ELF file formats, and process debugging.",
      "Implemented core features including ELF parsing (headers and sections), syscall tracing akin to strace, security mitigation checks (RELRO, NX), single-step execution with step-over and step-out, register dumping/modification, breakpoints, and process introspection like memory mappings and command lines.",
    ],
    stars: "11"
  },
  {
    id: "no404",
    slug: "no404",
    name: "no404",
    githubLink: "https://github.com/KaiBelmo/no404",
    description: "A fully responsive 404 'Not Found' page template. This project features a clean, modern design built purely with HTML, CSS, and JavaScript, suitable for any website.",
    category: ["JavaScript", "Chrome extension"],
    typeOfProject: "Personal Project",
    date: "2023-06-30", // You'll need to update this date
    features: [
      "Developed a lightweight Chrome extension, no404, that automatically detects visited websites and offers one-click access to their archived versions on the Internet Archive, simplifying retrieval of content from broken or removed pages.",
      "Addressed a common user frustration with 404 errors by creating a free, open-source tool that avoids manual searches, opting not to publish on the Chrome Web Store to skip associated fees.",
    ],
    stars: "4"
  },
  {
    id: "togetherjs",
    slug: "togetherjs",
    name: "Together",
    githubLink: "https://github.com/KaiBelmo/together",
    description: "A real-time synchronized YouTube video watching platform that allows users to watch videos together in sync. The application enables users to create rooms and share YouTube video links that will be played simultaneously for all participants.",
    category: ["Full stack", "WebSockets"],
    typeOfProject: "University Project",
    date: "2023-02-21",
    features: [
      "Real-time Video Synchronization — Uses WebSockets to keep video playback in sync across all participants in a room.",
      "Room-based System — Create and join rooms to watch videos together with friends in private sessions.",
    ],
    stars: "1"
  },

];

const projectIndexMetadata: Record<string, Partial<Project>> = {
  voidgen: {
    disciplines: ["Web Apps"],
    technologies: ["TypeScript", "REST API", "Jest"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "Generates REST endpoints from structured JSON with an in-memory store and automatic reload.",
    owned: "JSON-to-REST generation, hot reload behavior, in-memory state, and test coverage.",
    hardProblem: "Keeping generated endpoints useful while the source data changes during development.",
    result: "A tested mock API tool for frontend prototyping and integration work.",
    visualType: "terminal",
    classification: "UNCLASSIFIED / DEV-TOOL",
    imageVariant: "phosphor",
  },
  infill: {
    disciplines: ["Web Apps"],
    technologies: ["TypeScript", "Browser extension", "Forms"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "Scans pages for fillable fields, suggests mappings from saved profile facts, and blocks sensitive autofill unless approved.",
    owned: "Field discovery, profile-based mapping, approval flow, and extension-side storage behavior.",
    hardProblem: "Speeding up form completion without silently writing risky or incorrect data into arbitrary pages.",
    result: "A browser extension that keeps the user in control while reducing repetitive form entry work.",
    visualType: "browser",
    classification: "UNCLASSIFIED / EXTENSION",
    imageVariant: "monochrome",
  },
  "portfolio-current": {
    disciplines: ["Web Apps"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "Combines projects, blog content, GitHub stars, PR parsing, resume access, and system-style presentation in one site.",
    owned: "Site architecture, project data model, GitHub integrations, motion, and the custom visual system.",
    hardProblem: "Making a portfolio feel distinct while still keeping the content structure, navigation, and metadata readable.",
    result: "A maintainable portfolio codebase with live project metadata and a cohesive presentation layer.",
    visualType: "application",
    classification: "PERSONAL / ACTIVE",
    imageVariant: "monochrome",
  },
  "actual-budget": {
    disciplines: ["Open source", "Web Apps"],
    technologies: ["TypeScript", "Next.js", "CSV"],
    projectType: "Open-source contribution",
    role: "Contributor",
    homepageEvidence: "Extended CSV importing and improved transaction and budget interactions on mobile.",
    owned: "User-selectable CSV delimiters and targeted mobile usability fixes.",
    hardProblem: "Supporting varied bank exports without weakening an established import workflow.",
    result: "Contributions recorded in issues and pull requests #1774, #1820, and #6272.",
    visualType: "application",
    classification: "PUBLIC / OPEN-SOURCE",
    imageVariant: "monochrome",
    pullRequests: [
      { number: "#1774", url: "https://github.com/actualbudget/actual/pull/1774", title: "CSV delimiter selection" },
      { number: "#1820", url: "https://github.com/actualbudget/actual/pull/1820", title: "Mobile UI fixes" },
      { number: "#6272", url: "https://github.com/actualbudget/actual/pull/6272", title: "Budget row tappable fix" },
    ],
  },
  lessshare: {
    disciplines: ["Real-time", "Web Apps"],
    technologies: ["WebRTC", "Vue.js", "Socket.io"],
    projectType: "Thesis project",
    role: "Solo developer",
    homepageEvidence: "Direct browser-to-browser file transfer using WebRTC DataChannels.",
    owned: "Signaling, transfer flow, adaptive chunking, and the product interface.",
    hardProblem: "Coordinating reliable large-file transfer between browser peers.",
    result: "A working serverless transfer flow with real-time progress monitoring.",
    visualType: "browser",
    classification: "ACADEMIC / THESIS",
    imageVariant: "monochrome",
  },
  "code-racer": {
    disciplines: ["Open source", "Real-time"],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    projectType: "Open-source contribution",
    role: "Contributor",
    homepageEvidence: "Built the initial Type Racer mode and contributed multiple feature and bug-fix pull requests.",
    owned: "Typing logic, restart behavior, and follow-up product fixes.",
    hardProblem: "Introducing competitive typing behavior into an existing multiplayer codebase.",
    result: "Foundation for the project's Type Racer gameplay mode.",
    visualType: "terminal",
    classification: "PUBLIC / OPEN-SOURCE",
    imageVariant: "phosphor",
    pullRequests: [
      { number: "#47",  url: "https://github.com/webdevcody/code-racer/pull/47",  title: "Type Racer mode" },
      { number: "#90",  url: "https://github.com/webdevcody/code-racer/pull/90",  title: "Restart functionality" },
      { number: "#183", url: "https://github.com/webdevcody/code-racer/pull/183", title: "Feature fix" },
      { number: "#229", url: "https://github.com/webdevcody/code-racer/pull/229", title: "Bug fix" },
    ],
  },
  "portfolio-w95": {
    disciplines: ["Web Apps"],
    technologies: ["Vue.js", "TypeScript", "Canvas", "Pinia"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "Recreated an interactive Windows 95 desktop with draggable applications and selection behavior.",
    owned: "Desktop interaction model, reusable retro UI components, and application state.",
    hardProblem: "Reproducing desktop interactions within browser input and layout constraints.",
    result: "A responsive, component-based interactive desktop experience.",
    visualType: "application",
    classification: "PERSONAL / R&D",
    imageVariant: "monochrome",
  },
  libC: {
    disciplines: ["Low-level"],
    technologies: ["C++", "Data structures", "STL"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "Implements header-only, STL-compatible containers including vector, list, and deque.",
    owned: "Container APIs, iterators, allocation behavior, and data-structure implementation.",
    hardProblem: "Matching familiar STL interfaces while managing memory explicitly.",
    result: "A working collection of reusable C++ container implementations.",
    visualType: "terminal",
    classification: "UNCLASSIFIED / LIBRARY",
    imageVariant: "phosphor",
  },
  "b1m0-dbg": {
    disciplines: ["Low-level"],
    technologies: ["C", "Linux", "ELF", "ptrace"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "A from-scratch x86_64 debugger with ELF parsing, syscall tracing, and breakpoints.",
    owned: "Process control, ELF inspection, registers, breakpoints, and memory introspection.",
    hardProblem: "Coordinating Linux process state while exposing low-level execution clearly.",
    result: "A debugger capable of tracing and controlling x86_64 processes.",
    visualType: "terminal",
    classification: "RESTRICTED / SYSTEMS",
    imageVariant: "phosphor",
  },
  no404: {
    disciplines: ["Web Apps"],
    technologies: ["JavaScript", "Chrome extension"],
    projectType: "Personal project",
    role: "Creator",
    homepageEvidence: "Detects missing pages and offers one-click access to archived versions.",
    owned: "Page detection, archive lookup flow, and extension interface.",
    hardProblem: "Turning a failed navigation into a useful recovery path with minimal friction.",
    result: "A lightweight open-source browser extension for recovering removed content.",
    visualType: "browser",
    classification: "UNCLASSIFIED / EXTENSION",
    imageVariant: "monochrome",
  },
  togetherjs: {
    disciplines: ["Real-time", "Web Apps"],
    technologies: ["WebSockets", "YouTube API"],
    projectType: "University project",
    role: "Developer",
    homepageEvidence: "Synchronizes YouTube playback for participants sharing a private room.",
    owned: "Room workflow and real-time playback synchronization.",
    hardProblem: "Keeping distributed playback state aligned across connected clients.",
    result: "A room-based synchronized watching experience.",
    visualType: "browser",
    classification: "ACADEMIC / R&D",
    imageVariant: "monochrome",
  },
};

projects.forEach((project) => {
  const meta = projectIndexMetadata[project.id];
  if (meta) Object.assign(project, meta);
});

export const getAllProjects = () => {
  return projects;
};
