import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Button } from '@/components/ui/button';

export default async function LandingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'landing' });
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{t('heroTitle')}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{t('heroSubtitle')}</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href={`/${locale}/generate`}>
            <Button size="lg">{t('cta')}</Button>
          </Link>
          <Link href={`/${locale}/login`}>
            <Button size="lg" variant="outline">
              {t('loginCta')}
            </Button>
          </Link>
        </div>
      </section>
      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">{t('feature1Title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('feature1Desc')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">{t('feature2Title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('feature2Desc')}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold">{t('feature3Title')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t('feature3Desc')}</p>
        </div>
      </section>
    </div>
  );
}
