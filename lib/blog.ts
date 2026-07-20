import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";

const BLOG_DIR = path.join(process.cwd(), "content/blog/dev-to");

export interface TocEntry {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface BlogPost {
  slug: string;
  title: string;
  published_at: string;
  description: string;
  tags: string[];
  source: string;
  readingTime: number; // minutes
  contentHtml?: string;
  toc?: TocEntry[];
}

function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string") return raw.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ---------------------------------------------------------------------------
// Disk-based helpers (used at build time and in API routes)
// ---------------------------------------------------------------------------

export function getAllPosts(): BlogPost[] {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"));

  const posts: BlogPost[] = files.map((filename) => {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    return {
      slug: data.slug as string,
      title: data.title as string,
      published_at: data.published_at as string,
      description: data.description as string,
      tags: parseTags(data.tags),
      source: data.source as string,
      readingTime: estimateReadingTime(content),
    };
  });

  // Newest first
  return posts.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  for (const filename of files) {
    const filePath = path.join(BLOG_DIR, filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data, content } = matter(raw);

    if (data.slug === slug) {
      const processed = await remark()
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(content);
      const contentHtml = processed.toString();

      // The markdown pipeline doesn't auto-add ids; parse headings from raw markdown instead.
      const mdHeadings: TocEntry[] = [];
      const mdHeadingRegex = /^(#{2,3})\s+(.+)$/gm;
      let mdMatch: RegExpExecArray | null;
      while ((mdMatch = mdHeadingRegex.exec(content)) !== null) {
        const level = mdMatch[1].length as 2 | 3;
        const text = mdMatch[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");
        mdHeadings.push({ level, id, text });
      }

      // Inject ids into the rendered HTML headings so anchor links work
      // Rewrite dev.to self-links (e.g. https://dev.to/b1m0110/some-slug) to
      // local /blog/[slug] paths so they navigate within the portfolio.
      const devToPostPattern = new RegExp(
        `https://dev\\.to/${DEV_TO_USERNAME}/([\\w-]+)`,
        "g"
      );
      const localizedHtml = contentHtml.replace(
        devToPostPattern,
        "/blog/$1"
      );

      let patchedHtml = localizedHtml.replace(
        /<pre><code class="([^"]*\blanguage-([^"\s]+)[^"]*)">/g,
        '<pre data-language="$2"><code class="$1">'
      );
      let hIdx = 0;
      patchedHtml = patchedHtml.replace(/<h([23])>(.*?)<\/h[23]>/gi, (_, lvl, inner) => {
        const entry = mdHeadings[hIdx];
        hIdx++;
        if (!entry) return `<h${lvl}>${inner}</h${lvl}>`;
        return `<h${lvl} id="${entry.id}">${inner}</h${lvl}>`;
      });

      return {
        slug: data.slug as string,
        title: data.title as string,
        published_at: data.published_at as string,
        description: data.description as string,
        tags: parseTags(data.tags),
        source: data.source as string,
        readingTime: estimateReadingTime(content),
        contentHtml: patchedHtml,
        toc: mdHeadings,
      };
    }
  }

  return null;
}

export function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// 24-hour revalidated fetch — used by the blog listing page
// Next.js caches this fetch and revalidates it every 24 hours automatically.
// On revalidation it also calls the sync route to pull fresh posts from dev.to.
// ---------------------------------------------------------------------------

const DEV_TO_USERNAME = "b1m0110";

export async function getPostsWithRevalidation(): Promise<BlogPost[]> {
  try {
    // Trigger a background sync so disk files stay up to date.
    // We use next: { revalidate: 86400 } so Next only re-runs this once per 24h.
    const base =
      process.env.NEXT_PUBLIC_BASE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    await fetch(`${base}/api/blog-sync`, {
      next: { revalidate: 86400 }, // 24 hours
    });
  } catch {
    // Sync failure is non-fatal — we fall back to whatever is on disk
  }

  // Read freshest posts from disk (sync route has already updated them if needed)
  return getAllPosts();
}

export { DEV_TO_USERNAME };
