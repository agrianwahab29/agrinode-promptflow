'use client';

import { useTranslations } from 'next-intl';
import { FaqItem } from '@/components/landing/faq-item';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events';
import { SectionWrapper } from '@/components/landing/section-wrapper';

const FAQ_ITEMS = [
  { qKey: 'q1Question', aKey: 'q1Answer' },
  { qKey: 'q2Question', aKey: 'q2Answer' },
  { qKey: 'q3Question', aKey: 'q3Answer' },
  { qKey: 'q4Question', aKey: 'q4Answer' },
  { qKey: 'q5Question', aKey: 'q5Answer' },
  { qKey: 'q6Question', aKey: 'q6Answer' },
] as const;

export function Faq() {
  const t = useTranslations('landing.faq');

  const handleOpen = () => {
    trackEvent(ANALYTICS_EVENTS.FAQ_EXPAND);
  };

  return (
    <SectionWrapper id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <div className="divide-y divide-border">
          {FAQ_ITEMS.map((item) => (
            <FaqItem
              key={item.qKey}
              question={t(item.qKey)}
              answer={t(item.aKey)}
              defaultOpen={false}
              onOpen={handleOpen}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
