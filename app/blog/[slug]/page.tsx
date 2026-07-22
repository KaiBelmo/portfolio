import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlugWithRevalidation, formatPostDate } from "@/lib/blog";
import TableOfContents from "./TableOfContents";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlugWithRevalidation(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Kai Belmo`,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlugWithRevalidation(slug);
  if (!post) notFound();

  return (
    <div className="route-shell py-[70px] pb-[120px]">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mb-[42px] flex gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted [&_a]:underline-offset-4 [&_strong]:text-ink"
      >
        <Link href="/">Room</Link>
        <span>/</span>
        <Link href="/blog">Blog</Link>
        <span>/</span>
        <strong>{post.tags[0] ?? "post"}</strong>
      </nav>

      {/* Article header */}
      <header className="mb-[56px] border-b border-line pb-[48px]" data-scroll-reveal data-scroll-reveal-state="visible">
        <p className="mb-3.5 font-mono text-[0.66rem] font-extrabold uppercase tracking-[0.09em] text-accent">
          DEV.TO - ORIGINAL POST
        </p>
        <h1 className="m-0 text-balance font-display text-[clamp(2.45rem,4.7vw,4.9rem)] leading-[1.02] tracking-[-0.025em]">
          {post.title}
        </h1>

        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
          <time dateTime={post.published_at}>
            {formatPostDate(post.published_at)}
          </time>
          <span>{post.readingTime} min read</span>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="border border-line px-1.5 py-0.5 font-mono text-[0.58rem] uppercase text-accent"
              >
                {tag}
              </span>
            ))}
          </div>
          <a
            href={post.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-muted underline-offset-4 hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sys-focus)]"
          >
            View on DEV.to <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </header>

      {/* Two-column: article + TOC */}
      <div className="flex gap-16 items-start">
        {/* Markdown body */}
        <article
          className="blog-prose min-w-0 flex-1"
          dangerouslySetInnerHTML={{ __html: post.contentHtml ?? "" }}
        />

        {/* Table of contents */}
        <TableOfContents entries={post.toc ?? []} />
      </div>

      {/* Back link */}
      <div className="mt-[80px] border-t border-line pt-8" data-scroll-reveal data-scroll-reveal-state="visible">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sys-focus)]"
        >
          <span aria-hidden="true">&lt;-</span> Back to all posts
        </Link>
      </div>
    </div>
  );
}
