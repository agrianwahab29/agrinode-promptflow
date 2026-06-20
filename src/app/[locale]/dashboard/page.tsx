import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireSession } from '@/lib/auth/middleware';
import { getDashboardStats } from '@/lib/db/repositories/dashboard.repo';
import { MetricCard } from '@/components/dashboard/metric-card';
import { WeeklyTrendChart } from '@/components/dashboard/weekly-trend-chart';
import { SuccessFailBarChart } from '@/components/dashboard/success-fail-bar-chart';
import { PerProviderBreakdownTable } from '@/components/dashboard/per-provider-breakdown-table';
import { RecentActivityTable } from '@/components/dashboard/recent-activity-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  // V2: use repository pattern instead of direct Drizzle queries (L32, L37)
  const stats = await getDashboardStats(user.id);

  const storageMB = (stats.storageBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      {/* 6-8 Metric Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard title={t('kpi1Title')} value={stats.totalProjects} description={t('kpi1Desc')} />
        <MetricCard title={t('kpi5Title')} value={stats.successfulGenerations} description={t('kpi5Desc')} />
        <MetricCard title="Gagal" value={stats.failedGenerations} description="Generate yang gagal" />
        <MetricCard title="Partial" value={stats.partialGenerations} description="Generate dengan warning" />
        <MetricCard
          title={t('kpiLatencyTitle')}
          value={stats.avgDurationMs ? `${Math.round(stats.avgDurationMs / 1000)}s` : '—'}
          description={t('kpiLatencyDesc')}
        />
        <MetricCard title="Storage" value={`${storageMB} MB`} description="Total ukuran referensi" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proyek per Minggu</CardTitle>
          </CardHeader>
          <CardContent>
            <WeeklyTrendChart data={stats.weeklyTrend} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sukses vs Gagal</CardTitle>
          </CardHeader>
          <CardContent>
            <SuccessFailBarChart
              success={stats.successfulGenerations}
              failed={stats.failedGenerations}
              partial={stats.partialGenerations}
            />
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <PerProviderBreakdownTable rows={stats.perProviderBreakdown} />
        <RecentActivityTable projects={stats.recentProjects} />
      </div>
    </div>
  );
}
