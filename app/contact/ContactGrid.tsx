import type { ReactNode } from "react";
import type { GithubActivity } from "@/lib/github-activity";
import ContactCopyButton from "./ContactCopyButton";
import {
  ActivityIcon,
  ArrowIcon,
  EMAIL,
  GithubIcon,
  GmailIcon,
  KeyIcon,
  LinkedInIcon,
  NORMALIZED_PGP_FINGERPRINT,
  PGP_FINGERPRINT_GROUPS,
  PGP_KEY_ID,
  XIcon,
} from "./contactData";
import GithubActivityHeatmap from "./GithubActivityHeatmap";

const CARD_CLASS =
  "group relative flex h-full min-h-[210px] flex-col justify-between gap-8 border border-line p-6 transition-colors duration-300 ease-out hover:border-accent focus-visible:border-accent focus-visible:outline-none mobile:min-h-[150px] mobile:gap-4 mobile:p-4";
const COMPACT_CARD_CLASS =
  "group relative flex h-full min-h-[160px] flex-col justify-between gap-4 border border-line p-5 transition-colors duration-300 ease-out hover:border-accent focus-visible:border-accent focus-visible:outline-none mobile:min-h-[140px] mobile:p-4";
const FIRST_ROW_CARD_CLASS =
  "group relative flex h-full min-h-[132px] flex-col justify-between gap-3 border border-line p-4 transition-colors duration-300 ease-out hover:border-accent focus-visible:border-accent focus-visible:outline-none mobile:min-h-[126px]";
const CARD_ICON_CLASS =
  "text-muted transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent";
const CARD_ARROW_CLASS =
  "shrink-0 p-1.5 text-muted opacity-40 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-accent group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:text-accent group-focus-visible:opacity-100";
const COMPACT_SECTION_CLASS = "flex h-full min-h-[160px] flex-col justify-between gap-4 border border-line p-5";
const FIRST_ROW_SECTION_CLASS = "flex h-full min-h-[132px] flex-col justify-between gap-3 border border-line p-4";
const PGP_ACTION_CLASS =
  "inline-flex min-h-9 items-center justify-center gap-1.5 border border-line px-2.5 py-1.5 font-mono text-[0.58rem] font-bold uppercase tracking-[0.08em] text-ink transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent focus-visible:outline-none";

function ContactCard({
  className,
  href,
  icon,
  meta,
  title,
  value,
  external = true,
  children,
}: {
  className: string;
  href: string;
  icon: ReactNode;
  meta: string;
  title: string;
  value: string;
  external?: boolean;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
      data-scroll-reveal
      data-scroll-reveal-state="visible"
      suppressHydrationWarning
    >
      <div className="flex items-start justify-between gap-4">
        <span className={CARD_ICON_CLASS}>{icon}</span>
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-muted opacity-60">{meta}</span>
      </div>
      <div className="flex flex-col gap-3">
        {children}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="m-0 text-2xl font-bold text-ink transition-colors duration-300 group-hover:text-accent group-focus-visible:text-accent mobile:text-xl">
              {title}
            </h3>
            <p className="m-0 mt-2 truncate font-mono text-[0.88rem] tracking-[0.02em] text-muted">{value}</p>
          </div>
          <span className={CARD_ARROW_CLASS}>{ArrowIcon}</span>
        </div>
      </div>
      {external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </a>
  );
}

function EmailCard() {
  return (
    <ContactCard
      href={`mailto:${EMAIL}`}
      className={`${FIRST_ROW_CARD_CLASS} col-span-2 order-1 sm:col-span-1 sm:order-1 lg:col-span-3 lg:order-1`}
      icon={GmailIcon}
      meta="01 · Direct"
      title="Email"
      value={EMAIL}
      external={false}
    >
      <div className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.1em] text-muted">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
        </span>
        Usually replies soon
      </div>
    </ContactCard>
  );
}

