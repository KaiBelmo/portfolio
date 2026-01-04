"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  /** lock scroll when menu is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
  }, [isOpen]);

  /** close on ESC */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const MENU = [
    { title: "Home", href: "/#whoami" },
    { title: "Projects", href: "/projects" },
    { title: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[500] backdrop-blur-xl duration-200 ${isOpen ? "" : "bg-white/60"}`}>
        {/* Desktop Navbar */}
        <div className="hidden md:flex container mx-auto px-6 py-4 items-center justify-between">
          <div className="flex-1 flex justify-start z-50">
            <Link
              href="/#whoami"
              scroll={false}
              className="uppercase tracking-[0.2rem] font-serif font-medium text-lg md:text-xl hover:opacity-80 transition-opacity"
            >
              Kai Belmo
            </Link>
          </div>

          <nav className="hidden lg:flex gap-8 text-gray-700">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                scroll={false}
                className="hover:text-black transition"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden px-6 py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-start z-50">
            <Link
              href="/#whoami"
              scroll={false}
              onClick={() => setIsOpen(false)}
              className={`uppercase tracking-[0.2rem] font-serif font-medium text-lg cursor-pointer ${
                isOpen
                  ? "text-white"
                  : "[text-shadow:0_0_6px_rgba(255,255,255,0.6),_0_0_12px_rgba(255,255,255,0.4)]"
              }`}
            >
              Kai Belmo
            </Link>
          </div>

          <button
            className={`hamburger--thin ${isOpen ? "active" : ""}`}
            onClick={() => setIsOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </header>

      <div
        ref={overlayRef}
        className={`fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={(e) => {
          if (e.target === overlayRef.current) setIsOpen(false);
        }}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-white hover:opacity-80 transition-opacity"
          aria-label="Close menu"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div className="flex h-full flex-col items-center justify-center space-y-8 px-6 py-16">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              scroll={false}
              onClick={() => setIsOpen(false)}
              className="text-2xl font-medium text-white hover:opacity-80"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
