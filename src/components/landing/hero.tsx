'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { BrowserMockup } from '@/components/landing/browser-mockup';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events';
import { Button } from '@/components/ui/button';

const ANIM_BASE = { opacity: 0, y: 20 };
const ANIM_IN = { opacity: 1, y: 0 };
const TRANSITION_FAST = { duration: 0.5, ease: 'easeOut' as const };
const TRANSITION_MED = { duration: 0.5, ease: 'easeOut' as const, delay: 0.15 };
const TRANSITION_SLOW = { duration: 0.5, ease: 'easeOut' as const, delay: 0.3 };

export function Hero() {
  const t = useTranslations('landing');
  const locale = useLocale();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-accent/30 to-background pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <motion.h1
            initial={shouldReduceMotion ? false : ANIM_BASE}
            animate={ANIM_IN}
            transition={TRANSITION_FAST}
            className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              {t('heroTitle')}
            </span>
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : ANIM_BASE}
            animate={ANIM_IN}
            transition={TRANSITION_MED}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? false : ANIM_BASE}
            animate={ANIM_IN}
            transition={TRANSITION_SLOW}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href={`/${locale}/register`}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent-foreground text-primary-foreground"
                onClick={() => trackEvent(ANALYTICS_EVENTS.CTA_HERO_CLICK)}
              >
                {t('heroCtaPrimary')}
              </Button>
            </Link>
            <Link href={`/${locale}/login`}>
              <Button size="lg" variant="outline">
                {t('heroCtaSecondary')}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 }}
            className="mx-auto mt-16 max-w-3xl"
          >
            <BrowserMockup>
              <div className="flex items-center justify-center p-12 text-muted-foreground">
                <p className="text-sm">{t('demoPreview')}</p>
              </div>
            </BrowserMockup>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
