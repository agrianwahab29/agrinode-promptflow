'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const hoverProps = shouldReduceMotion
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      };

  return (
    <motion.div
      {...hoverProps}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`group rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/50 hover:shadow-md ${
        className ?? ''
      }`}
    >
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </motion.div>
  );
}
