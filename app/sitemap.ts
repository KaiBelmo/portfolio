import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kaibelmo.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/about", "/projects", "/blog", "/contact"];
  const blogRoutes = getAllPosts().map((post) => `/blog/${post.slug}`);

  return [...staticRoutes, ...blogRoutes].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route.startsWith("/blog") ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
