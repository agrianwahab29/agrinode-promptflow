'use client';

import { useTranslations } from 'next-intl';
import { AnimatedCounter } from '@/components/landing/animated-counter';
import { LogoPlaceholder } from '@/components/landing/logo-placeholder';

const COUNTER_TARGET = 100;
const PARTNER_LOGOS = ['StudioX', 'AnimPro', 'KreatorID', 'PixelLab', 'MotionAI'] as const;

export function SocialProofBar() {
  const t = useTranslations('landing');

  return (
    <section className="border-y border-border bg-background/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
            {PARTNER_LOGOS.map((name) => (
              <LogoPlaceholder
                key={name}
                name={name}
                className="text-base text-muted-foreground opacity-50 grayscale transition-opacity hover:opacity-100"
              />
            ))}
          </div>
          <div className="text-center md:text-right">
            <span className="text-2xl font-bold text-primary">
              <AnimatedCounter target={COUNTER_TARGET} suffix="+" />
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('socialProof.subheadline')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
