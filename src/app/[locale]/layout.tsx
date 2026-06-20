import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Toaster } from 'sonner';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { routing } from '@/lib/i18n/config';
import { auth } from '@/lib/auth/config';
import { AppHeader } from '@/components/common/app-header';
import { Providers } from '@/components/providers';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  const session = await auth();
  const isAuthenticated = !!session?.user;
  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        {isAuthenticated && <AppHeader />}
        {isAuthenticated ? (
          <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-[1280px] px-4 py-8 md:px-6 lg:px-8">
            {children}
            <Toaster richColors position="top-right" />
          </main>
        ) : (
          <>
            {children}
            <Toaster richColors position="top-right" />
          </>
        )}
      </Providers>
    </NextIntlClientProvider>
  );
}
