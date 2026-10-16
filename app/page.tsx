import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import HomeHero from "./_components/ui/HomeHero";

export const metadata: Metadata = pageMetadata({
  title: "Kai Belmo | Software Engineer",
  description: "Full-stack engineer building expressive web products, developer tools, and low-level experiments.",
  path: "/",
});

export default function Home() {
  return <HomeHero />;
}
