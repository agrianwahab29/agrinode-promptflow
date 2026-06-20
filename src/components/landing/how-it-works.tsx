'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { PenLine, Wand2, FileDown } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { SectionWrapper } from '@/components/landing/section-wrapper';

const STEPS: { titleKey: string; descKey: string; icon: LucideIcon }[] = [
  { titleKey: 'step1Title', descKey: 'step1Desc', icon: PenLine },
  { titleKey: 'step2Title', descKey: 'step2Desc', icon: Wand2 },
  { titleKey: 'step3Title', descKey: 'step3Desc', icon: FileDown },
];

const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('step1Title').split(' ')[0]}{' '}
            <span className="text-primary">&amp;</span>{' '}
            {t('step3Title').split(' ')[0]}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('sectionTitle')}</p>
        </div>

        <motion.div
          variants={STAGGER_CONTAINER}
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true }}
          className="relative grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Connector lines - desktop only */}
          <div className="pointer-events-none absolute left-0 right-0 top-10 hidden lg:block">
            <div className="mx-auto h-px w-2/3 bg-border" />
          </div>

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.titleKey}
              variants={STAGGER_ITEM}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-lg">
                {idx + 1}
              </div>
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <step.icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{t(step.titleKey)}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">{t(step.descKey)}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
