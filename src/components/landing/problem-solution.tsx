'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, Clock, Users, CheckCircle, Zap, FolderOpen } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { SectionWrapper } from '@/components/landing/section-wrapper';

const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

interface ProblemSolutionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant: 'problem' | 'solution';
}

function ProblemSolutionCard({ icon: Icon, title, description, variant }: ProblemSolutionCardProps) {
  return (
    <motion.div
      variants={STAGGER_ITEM}
      className={`flex gap-4 rounded-xl border p-5 ${
        variant === 'problem'
          ? 'border-destructive/30 bg-destructive/5'
          : 'border-primary/30 bg-primary/5'
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          variant === 'problem'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-primary/10 text-primary'
        }`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}

const PROBLEMS: { titleKey: string; descKey: string; icon: LucideIcon }[] = [
  { titleKey: 'problem1Title', descKey: 'problem1Desc', icon: AlertTriangle },
  { titleKey: 'problem2Title', descKey: 'problem2Desc', icon: Clock },
  { titleKey: 'problem3Title', descKey: 'problem3Desc', icon: Users },
];

const SOLUTIONS: { titleKey: string; descKey: string; icon: LucideIcon }[] = [
  { titleKey: 'solution1Title', descKey: 'solution1Desc', icon: CheckCircle },
  { titleKey: 'solution2Title', descKey: 'solution2Desc', icon: Zap },
  { titleKey: 'solution3Title', descKey: 'solution3Desc', icon: FolderOpen },
];

export function ProblemSolution() {
  const t = useTranslations('landing.problemSolution');
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper id="problem-solution" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('problem1Title').split(' ')[0]}{' '}
            <span className="text-primary">&amp;</span>{' '}
            {t('solution1Title').split(' ')[0]}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t('sectionTitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <motion.div
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {PROBLEMS.map((p) => (
              <ProblemSolutionCard
                key={p.titleKey}
                icon={p.icon}
                title={t(p.titleKey)}
                description={t(p.descKey)}
                variant="problem"
              />
            ))}
          </motion.div>

          <motion.div
            variants={STAGGER_CONTAINER}
            initial={shouldReduceMotion ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col gap-4"
          >
            {SOLUTIONS.map((s) => (
              <ProblemSolutionCard
                key={s.titleKey}
                icon={s.icon}
                title={t(s.titleKey)}
                description={t(s.descKey)}
                variant="solution"
              />
            ))}
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}
