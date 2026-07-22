import Link from "next/link";
import { getPostsWithRevalidation, formatPostDate } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Kai Belmo",
  description:
    "Writing about AI debugging workflows, TypeScript, systems programming, and building calmer software interfaces.",
  alternates: { canonical: "/blog" },
};

// Revalidate the page daily to pick up new Dev.to posts
export const revalidate = 86400;

export default async function BlogPage() {
  const posts = await getPostsWithRevalidation();

  return (
    <section className="route-shell">
      <nav className="mb-[10px] flex min-h-11 items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline">Room</Link>
        <span aria-hidden="true">/</span>
        <strong className="font-bold text-ink" aria-current="page">Blog</strong>
      </nav>

      <h1 className="m-0 mb-4 font-display text-[clamp(3rem,7vw,6.2rem)] font-normal leading-none">Blog</h1>
      <p className="mb-7 text-sm leading-relaxed text-sys-muted">
        I write about a mix of topics, sometimes technical and sometimes not; pulled live from dev.to.
      </p>

      <hr className="border-line" />

      <div className="grid">
        {posts.map((post) => (
          <article
            key={post.slug}
            data-scroll-reveal
            data-scroll-reveal-state="visible"
            suppressHydrationWarning
            className="group grid grid-cols-[1fr_auto] items-end gap-x-10 gap-y-4 border-b border-line py-10 tablet:grid-cols-1 tablet:gap-6"
          >
            {/* Title + meta + excerpt */}
            <div>
              {/* Tags + date row */}
              <div className="mb-4 flex flex-wrap items-center gap-4 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-muted">
                <time dateTime={post.published_at}>
                  {formatPostDate(post.published_at)}
                </time>
                <span aria-hidden="true" className="text-line-strong">|</span>
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-accent">{tag}</span>
                ))}
              </div>

              <Link
                href={`/blog/${post.slug}`}
                className="group/title block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sys-focus)]"
              >
                <h2 className="mb-3 font-display text-[clamp(2rem,4vw,3.8rem)] leading-[1.0] tracking-[-0.04em] transition-opacity duration-150 group-hover/title:opacity-60">
                  {post.title}
                </h2>
              </Link>

              <p className="m-0 max-w-[680px] text-[0.9rem] leading-[1.65] text-muted">
                {post.description}
              </p>
            </div>

            {/* Read link - bottom-right */}
            <Link
              href={`/blog/${post.slug}`}
              className="flex shrink-0 items-center gap-2 pb-0.5 font-mono text-[0.6rem] uppercase tracking-[0.08em] text-ink transition-opacity duration-150 hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--sys-focus)] tablet:self-auto"
              aria-label={`Read ${post.title}`}
            >
              <span>{post.readingTime} min read</span>
              <span aria-hidden="true">-&gt;</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
