import { setRequestLocale, getTranslations } from 'next-intl/server';
import { count, avg, eq, and, isNull } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/middleware';
import { db } from '@/lib/db/client';
import { projects, generationLogs } from '@/lib/db/schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireSession();
  const t = await getTranslations({ locale, namespace: 'dashboard' });

  const [projectCount] = await db
    .select({ value: count() })
    .from(projects)
    .where(and(eq(projects.userId, user.id), isNull(projects.deletedAt)));
  const [successCount] = await db
    .select({ value: count() })
    .from(generationLogs)
    .where(
      and(
        eq(generationLogs.projectId, projects.id),
        eq(projects.userId, user.id),
        eq(generationLogs.status, 'success'),
      ),
    );
  const [avgDuration] = await db
    .select({ value: avg(generationLogs.durationMs) })
    .from(generationLogs)
    .where(
      and(
        eq(generationLogs.projectId, projects.id),
        eq(projects.userId, user.id),
      ),
    );

  const cards: { title: string; value: string; desc: string }[] = [
    { title: t('kpi1Title'), value: String(projectCount?.value ?? 0), desc: t('kpi1Desc') },
    { title: t('kpi5Title'), value: String(successCount?.value ?? 0), desc: t('kpi5Desc') },
    {
      title: t('kpiLatencyTitle'),
      value: avgDuration?.value ? `${Math.round(Number(avgDuration.value) / 1000)}s` : '—',
      desc: t('kpiLatencyDesc'),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle className="text-base">{c.title}</CardTitle>
              <CardDescription>{c.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
