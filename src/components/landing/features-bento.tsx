'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import {
  PenLine,
  Users,
  Cpu,
  FileDown,
  Terminal,
  Upload,
} from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { FEATURES } from '@/lib/landing/features';
import { FeatureCard } from '@/components/landing/feature-card';
import { SectionWrapper } from '@/components/landing/section-wrapper';

const ICON_MAP: Record<string, LucideIcon> = {
  PenLine,
  Users,
  Cpu,
  FileDown,
  Terminal,
  Upload,
};

const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function FeaturesBento() {
  const t = useTranslations('landing.features');
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <motion.div
          variants={STAGGER_CONTAINER}
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {FEATURES.map((feature) => {
            const Icon = ICON_MAP[feature.icon];
            if (!Icon) return null;
            return (
              <motion.div
                key={feature.id}
                variants={STAGGER_ITEM}
                className={feature.colSpan === 2 ? 'lg:col-span-2' : ''}
              >
                <FeatureCard
                  icon={Icon}
                  title={t(feature.titleKey)}
                  description={t(feature.descriptionKey)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
