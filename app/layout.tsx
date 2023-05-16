import { Metadata } from "next";
import "./globals.css";
import "@/assets/css/font.css";

export const metadata: Metadata = {
  title: "Mohamed Ali | Software Engineer",
  description:
    "software engineer with expertise in both front-end and low-level programming, I specialize in JavaScript, TypeScript, React.js, and other frontend-focused libraries.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    url: "https://nothing.com",
    title: "Mohamed Ali | Software Engineer",
    description:
      "software engineer with expertise in both front-end and low-level programming, I specialize in JavaScript, TypeScript, React.js, and other frontend-focused libraries.",
    siteName: "My Website",
    images: [
      {
        url: "/og-image.png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@belmo01",
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`font-poppins bg-[#f6f5f4] h-screen overflow-hidden max-md:overflow-y-scroll`}
      >
        <div>{children}</div>
      </body>
    </html>
  );
}
