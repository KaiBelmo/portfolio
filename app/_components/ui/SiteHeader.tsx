"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { useTheme } from "../system/ThemeProvider";
import styles from "./SiteHeader.module.css";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/projects", "Projects"],
  ["/blog", "Blog"],
  ["/contact", "Contact"],
] as const;

const themes = ["morning", "afternoon", "night"] as const;

function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const update = () => setNow(new Date());
    const frameId = requestAnimationFrame(update);
    const timer = window.setInterval(update, 30000);
    return () => {
      cancelAnimationFrame(frameId);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <time dateTime={now?.toISOString()} suppressHydrationWarning>
      {now
        ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--:--"}
    </time>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduceMotion = !!useReducedMotion();
  const headerRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const restoreFocusRef = useRef(true);
  const scrolledRef = useRef(false);
  const { selectedTheme, setThemeOverride, isAuto, isThemeTransitioning } = useTheme();

  const menuVariants: Variants = reduceMotion
    ? {
        closed: { opacity: 0, y: 0, scale: 1, transition: { duration: 0 } },
        open: { opacity: 1, y: 0, scale: 1, transition: { duration: 0 } },
      }
    : {
        closed: {
          opacity: 0,
          y: -8,
          scale: 0.985,
          transition: {
            duration: 0.12,
            ease: [0.4, 0, 1, 1],
            when: "afterChildren",
            staggerChildren: 0.018,
            staggerDirection: -1,
          },
        },
        open: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.2,
            ease: [0.22, 1, 0.36, 1],
            when: "beforeChildren",
            delayChildren: 0.025,
            staggerChildren: 0.035,
          },
        },
      };

  const menuItemVariants: Variants = reduceMotion
    ? {
        closed: { opacity: 0, y: 0, transition: { duration: 0 } },
        open: { opacity: 1, y: 0, transition: { duration: 0 } },
      }
    : {
        closed: {
          opacity: 0,
          y: -4,
          transition: { duration: 0.08, ease: [0.4, 0, 1, 1] },
        },
        open: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.16, ease: [0.22, 1, 0.36, 1] },
        },
      };

  useEffect(() => {
    restoreFocusRef.current = false;
    const frameId = window.requestAnimationFrame(() => setOpen(false));
    return () => window.cancelAnimationFrame(frameId);
  }, [pathname]);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const next = window.scrollY > 24;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    };
    const onScroll = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const toggle = toggleRef.current;
    const frameId = window.requestAnimationFrame(() => firstLinkRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        restoreFocusRef.current = true;
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !headerRef.current) return;
      const focusable = Array.from(
        headerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.getClientRects().length > 0);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("keydown", onKeyDown);
      if (restoreFocusRef.current) toggle?.focus();
      restoreFocusRef.current = true;
    };
  }, [open]);

  const closeMenu = (restoreFocus = false) => {
    restoreFocusRef.current = restoreFocus;
    setOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className={`${styles.siteHeader} ${scrolled ? styles.isScrolled : ""} ${open ? styles.hasOpenNav : ""}`}
    >
      <Link className={styles.siteBrand} href="/" onClick={() => closeMenu(false)}>
        <span className={styles.brandLogoBox} aria-hidden="true">
          <Image className={styles.brandLogo} src="/assets/logo.svg" alt="" width={18} height={18} priority />
        </span>
        <span className={styles.brandCopy}>
          <strong>Kai Belmo</strong>
          <small>Software engineer</small>
        </span>
      </Link>

      <div className={styles.mobileHeaderActions}>
        <button
          ref={toggleRef}
          className={`${styles.navToggle} ${open ? styles.isOpen : ""}`}
          type="button"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-controls="site-mobile-navigation"
          aria-expanded={open}
          onClick={() => {
            restoreFocusRef.current = true;
            setOpen((value) => !value);
          }}
        >
          <span className={styles.navToggleLabel}>{open ? "Close" : "Menu"}</span>
          <span className={styles.navToggleIcon} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </div>

      <nav
        id="site-primary-navigation"
        className={`${styles.siteNav} ${styles.desktopNav}`}
        aria-label="Primary navigation"
      >
        <div className={styles.navLinks}>
          {links.map(([to, label]) => {
            const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
            return (
              <div key={to} className={styles.navItem}>
                  <Link
                    href={to}
                    className={`${styles.siteNavLink} ${isActive ? styles.isActive : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className={styles.bracketLeft} aria-hidden="true">[</span>
                    <span className={styles.navLinkLabel}>{label}</span>
                    <span className={styles.bracketRight} aria-hidden="true">]</span>
                  </Link>
              </div>
            );
          })}
        </div>
      </nav>

      <AnimatePresence initial={false}>
        {open && (
          <>
            <motion.div
              className={styles.navBackdrop}
              aria-hidden="true"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.12 }}
              onClick={() => closeMenu(true)}
            />
            <motion.nav
              id="site-mobile-navigation"
              className={`${styles.siteNav} ${styles.mobileNav}`}
              aria-label="Primary navigation"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className={styles.navLinks}>
                {links.map(([to, label], index) => {
                  const isActive = pathname === to || (to !== "/" && pathname.startsWith(to));
                  return (
                    <motion.div
                      key={to}
                      className={styles.navItem}
                      variants={menuItemVariants}
                    >
                      <Link
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={to}
                        className={`${styles.siteNavLink} ${isActive ? styles.isActive : ""}`}
                        aria-current={isActive ? "page" : undefined}
                        onClick={() => closeMenu(false)}
                      >
                        <span className={styles.bracketLeft} aria-hidden="true">[</span>
                        <span className={styles.navLinkLabel}>{label}</span>
                        <span className={styles.bracketRight} aria-hidden="true">]</span>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
              <motion.div className={styles.mobileNavFooter} variants={menuItemVariants}>
                <div className={styles.mobileThemePicker}>
                  <span className={styles.mobileThemeLabel}>Theme</span>
                  <div className={styles.mobileThemeOptions}>
                    {themes.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={selectedTheme === option && !isAuto ? styles.isActive : ""}
                        aria-label={`Use ${option} lighting`}
                        aria-pressed={selectedTheme === option && !isAuto}
                        onClick={() => setThemeOverride(option)}
                        disabled={isThemeTransitioning}
                      >
                        {option[0].toUpperCase()}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={isAuto ? styles.isActive : ""}
                      aria-label="Use automatic lighting"
                      aria-pressed={isAuto}
                      onClick={() => setThemeOverride(null)}
                      disabled={isThemeTransitioning}
                    >
                      Auto
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <div className={styles.headerTools}>
        <div className={styles.clockBlock}>
          <span>Local time</span>
          <Clock />
        </div>
        <div
          className={`${styles.lightSwitch} ${isThemeTransitioning ? styles.isTransitioning : ""}`}
          aria-label="Preview room lighting"
          aria-busy={isThemeTransitioning}
        >
          {themes.map((option) => (
            <button
              key={option}
              type="button"
              className={selectedTheme === option && !isAuto ? styles.isActive : ""}
              aria-label={`Use ${option} lighting`}
              aria-pressed={selectedTheme === option && !isAuto}
              title={`${option[0].toUpperCase()} — ${option} lighting`}
              onClick={() => setThemeOverride(option)}
              disabled={isThemeTransitioning}
            >
              {option[0].toUpperCase()}
            </button>
          ))}
          <button
            type="button"
            className={`${styles.autoLight} ${isAuto ? styles.isActive : ""}`}
            onClick={() => setThemeOverride(null)}
            aria-label="Use automatic lighting"
            aria-pressed={isAuto}
            title="Automatic lighting"
            disabled={isThemeTransitioning}
          >
            Auto
          </button>
        </div>
      </div>
    </header>
  );
}
