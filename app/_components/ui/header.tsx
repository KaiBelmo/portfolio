"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  /** lock scroll */
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isOpen]);

  /** close on ESC */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggle = () => setIsOpen((o) => !o);

  const MENU = [
    { title: "Home", href: "/#whoami" },
    { title: "Projects", href: "/projects" },
    { title: "Contact", href: "/#contact" },
  ];

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[500] ${isOpen ? "" : "bg-white/60"}  backdrop-blur-xl`}>
        <div className="hidden md:flex container mx-auto px-6 py-4 items-center justify-between">
          <div className="flex-1 flex justify-start z-50">
            <Link href="/#whoami" className="uppercase tracking-[0.2rem] font-serif font-medium text-lg md:text-xl cursor-pointer hover:opacity-80 transition-opacity">
              Kai Belmo
            </Link>
          </div>

          <nav className="hidden lg:flex gap-8 text-gray-700">
            {MENU.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-black transition"
              >
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="md:hidden px-6 py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-start z-50">
            <p className={`uppercase tracking-[0.2rem] font-serif font-medium text-lg cursor-pointer ${isOpen ? "text-white" : "[text-shadow:0_0_6px_rgba(255,255,255,0.6),_0_0_12px_rgba(255,255,255,0.4)]"}`}>
              Kai Belmo
            </p>
          </div>
          
          <button
            className={`hamburger--thin ${isOpen ? "active" : ""}`}
            onClick={toggle}
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
        <div className="flex h-full flex-col items-center justify-center space-y-8 px-6 py-16">
          {MENU.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-2xl font-medium text-white hover:opacity-80"
              onClick={() => setIsOpen(false)}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
