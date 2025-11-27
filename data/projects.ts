import type { Project } from "@/types/project";

export const projects: Project[] = [
  {
    id: "lessshare",
    slug: "lessshare",
    name: "LessShare",
    link: "https://lessshare-frontend.vercel.app/",
    githubLink: "https://github.com/kaibelmo/lessshare",
    category: ["Full stack", "WebRTC", "Socket.io"],
    typeOfProject: "Thesis Project",
    date: "2025-09-25",
    imageLink: "/lessshare-screen.PNG",
    imagePosition: "center",
    description: "A browser-based decentralized file-sharing platform that enables secure peer-to-peer transfers without relying on centralized servers. Built with WebRTC and Vue.js, the system ensures privacy, speed, and full user control over shared data.",
    asciinemaId: "lessShare", // This should match the filename in /public/casts/ (without .cast extension)
    coverSeconds: 7,
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
    imageLink: "/coderacer-screen.PNG",
    imagePosition: "left",
    description: "Code Racer is a multiplayer coding game where developers can compete against each other to solve programming challenges in real-time. Sharpen your coding skills, challenge your peers, and have fun while racing against the clock!",
    coverSeconds: 6, // Show frame at 6 seconds as cover
    features: [
      "Developed the initial Type Racer mode, including typing logic and restart functionality, laying the foundation for competitive code-typing gameplay.",
      "Contributed multiple pull requests (#47, #90, #183, #229) addressing features and bugs, strengthening open-source collaboration and community growth."
    ],
    stars: "709"
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
    imageLink: "/actual-screen.PNG",
    imagePosition: "left",
    description: "Actual is a local-first personal finance tool. It's built to be fast and fully private, with optional syncing.",
    coverSeconds: 3,
    features: [
      "Enhanced the CSV importer by adding support for user-selectable delimiters (like ',' or '|'), increasing compatibility with various bank file formats (#1774).",
      "Fixed styling on the mobile transaction page, improving the user interface and readability on smaller devices (#1820).",
    ],
    stars: "23300"
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
    imageLink: "/wind95-screen.PNG",
    imagePosition: "left",
    description: "A creative experiment blending retro aesthetics with modern web engineering. This portfolio reimagines the Windows 95 desktop experience using Vue.js, TypeScript, and Canvas, focusing on interactive UI elements, smooth state management with Pinia, and pixel-perfect nostalgia.",
    asciinemaId: "win95",
    coverSeconds: 8, // Show frame at 8 seconds as cover
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
    imageLink: "/libc-screen.PNG",
    imagePosition: "left",
    asciinemaId: "libc", // This should match the filename in /public/casts/ (without .cast extension)
    coverSeconds: 8, // Show frame at 8 seconds as cover
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
    imageLink: "/b1m0-dbg-screen.PNG",
    imagePosition: "left",
    asciinemaId: "b1m0-dbg", // This should match the filename in /public/casts/ (without .cast extension)
    coverSeconds: 8, // Show frame at 8 seconds as cover
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
    imageLink: "/no404-screen.PNG", // Placeholder path
    imagePosition: "left", // You can change this
    asciinemaId: "no404", // This should match the filename in /public/casts/ (without .cast extension)
    coverSeconds: 9,
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
    imageLink: "/together-screen.PNG",
    imagePosition: "center",
    asciinemaId: "together", // This should match the filename in /public/casts/ (without .cast extension)
    coverSeconds: 13, // Show frame at 8 seconds as cover
    features: [
      "Real-time Video Synchronization — Uses WebSockets to keep video playback in sync across all participants in a room.",
      "Room-based System — Create and join rooms to watch videos together with friends in private sessions.",
    ],
    stars: "1"
  },

];

export const getProjectBySlug = (slug: string) => {
  return projects.find((project) => project.slug === slug);
};

export const getAllProjects = () => {
  return projects;
};
