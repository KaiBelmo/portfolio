"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STAR_FILES = ["/star1.svg", "/star2.svg", "/star3.svg", "/star4.svg"];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export default function StarsBackground() {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    const instances = 36;

    const generated = Array.from({ length: instances }).map(() => ({
      file: STAR_FILES[Math.floor(Math.random() * STAR_FILES.length)],
      left: rand(0, 100),
      top: rand(0, 100),
      size: Math.round(rand(8, 30)),
      duration: rand(4, 10),
      delay: rand(0, 8),
      rotateAmount:
        Math.round(rand(10, 45)) * (Math.random() > 0.5 ? 1 : -1),
    }));

    setStars(generated);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-[1000]"
      aria-hidden
    >
      {stars.map((s, i) => (
        <motion.img
          key={i}
          src={s.file}
          alt=""
          className="absolute"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: "auto",
            transform: "translate(-50%, -50%)",
            willChange: "transform, opacity",
          }}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, -10, 0],
            rotate: [0, s.rotateAmount, 0],
            opacity: [0.1, 0.3, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: s.delay,
          }}
        />
      ))}
    </div>
  );
}
