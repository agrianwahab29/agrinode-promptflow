'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useReducedMotion } from 'framer-motion';
import { BrowserMockup } from '@/components/landing/browser-mockup';
import { SectionWrapper } from '@/components/landing/section-wrapper';

const MOCK_INPUT = 'Kucing petualang di hutan ajaib, 30 detik, gaya anime';
const MOCK_OUTPUT = `{
  "title": "Kucing Petualang",
  "characters": [
    { "name": "Mochi", "traits": ["kucing oranye", "mata hijau"] }
  ],
  "scenes": [
    { "id": 1, "description": "Mochi berjalan di hutan ajaib" }
  ]
}`;
const WORD_DELAY_MS = 60;
const LOOP_INTERVAL_MS = 9000;
const WORDS = MOCK_OUTPUT.split(' ');

export function ProductDemo() {
  const t = useTranslations('landing.demo');
  const shouldReduceMotion = useReducedMotion();
  const [displayedOutput, setDisplayedOutput] = useState(
    shouldReduceMotion ? MOCK_OUTPUT : '',
  );
  const [wordIndex, setWordIndex] = useState(0);

  const resetTyping = useCallback(() => {
    setWordIndex(0);
    setDisplayedOutput('');
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = setInterval(() => {
      resetTyping();
    }, LOOP_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [shouldReduceMotion, resetTyping]);

  useEffect(() => {
    if (shouldReduceMotion || wordIndex >= WORDS.length) return;

    const timeout = setTimeout(() => {
      setDisplayedOutput((prev) => (prev ? prev + ' ' : '') + WORDS[wordIndex]);
      setWordIndex((i) => i + 1);
    }, WORD_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [wordIndex, shouldReduceMotion]);

  return (
    <SectionWrapper className="py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('title')}
          </h2>
        </div>

        <BrowserMockup>
          <div className="p-6">
            {/* Input section */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('inputLabel')}
              </label>
              <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">
                {MOCK_INPUT}
              </div>
            </div>

            {/* Loading bar */}
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent-foreground"
                  style={{
                    width: shouldReduceMotion
                      ? '100%'
                      : `${Math.min((wordIndex / WORDS.length) * 100, 100)}%`,
                    transition: 'width 0.3s ease-out',
                  }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {shouldReduceMotion
                  ? '100%'
                  : `${Math.min(Math.round((wordIndex / WORDS.length) * 100), 100)}%`}
              </span>
            </div>

            {/* Output section */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('outputLabel')}
              </label>
              <pre className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-xs leading-relaxed text-foreground">
                <code>{displayedOutput}</code>
              </pre>
            </div>
          </div>
        </BrowserMockup>
      </div>
    </SectionWrapper>
  );
}
