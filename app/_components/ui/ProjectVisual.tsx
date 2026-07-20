import type { Project } from "@/types/project";

const codeLines: Record<string, string[]> = {
  voidgen: [
    "const server = createMockServer({ port: 3000 });",
    "server.route('/api/users', usersData);",
    "server.start();",
  ],
  infill: [
    "const fields = scanForm(document);",
    "const suggestions = matchProfile(fields, profileFacts);",
    "fillApprovedFields(suggestions);",
  ],
  "portfolio-current": [
    "const projects = getAllProjects();",
    "const stars = await fetch('/api/github-stars').then((r) => r.json());",
    "renderSystemFrame({ projects, stars });",
  ],
  "actual-budget": [
    "// csv-importer.ts",
    "const delimiter = parseDelimiter(input);",
    "const transactions = csv.parse(data, { delimiter });",
    "budget.import(transactions);",
  ],
  lessshare: [
    "// webrtc-transfer.ts",
    "const peer = new RTCPeerConnection(config);",
    "const channel = peer.createDataChannel('fileTransfer');",
    "sendChunks(file, channel);",
  ],
  "code-racer": [
    "const race = createSession(players);",
    "race.on('input', validateProgress);",
    "race.restart({ preserveLobby: true });",
  ],
  "portfolio-w95": [
    "// win95-desktop.vue",
    "const desktop = new DesktopManager();",
    "desktop.registerApp('calculator', CalcApp);",
    "desktop.mount();",
  ],
  libC: [
    "template <typename T>",
    "class vector {",
    "  iterator insert(iterator, T&& value);",
    "};",
  ],
  "b1m0-dbg": [
    "struct user_regs_struct regs;",
    "ptrace(PTRACE_GETREGS, child, NULL, &regs);",
    "printf(\"RIP: %llx\\n\", regs.rip);",
  ],
  no404: [
    "// chrome-extension.js",
    "chrome.webNavigation.onErrorOccurred.addListener((details) => {",
    "  const archiveUrl = getArchiveUrl(details.url);",
    "  suggestRedirect(archiveUrl);",
    "});",
  ],
  togetherjs: [
    "// websocket-sync.ts",
    "socket.on('playbackSync', (data) => {",
    "  videoPlayer.seekTo(data.time);",
    "  videoPlayer.play();",
    "});",
  ],
};

export default function ProjectVisual({
  project,
  priority = false,
  detail = false,
}: {
  project: Project;
  priority?: boolean;
  detail?: boolean;
}) {
  const lines = codeLines[project.id] || [
    `// ${project.name} preview`,
    `console.log("Analyzing dossier: ${project.id}");`,
  ];

  return (
    <div
      className={`visual-phosphor visual-${project.slug} relative flex w-full flex-col overflow-hidden bg-sys-bg px-[26px] pb-4 pt-[62px] text-sys-signal mobile:px-4 mobile:pt-[54px]`}
      role="img"
      aria-label={`${project.name} technical code excerpt`}
    >
      <div className="absolute inset-x-0 top-0 flex min-h-[38px] items-center gap-1.5 border-b border-sys-line bg-sys-bg px-3 [&_b]:font-mono [&_b]:text-[0.65rem] [&_b]:text-sys-muted [&_span]:size-1.5 [&_span]:bg-sys-muted">
        <span />
        <span />
        <span />
        <b>{project.name.toLowerCase()} — source</b>
      </div>
      <pre className="mb-4 whitespace-pre-wrap break-words font-mono text-xs md:text-sm">
        <code>{lines.join("\n")}</code>
      </pre>
      <div className="mt-auto flex justify-between gap-3 font-mono text-[0.65rem] text-sys-muted">
        <span className="min-w-0 [overflow-wrap:anywhere]">{project.category.join(" / ")}</span>
        <a
          href={`https://github.com/${new URL(project.githubLink).pathname.split("/")[1]}`}
          target="_blank"
          rel="noreferrer"
          className="min-w-0 text-right [overflow-wrap:anywhere] transition-colors hover:text-sys-cream hover:underline"
        >
          {new URL(project.githubLink).hostname}/{new URL(project.githubLink).pathname.split("/")[1]}
        </a>
      </div>
    </div>
  );
}
