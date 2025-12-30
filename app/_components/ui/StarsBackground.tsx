"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STAR_FILES = ["/star1.svg", "/star2.svg", "/star3.svg", "/star4.svg"];

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export default function StarsBackground() {
  const [stars, setStars] = useState<any[]>([]);

  useEffect(() => {
    console.log("StarsBackground component mounted");
    const instances = 15; // Reduced from 36 to 15

    const generated = Array.from({ length: instances }).map(() => ({
      file: STAR_FILES[Math.floor(Math.random() * STAR_FILES.length)],
      left: rand(0, 100),
      top: rand(0, 100),
      size: Math.round(rand(12, 35)), // Increased size range
      duration: rand(6, 12), // Slower animations
      delay: rand(0, 5), // Reduced delay range
      rotateAmount:
        Math.round(rand(5, 25)) * (Math.random() > 0.5 ? 1 : -1), // Reduced rotation
    }));

    console.log("Generated stars:", generated);
    setStars(generated);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-[1000]"
      aria-hidden
    >
      <div className="absolute top-4 left-4 w-7 h-7 rounded-full" />
      
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
            y: [0, -10, 0], // Reduced movement
            x: [0, 5, -5, 0], // Reduced movement
            rotate: [0, s.rotateAmount, 0],
            opacity: [0.1, 0.25, 0.15], // Reduced opacity range
            scale: [1, 1.2, 1], // Reduced scale
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
