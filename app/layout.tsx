import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Aldrich, Pixelify_Sans } from "next/font/google";
import { ThemeProvider } from "./_components/system/ThemeProvider";
import PageTransition from "./_components/system/PageTransition";
import SiteHeader from "./_components/ui/SiteHeader";
import { DEFAULT_THEME, THEME_PALETTES } from "@/lib/theme";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://portfolio-kaibelmo.vercel.app";

const bodyFont = Aldrich({
  subsets: ["latin"],
  variable: "--font-body",
  weight: "400",
  display: "swap",
});

const displayFont = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "700"],
  display: "swap",
});

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: THEME_PALETTES.morning.canvas };
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Kai Belmo | Software Engineer",
  description: "Full-stack engineer building expressive web products, developer tools, and low-level experiments.",
  applicationName: "Kai Belmo Portfolio",
  openGraph: { title: "Kai Belmo | Software Engineer", description: "Full-stack engineering, open source, and systems work.", url: siteUrl, siteName: "Kai Belmo", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Kai Belmo software engineering portfolio" }], type: "website" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const initialThemeScript = `
    (() => {
      const theme = "${DEFAULT_THEME}";
      document.documentElement.dataset.theme = theme;
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        const palette = {
          morning: "${THEME_PALETTES.morning.canvas}",
          afternoon: "${THEME_PALETTES.afternoon.canvas}",
          night: "${THEME_PALETTES.night.canvas}"
        };
        meta.setAttribute("content", palette[theme]);
      }
    })();
  `;

  return (
    <html
      lang="en"
      data-theme={DEFAULT_THEME}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialThemeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <div className="site-shell">
            <SiteHeader />
            <main id="main">
              <PageTransition>{children}</PageTransition>
            </main>
            <footer className="relative z-[1] mt-auto flex justify-between bg-sys-bg px-7 py-[22px] font-mono text-[0.68rem] uppercase text-sys-muted transition-[background] duration-160 ease-out before:pointer-events-none before:absolute before:left-1/2 before:top-0 before:h-px before:w-screen before:-translate-x-1/2 before:bg-[color-mix(in_srgb,var(--sys-line)_40%,transparent)] [html:has(.app[data-theme-transitioning='true'])_&]:bg-transparent [html:has(.app[data-theme-transitioning='true'])_&]:backdrop-filter-none [html:has(.app[data-theme-transitioning='true'])_&]:transition-[background-color,border-color] [html:has(.app[data-theme-transitioning='true'])_&]:duration-240 [html:has(.app[data-theme-transitioning='true'])_&]:ease-out tablet:flex-col tablet:items-start tablet:gap-2 tablet:px-[18px] tablet:py-[20px]">
              <span>KAI BELMO / SOFTWARE ENGINEER</span>
              <span className="tablet:text-[0.58rem] tablet:opacity-60"><span className="line-through opacity-50 mr-1.5">Built with love</span>Built with Next.js · 2026</span>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