function PgpCard() {
  return (
    <section
      aria-labelledby="pgp-title"
      className={`${FIRST_ROW_SECTION_CLASS} col-span-2 order-2 sm:col-span-1 sm:order-2 lg:col-span-3 lg:order-2`}
      data-scroll-reveal
      data-scroll-reveal-state="visible"
      suppressHydrationWarning
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[0.56rem] font-bold uppercase tracking-[0.1em] text-muted">
            {KeyIcon}
            <span>02 · Secure</span>
          </div>
          <h2 id="pgp-title" className="m-0 text-lg font-bold text-ink">
            PGP public key
          </h2>
          <p className="m-0 mt-1 text-xs leading-[1.4] text-muted">
            Use this fingerprint to verify my public key before sending encrypted email.
          </p>
        </div>
        <code className="shrink-0 border border-line px-2.5 py-1.5 font-mono text-[0.7rem] tracking-[0.06em] text-muted">
          {PGP_KEY_ID}
        </code>
      </div>

      <div className="border-t border-line pt-2.5">
        <p className="m-0 mb-1.5 font-mono text-[0.56rem] font-bold uppercase tracking-[0.1em] text-muted">
          Fingerprint
        </p>
        <p
          className="m-0 flex flex-wrap gap-x-2.5 gap-y-1 font-mono text-[clamp(0.68rem,1vw,0.82rem)] tracking-[0.05em] text-ink"
          aria-label={`PGP fingerprint ${NORMALIZED_PGP_FINGERPRINT}`}
        >
          {PGP_FINGERPRINT_GROUPS.map((group, index) => (
            <span key={`${group}-${index}`} className={index === 5 ? "mobile:ml-2" : undefined} aria-hidden="true">
              {group}
            </span>
          ))}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <ContactCopyButton className={PGP_ACTION_CLASS} value={NORMALIZED_PGP_FINGERPRINT}>
          Copy fingerprint
        </ContactCopyButton>
        <a href="/pubkey.asc" target="_blank" rel="noopener noreferrer" className={PGP_ACTION_CLASS}>
          View public key
          {ArrowIcon}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      </div>
    </section>
  );
}

function ActivityCard({ activity }: { activity: GithubActivity | null }) {
  return (
    <section
      aria-labelledby="activity-title"
      className={`${COMPACT_SECTION_CLASS} col-span-2 order-5 sm:col-span-2 sm:order-5 lg:col-span-4 lg:order-4`}
      data-scroll-reveal
      data-scroll-reveal-state="visible"
      suppressHydrationWarning
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-mono text-[0.62rem] font-bold uppercase tracking-[0.11em] text-muted">
            {ActivityIcon}
            <span>04 · Activity</span>
          </div>
          <h2 id="activity-title" className="m-0 text-xl font-bold text-ink">
            {activity ? `${activity.total.toLocaleString()} contributions in the last year` : "GitHub activity unavailable"}
          </h2>
          <p className="m-0 mt-2 text-sm leading-[1.45] text-muted">
            I mainly use GitHub, but also Bitbucket and Gitee depending on the employer or client.
          </p>
        </div>
      </div>

      <GithubActivityHeatmap activity={activity} />
    </section>
  );
}

export default function ContactGrid({ githubActivity }: { githubActivity: GithubActivity | null }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
      <EmailCard />
      <PgpCard />
      <ContactCard
        href="https://github.com/kaibelmo"
        className={`${COMPACT_CARD_CLASS} col-span-1 order-3 sm:col-span-1 sm:order-3 lg:col-span-2 lg:order-3`}
        icon={GithubIcon}
        meta="03 · Code"
        title="GitHub"
        value="@kaibelmo"
      />
      <ContactCard
        href="https://x.com/belmo01"
        className={`${CARD_CLASS} col-span-1 order-4 sm:col-span-1 sm:order-4 lg:col-span-4 lg:order-5`}
        icon={XIcon}
        meta="05 · Social"
        title="X"
        value="@belmo01"
      />
      <ActivityCard activity={githubActivity} />
      <ContactCard
        href="https://www.linkedin.com/in/belmo/"
        className={`${CARD_CLASS} col-span-2 order-6 sm:col-span-2 sm:order-6 lg:col-span-2 lg:order-6`}
        icon={LinkedInIcon}
        meta="06 · Network"
        title="LinkedIn"
        value="/in/belmo"
      />
    </div>
  );
}
