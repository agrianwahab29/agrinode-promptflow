import { setRequestLocale } from 'next-intl/server';
import { requireSession } from '@/lib/auth/middleware';
import { GenerateForm } from '@/components/generate/generate-form';

export default async function GeneratePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireSession();
  return <GenerateForm locale={locale} />;
}
