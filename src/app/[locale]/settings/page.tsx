import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireSession } from '@/lib/auth/middleware';
import { listProviderConfigs, toProviderConfigDTO } from '@/lib/db/repositories/provider-config.repo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProviderConfigForm } from '@/components/settings/provider-config-form';
import { ProviderCard } from '@/components/settings/provider-card';

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireSession();
  const t = await getTranslations({ locale, namespace: 'settings' });
  const rows = await listProviderConfigs(user.id);
  const dtos = rows.map(toProviderConfigDTO);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('providersTitle')}</CardTitle>
          <CardDescription>{t('providersDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderConfigForm locale={locale} />
          <div className="mt-6 space-y-2">
            {dtos.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('providersEmpty')}</p>
            ) : (
              dtos.map((p) => <ProviderCard key={p.id} p={p} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
