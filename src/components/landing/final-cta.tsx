'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events';
import { Button } from '@/components/ui/button';

export function FinalCta() {
  const t = useTranslations('landing.finalCta');
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-accent to-primary py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
          {t('title')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
          {t('subtitle')}
        </p>
        <div className="mt-8">
          <Link href={`/${locale}/register`}>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90"
              onClick={() => trackEvent(ANALYTICS_EVENTS.CTA_FINAL_CLICK)}
            >
              {t('button')}
            </Button>
          </Link>
        </div>
        <p className="mt-6 text-sm text-primary-foreground/60">{t('disclaimer')}</p>
      </div>
    </section>
  );
}
