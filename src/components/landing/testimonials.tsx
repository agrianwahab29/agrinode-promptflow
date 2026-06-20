'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { TestimonialCard } from '@/components/landing/testimonial-card';
import { SectionWrapper } from '@/components/landing/section-wrapper';

const STAGGER_CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const STAGGER_ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const TESTIMONIALS = [
  { quoteKey: 't1Quote', nameKey: 't1Name', roleKey: 't1Role', initials: 'R' },
  { quoteKey: 't2Quote', nameKey: 't2Name', roleKey: 't2Role', initials: 'D' },
  { quoteKey: 't3Quote', nameKey: 't3Name', roleKey: 't3Role', initials: 'S' },
] as const;

export function Testimonials() {
  const t = useTranslations('landing.testimonials');
  const shouldReduceMotion = useReducedMotion();

  return (
    <SectionWrapper className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-3 text-muted-foreground">{t('subtitle')}</p>
        </div>

        <motion.div
          variants={STAGGER_CONTAINER}
          initial={shouldReduceMotion ? false : 'hidden'}
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {TESTIMONIALS.map((item) => (
            <motion.div key={item.initials} variants={STAGGER_ITEM}>
              <TestimonialCard
                quote={t(item.quoteKey)}
                name={t(item.nameKey)}
                role={t(item.roleKey)}
                initials={item.initials}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
