import Link from "next/link";
import { getGithubActivity } from "@/lib/github-activity";
import ContactGrid from "./ContactGrid";

export default async function ContactPage() {
  const githubActivity = await getGithubActivity();

  return (
    <section className="px-[clamp(20px,5vw,72px)] pb-[clamp(64px,8vw,120px)] pt-[clamp(36px,5vw,72px)] font-body text-ink tablet:px-4 tablet:py-[58px]">
      <nav
        className="mb-[10px] flex min-h-11 items-center gap-2.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted"
        aria-label="Breadcrumb"
      >
        <Link href="/" className="flex min-h-11 items-center underline-offset-4 hover:text-accent hover:underline">
          Room
        </Link>
        <span aria-hidden="true">/</span>
        <strong className="font-bold text-ink" aria-current="page">
          Contact
        </strong>
      </nav>

      <header className="mb-[clamp(18px,3vw,32px)]" data-scroll-reveal data-scroll-reveal-state="visible" suppressHydrationWarning>
        <h1 className="m-0 font-display text-[clamp(3rem,7vw,6.2rem)] font-normal leading-[0.94] tracking-[-0.035em] text-ink">
          Contact me
        </h1>
        <p className="mb-0 mt-6 text-[1.05rem] leading-[1.65] text-muted">
          Have a project, an idea, or just something worth discussing? Send a few details; no formal brief needed.
        </p>
      </header>

      <ContactGrid githubActivity={githubActivity} />
    </section>
  );
}
