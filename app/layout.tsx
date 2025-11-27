import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./_components/ui/header";
import CustomCursor from "./_components/ui/CustomCursor";
import StarsBackground from "./_components/ui/StarsBackground";

const inter = Inter({ subsets: ["latin"] });

const SITE_TITLE = "Kai Belmo | Software Engineer";
const SITE_DESCRIPTION =
  "Portfolio of Kai Belmo — Full Stack engineer. Projects, blog, contact.";
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon.ico?v=4",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  applicationName: "Kai Belmo Portfolio",
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Kai Belmo - Portfolio",
    images: [
      {
        url: `${SITE_URL}/og.png`, 
        width: 1200,
        height: 630,
        alt: "Kai Belmo — Software Engineer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* custom cursor visible only on desktop */}
        <div className="hidden lg:block">
          <CustomCursor />
        </div>
        <StarsBackground />
        <div className="relative z-10">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
