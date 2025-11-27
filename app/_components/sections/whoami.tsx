"use client";

import { motion } from 'framer-motion';
import { Link as LinkIcon, Github, FileText } from 'lucide-react';
import HoverLinkText from "../ui/hoverlinktext";
import HoverUnderline from "../ui/hoverunderlinetext";
import HeroSvg from "../ui/heroSvg";

export default function PortfolioIntro() {
  return (
    <section
      id="whoami"
      className="relative container mx-auto px-6 py-24"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="flex flex-col gap-6 md:gap-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-[shadow:2px_2px_20px_white]"
          >
            <span className="relative group cursor-help">
              Kai Belmo
              <span
                className="absolute left-1/2 -translate-x-1/2 top-full
                 opacity-0 group-hover:opacity-100 transition-opacity
                 bg-black/80 text-white text-sm px-2 py-1 rounded
                 pointer-events-none tracking-normal whitespace-nowrap"
              >
                Mohamed Ali Belmokhtaria
              </span>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-3xl text-xl sm:text-2xl md:text-3xl font-light leading-relaxed md:leading-snug text-[shadow:2px_2px_20px_white]"
          >
            <HoverLinkText href="https://www.linkedin.com/in/belmo" as="p">
              I craft front-ends, back-end servers, and everything in between!
            </HoverLinkText>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="max-w-3xl text-gray-500 leading-relaxed text-base md:text-lg"
          >
            <span className="hidden md:block text-[shadow:2px_2px_20px_white]">
              I began in competitive programming, winning a national CTF in 2019
              and joining Google Hash Code the same year. Even before college, I
              was fascinated by Linux internals, and during my studies in
              computer science in China, I developed a passion for front-end
              development. Since then, I&apos;ve grown into full-stack
              development, building software that is both functional and
              enjoyable to use.
            </span>
            <span className="md:hidden">
              My background in competitive programming (2019 CTF win, Google
              Hash Code) and a fascination with Linux internals set the stage
              for my CS studies in China. This path led me directly to software
              engineering, and I am now a full-stack developer focused on
              building functional, user-friendly software
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap gap-4 md:gap-6 mt-4 md:mt-6 text-xs md:text-sm text-gray-500 uppercase tracking-wider"
          >
            <HoverUnderline
              href="https://portfolio-win95.vercel.app/"
              className="text-gray-500 hover:text-black transition-colors duration-200 group"
            >
              <span className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <span>Windows 95 Portfolio</span>
              </span>
            </HoverUnderline>
            <HoverUnderline
              href="https://github.com/kaibelmo"
              className="text-gray-500 hover:text-black transition-colors duration-200 group"
            >
              <span className="flex items-center gap-2">
                <Github className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <span>Github</span>
              </span>
            </HoverUnderline>
            <HoverUnderline
              href="/_resume_me.pdf"
              className="text-gray-500 hover:text-black transition-colors duration-200 group"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />
                <span>Download resume</span>
              </span>
            </HoverUnderline>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="hidden lg:flex justify-center -mt-16"
        >
          <HeroSvg />
        </motion.div>
      </div>
    </section>
  );
}
