import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";

const BLOG_DIR = path.join(process.cwd(), "content/blog/dev-to");
const DEV_TO_USERNAME = "b1m0110";
const DEV_TO_API = `https://dev.to/api/articles?username=${DEV_TO_USERNAME}&per_page=30`;

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

interface DevToArticle {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  published_at: string;
  tag_list: string[] | string;
  url: string;
  body_markdown?: string | null;
  reading_time_minutes?: number;
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

function articleToPost(article: DevToArticle): BlogPost {
  return {
    slug: article.slug,
    title: article.title,
    published_at: article.published_at,
    description: article.description ?? "",
    tags: parseTags(article.tag_list),
    source: article.url,
    readingTime: article.reading_time_minutes ?? 1,
  };
}

async function renderMarkdown(content: string): Promise<Pick<BlogPost, "contentHtml" | "toc">> {
  const processed = await remark()
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeStringify)
    .process(content);
  const contentHtml = processed.toString();

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

  const devToPostPattern = new RegExp(
    `https://dev\\.to/${DEV_TO_USERNAME}/([\\w-]+)`,
    "g"
  );
  const localizedHtml = contentHtml.replace(devToPostPattern, "/blog/$1");

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

  return { contentHtml: patchedHtml, toc: mdHeadings };
}

async function fetchDevToArticleList(): Promise<DevToArticle[]> {
  const res = await fetch(DEV_TO_API, {
    headers: { "User-Agent": "portfolio-blog/1.0" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`dev.to API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function fetchDevToArticles(): Promise<BlogPost[]> {
  const articles = await fetchDevToArticleList();
  return articles
    .map(articleToPost)
    .sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
}

async function fetchDevToArticleBySlug(slug: string): Promise<BlogPost | null> {
  const articles = await fetchDevToArticleList();
  const summary = articles.find((article) => article.slug === slug);
  if (!summary) return null;

  const res = await fetch(`https://dev.to/api/articles/${summary.id}`, {
    headers: { "User-Agent": "portfolio-blog/1.0" },
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`dev.to article error: ${res.status} ${res.statusText}`);
  }

  const article: DevToArticle = await res.json();
  const rendered = await renderMarkdown(article.body_markdown ?? "");
  return { ...articleToPost(article), ...rendered };
}

// ---------------------------------------------------------------------------
// Disk-based helpers (used as a bundled fallback when dev.to is unavailable)
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
      const rendered = await renderMarkdown(content);

      return {
        slug: data.slug as string,
        title: data.title as string,
        published_at: data.published_at as string,
        description: data.description as string,
        tags: parseTags(data.tags),
        source: data.source as string,
        readingTime: estimateReadingTime(content),
        ...rendered,
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

export async function getPostsWithRevalidation(): Promise<BlogPost[]> {
  try {
    return await fetchDevToArticles();
  } catch {
    return getAllPosts();
  }
}

export async function getPostBySlugWithRevalidation(slug: string): Promise<BlogPost | null> {
  try {
    return await fetchDevToArticleBySlug(slug);
  } catch {
    return getPostBySlug(slug);
  }
}

export { DEV_TO_USERNAME };
