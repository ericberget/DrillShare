'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface CategoryTransitionProps {
  children: ReactNode;
  categoryKey: string;
  className?: string;
}

const categoryVariants = {
  initial: {
    opacity: 0,
    x: 50,
    filter: 'blur(4px)',
  },
  in: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    x: -50,
    filter: 'blur(4px)',
  },
};

const categoryTransition = {
  type: 'tween',
  ease: [0.25, 0.25, 0, 1],
  duration: 0.4,
};

export function CategoryTransition({ 
  children, 
  categoryKey, 
  className = '' 
}: CategoryTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={categoryKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={categoryVariants}
        transition={categoryTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
} 