'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics/events';

const THEME_OPTIONS = [
  { value: 'light' as const, icon: Sun, labelKey: 'lightMode' },
  { value: 'dark' as const, icon: Moon, labelKey: 'darkMode' },
  { value: 'system' as const, icon: Monitor, labelKey: 'systemMode' },
] as const;

export function ThemeToggle() {
  const t = useTranslations('common');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted)
    return (
      <Button variant="ghost" size="icon" disabled className="h-9 w-9">
        <Sun className="h-4 w-4" />
      </Button>
    );

  const current = THEME_OPTIONS.find((o) => o.value === theme) ?? THEME_OPTIONS[1];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label={t('themeToggle')}>
          <Icon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEME_OPTIONS.map((opt) => {
          const ThemeIcon = opt.icon;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => {
                setTheme(opt.value);
                trackEvent(ANALYTICS_EVENTS.THEME_CHANGE, { theme: opt.value });
              }}
            >
              <ThemeIcon className="mr-2 h-4 w-4" />
              {t(opt.labelKey)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
