'use client';

import { type ReactNode } from 'react';
import { useTranslations } from 'next-intl';

interface BrowserMockupProps {
  children: ReactNode;
  className?: string;
  url?: string;
}

export function BrowserMockup({ children, className, url }: BrowserMockupProps) {
  const t = useTranslations('landing.demo');
  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-card shadow-lg ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-yellow-500" aria-hidden="true" />
        <span className="h-3 w-3 rounded-full bg-green-500" aria-hidden="true" />
        <div className="ml-4 flex-1">
          <div className="mx-auto h-5 w-2/3 rounded-md border border-border bg-background/80 px-2 text-[10px] leading-5 text-muted-foreground">
            {url || t('browserUrl')}
          </div>
        </div>
      </div>
      <div className="bg-background">{children}</div>
    </div>
  );
}
