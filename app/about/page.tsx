import Link from "next/link";
import type { Metadata } from "next";
import { projects } from "@/data/projects";
import { getPostsWithRevalidation, formatPostDate } from "@/lib/blog";
import AboutSpaceAnimation from "@/app/_components/ui/AboutSpaceAnimation";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About | Kai Belmo",
  description: "Kai Belmo's background in full-stack engineering, systems programming, developer tools, and product-minded web work.",
  alternates: { canonical: "/about" },
};

export default async function AboutPage() {
  const posts = (await getPostsWithRevalidation()).slice(0, 3);

  return (
    <section className={`route-shell ${styles.shell}`}>
      <div className={styles.spaceAnimation}>
        <AboutSpaceAnimation />
      </div>

      <nav className="mb-[10px] flex min-h-11 items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline">Room</Link>
        <span aria-hidden="true">/</span>
        <strong className="font-bold text-ink" aria-current="page">About</strong>
      </nav>

      <h1 className="mb-6 font-display text-[clamp(3rem,7vw,6.2rem)] font-normal leading-none tracking-[-0.055em]">About me</h1>

      <section className="py-7" aria-labelledby="whoami-heading" data-scroll-reveal data-scroll-reveal-state="visible">
        <h2 id="whoami-heading" className="mb-5 border-b border-line pb-3 font-mono text-[0.84rem] font-extrabold uppercase tracking-[0.08em] text-accent">
          &gt; whoami
        </h2>
        <p className="m-0 text-[1.02rem] leading-[1.78] text-muted">
          I started in competitive programming and low-level programming, where CTF competitions sparked my interest in reverse engineering C programs. While studying Computer Science, I gradually shifted toward software engineering and became focused on building reliable, maintainable systems with strong performance and a good user experience. Since then, I’ve worked with TypeScript, React, Next.js, Vue, NestJS, and Node.js to build real-time applications, user-focused products, and developer tools.

        </p>
      </section>

      <section className="mt-7 pb-7" aria-labelledby="recent-posts-heading" data-scroll-reveal data-scroll-reveal-state="visible">
        <div className="mb-4 flex items-baseline justify-between gap-5 border-b border-line pb-3">
          <h2 id="recent-posts-heading" className="m-0 font-mono text-[0.84rem] font-extrabold uppercase tracking-[0.08em] text-accent">
            &gt; recent posts
          </h2>
          <Link className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted underline-offset-4 hover:text-accent hover:underline" href="/blog">
            More blog posts ↗
          </Link>
        </div>
        <div className="grid grid-cols-[130px_1fr] gap-y-4 font-mono mobile:grid-cols-1">
          {posts.map((post) => (
            <Link className="col-span-full grid grid-cols-subgrid py-1.5 hover:text-accent mobile:grid-cols-1 mobile:gap-1" href={`/blog/${post.slug}`} key={post.slug}>
              <time className="text-[0.58rem] uppercase tracking-[0.08em] text-muted">{formatPostDate(post.published_at)}</time>
              <span className="text-[0.86rem] font-bold leading-[1.45] underline decoration-line underline-offset-4">{post.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7" aria-labelledby="recent-work-heading" data-scroll-reveal data-scroll-reveal-state="visible">
        <div className="mb-4 flex items-baseline justify-between gap-5 border-b border-line pb-3">
          <h2 id="recent-work-heading" className="m-0 font-mono text-[0.84rem] font-extrabold uppercase tracking-[0.08em] text-accent">
            &gt; recent work
          </h2>
          <Link className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted underline-offset-4 hover:text-accent hover:underline" href="/projects">
            More projects ↗
          </Link>
        </div>
        <div className="grid gap-2">
          {projects.slice(0, 3).map((project) => (
            <a className="group grid content-start py-2 hover:text-accent" href={project.link || project.githubLink} target="_blank" rel="noreferrer" key={project.id}>
              <span className="mb-1.5 font-mono text-[0.5rem] uppercase tracking-[0.08em] text-muted underline decoration-transparent underline-offset-4 group-hover:decoration-accent">{project.typeOfProject}</span>
              <strong className="block font-display text-[clamp(1.15rem,1.8vw,1.65rem)] leading-none tracking-[-0.035em] underline decoration-transparent underline-offset-4 group-hover:decoration-accent">{project.name}</strong>
              <span className="mt-2 block text-[0.76rem] leading-[1.48] text-muted underline decoration-transparent underline-offset-4 group-hover:decoration-accent">{project.homepageEvidence || project.description}</span>
              <span className="mt-2.5 flex flex-wrap gap-1.5">
                {project.category.slice(0, 3).map((tag) => (
                  <span className="border border-line px-1.5 py-0.5 font-mono text-[0.5rem] uppercase tracking-[0.04em] text-muted" key={tag}>
                    #{tag}
                  </span>
                ))}
              </span>
            </a>
          ))}
        </div>
      </section>
    </section>
  );
}
