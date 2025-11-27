import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./_components/ui/header";
import CustomCursor from "./_components/ui/CustomCursor";
import StarsBackground from "./_components/ui/StarsBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kai Belmo | Software Engineer",
  description: "Portfolio of Kai Belmo",
  icons: {
    icon: "/favicon.ico?v=4",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
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
