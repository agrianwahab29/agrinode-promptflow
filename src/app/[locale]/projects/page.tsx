import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/middleware';
import { listActiveProjects, toProjectDTO } from '@/lib/db/repositories/project.repo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireSession();
  const t = await getTranslations({ locale, namespace: 'projects' });
  const { data } = await listActiveProjects({ userId: user.id, page: 1, limit: 20 });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Link href={`/${locale}/generate`}>
          <Button>{t('newProject')}</Button>
        </Link>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">{t('empty')}</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => {
            const dto = toProjectDTO(p);
            const statusVariant =
              dto.status === 'complete'
                ? 'success'
                : dto.status === 'failed'
                  ? 'destructive'
                  : 'secondary';
            return (
              <Link key={p.id} href={`/${locale}/projects/${p.id}`}>
                <Card className="transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1 text-base">{dto.title}</CardTitle>
                      <Badge variant={statusVariant}>{dto.status}</Badge>
                    </div>
                    <CardDescription>
                      {dto.durationType} • {dto.durationTargetSeconds}s • {dto.styleType} {dto.aspectRatio}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    {new Date(dto.createdAt).toLocaleString(locale)}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
