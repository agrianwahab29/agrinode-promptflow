import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/middleware';
import { listActiveProjects, toProjectDTO } from '@/lib/db/repositories/project.repo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/project-card';
import { Pagination } from '@/components/common/pagination';

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ page?: string; limit?: string }>;
}) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  setRequestLocale(locale);
  const user = await requireSession();
  const t = await getTranslations({ locale, namespace: 'projects' });

  // V2: server-side pagination
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(sp.limit) || 20));
  const { data, total, totalPages } = await listActiveProjects({ userId: user.id, page, limit });

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
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <ProjectCard key={p.id} locale={locale} p={toProjectDTO(p)} />
            ))}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Menampilkan {data.length} dari {total} proyek
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/${locale}/projects`}
          />
        </>
      )}
    </div>
  );
}
