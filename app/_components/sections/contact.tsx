"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Copy, Check } from "lucide-react";

export default function Contact() {
  const email = "belmomohamedali@gmail.com";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy email:", e);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-28 flex flex-col justify-center px-6 container mx-auto mb-20 md:mb-28 text-[shadow:2px_2px_20px_white]"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-3xl sm:text-4xl md:text-5xl font-serif tracking-tight"
      >
        Let&apos;s build something great
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6 }}
        className="max-w-2xl mt-4 md:mt-6 text-gray-400 leading-relaxed text-base md:text-lg"
      >
        Have an idea or a project in mind? I’m open to freelance work, collaborations,
        and full-time opportunities. Reach out and I’ll get back to you soon.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4"
      >
        <div className="flex gap-3 w-full sm:w-auto">
            <a
            href={`mailto:${email}`}
            className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-2.5 text-sm md:text-base hover:bg-white/10 transition-colors"
            >
            <Mail size={18} /> Email me
            </a>

            <button
            type="button"
            onClick={handleCopy}
            className="flex-1 sm:flex-none inline-flex justify-center items-center gap-2 rounded-md border border-white/15 px-5 py-2.5 text-sm md:text-base hover:bg-white/5 transition-colors active:bg-white/10"
            aria-live="polite"
            >
            {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
            {copied ? "Copied" : "Copy"}
            </button>
        </div>

        <span className="text-sm text-gray-500 select-all hidden sm:block">{email}</span>
      </motion.div>
    </section>
  );
}