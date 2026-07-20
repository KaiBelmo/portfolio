import type { Metadata } from "next";
import HomeHero from "./_components/ui/HomeHero";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeHero />;
}
