'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({ children, className, id }: SectionWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      id={id}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
