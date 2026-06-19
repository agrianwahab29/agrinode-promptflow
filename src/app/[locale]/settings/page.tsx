import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireSession } from '@/lib/auth/middleware';
import { listProviderConfigs, toProviderConfigDTO } from '@/lib/db/repositories/provider-config.repo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProviderConfigForm } from '@/components/settings/provider-config-form';

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
              dtos.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {p.provider} • {p.baseUrl} • {p.model}
                    </div>
                    <div className="mt-1 font-mono text-xs">{p.apiKeyMasked}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.isActive === 1 && <Badge variant="success">Active</Badge>}
                    <form
                      action={`/api/v1/settings/providers/${p.id}/delete`}
                      method="post"
                    >
                      <Button variant="ghost" size="sm" type="submit">
                        Delete
                      </Button>
                    </form>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
