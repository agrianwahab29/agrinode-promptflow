'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'promptflow_v3_changelog_dismissed';

export function ChangelogBanner() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(DISMISS_KEY)) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="rounded-md border border-[var(--color-info)]/40 bg-[var(--color-info)]/10 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <strong className="font-medium">{t('v3ChangelogTitle')}</strong>
          <p className="mt-1 text-muted-foreground">{t('v3ChangelogDesc')}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={() => {
            setVisible(false);
            localStorage.setItem(DISMISS_KEY, '1');
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
