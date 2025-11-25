import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./_components/ui/header";
import CustomCursor from "./_components/ui/CustomCursor";
import StarsBackground from "./_components/ui/StarsBackground";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kai Belmo | Portfolio",
  description: "Portfolio of Kai Belmo",
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

        {/* Stars background: hidden on mobile/tablet via the component's tailwind class */}
        <StarsBackground />

        <div className="relative z-10">


        {/* keep header and content normal — stars are fixed and behind everything (-z-10) */}
        <Header />

        <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
