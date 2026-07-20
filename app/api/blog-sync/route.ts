import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BLOG_DIR = path.join(process.cwd(), "content/blog/dev-to");
const INDEX_PATH = path.join(BLOG_DIR, "index.json");
const DEV_TO_USERNAME = "b1m0110";
const DEV_TO_API = `https://dev.to/api/articles?username=${DEV_TO_USERNAME}&per_page=30`;

interface DevToArticle {
  id: number;
  title: string;
  slug: string;
  description: string;
  published_at: string;
  tag_list: string[];
  url: string;
  body_markdown: string;
  reading_time_minutes: number;
}

interface IndexEntry {
  title: string;
  slug: string;
  published_at: string;
  source: string;
  file: string;
}

function slugToFilename(slug: string): string {
  return `${slug}.md`;
}

function normalizeTags(tagList: unknown): string[] {
  if (Array.isArray(tagList)) return tagList.map(String);
  if (typeof tagList === "string") {
    return tagList
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function buildFrontmatter(article: DevToArticle): string {
  const tags = normalizeTags(article.tag_list);
  const tagsYaml = tags.length
    ? `[${tags.map((t) => JSON.stringify(t)).join(", ")}]`
    : "[]";
  return [
    "---",
    `title: ${JSON.stringify(article.title)}`,
    `slug: ${JSON.stringify(article.slug)}`,
    `source: ${JSON.stringify(article.url)}`,
    `published_at: ${JSON.stringify(article.published_at)}`,
    `description: ${JSON.stringify(article.description ?? "")}`,
    `tags: ${tagsYaml}`,
    "---",
  ].join("\n");
}

export async function GET() {
  try {
    // Fetch article list from dev.to (no API key needed for public articles)
    const listRes = await fetch(DEV_TO_API, {
      headers: { "User-Agent": "portfolio-blog-sync/1.0" },
      next: { revalidate: 0 }, // always fresh in this route
    });

    if (!listRes.ok) {
      return NextResponse.json(
        { error: `dev.to API error: ${listRes.status} ${listRes.statusText}` },
        { status: 502 }
      );
    }

    const articles: DevToArticle[] = await listRes.json();

    // Ensure content directory exists
    fs.mkdirSync(BLOG_DIR, { recursive: true });

    const index: IndexEntry[] = [];
    const results: { slug: string; status: "created" | "updated" | "unchanged" }[] = [];

    for (const article of articles) {
      // Fetch full body markdown individually (list endpoint doesn't include body)
      const articleRes = await fetch(
        `https://dev.to/api/articles/${article.id}`,
        {
          headers: { "User-Agent": "portfolio-blog-sync/1.0" },
          next: { revalidate: 0 },
        }
      );

      if (!articleRes.ok) {
        console.warn(`Skipping article ${article.slug}: fetch failed`);
        continue;
      }

      const full: DevToArticle = await articleRes.json();
      const filename = slugToFilename(full.slug);
      const filePath = path.join(BLOG_DIR, filename);
      const relPath = `content/blog/dev-to/${filename}`;

      const newContent = `${buildFrontmatter(full)}\n${full.body_markdown ?? ""}`;

      let status: "created" | "updated" | "unchanged" = "unchanged";
      if (!fs.existsSync(filePath)) {
        status = "created";
      } else {
        const existing = fs.readFileSync(filePath, "utf-8");
        if (existing !== newContent) status = "updated";
      }

      if (status !== "unchanged") {
        fs.writeFileSync(filePath, newContent, "utf-8");
      }

      index.push({
        title: full.title,
        slug: full.slug,
        published_at: full.published_at,
        source: full.url,
        file: relPath,
      });

      results.push({ slug: full.slug, status });
    }

    // Sort index newest first and write it
    index.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
    fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 4), "utf-8");

    return NextResponse.json({
      synced: results.length,
      results,
      lastSync: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[blog-sync]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
