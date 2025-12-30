'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimationWrapperProps {
  children: ReactNode;
  pageKey: string;
  className?: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10, 
    transition: {
      duration: 0.2, 
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function AnimationWrapper({ 
  children, 
  pageKey, 
  className = 'container mx-auto px-4 sm:px-6 py-8 sm:py-12' 
}: AnimationWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
