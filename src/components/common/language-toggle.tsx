'use client';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const next = locale === 'id' ? 'en' : 'id';

  function switchTo() {
    startTransition(() => {
      const newPath = pathname.replace(`/${locale}`, `/${next}`);
      router.replace(newPath);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={switchTo}
      disabled={isPending}
      aria-label="Toggle language"
    >
      {locale.toUpperCase()}
    </Button>
  );
}
