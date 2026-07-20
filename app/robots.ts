import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.kaibelmo.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
