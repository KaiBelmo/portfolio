import type { Metadata } from "next";

export const SITE_URL = "https://www.kaibelmo.dev";
export const SITE_NAME = "Kai Belmo";
export const OG_IMAGE = { url: "/og.png", alt: "Kai Belmo software engineering portfolio" };

// Next shallow-merges `openGraph` and `twitter`, so a page that only sets a
// title would otherwise inherit the homepage's og:url, og:title and image.
// Every route builds its social tags here so they always describe that page.
export function pageMetadata({
  title,
  description,
  path,
  openGraph,
}: {
  title: string;
  description: string;
  path: string;
  openGraph?: Metadata["openGraph"];
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [OG_IMAGE],
      ...openGraph,
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

// Absolute URL with the trailing slash the site serves (next.config trailingSlash: true).
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path === "/" ? "/" : `${path.replace(/\/$/, "")}/`}`;
}
