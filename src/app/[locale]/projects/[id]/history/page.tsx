import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { requireSession } from '@/lib/auth/middleware';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { listGenerationLogs } from '@/lib/db/repositories/generation-log.repo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default async function HistoryPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id: idStr } = await params;
  setRequestLocale(locale);
  const user = await requireSession();
  const t = await getTranslations({ locale, namespace: 'history' });
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();
  const project = await getProjectById(id, user.id);
  if (!project) notFound();
  const { data: logs } = await listGenerationLogs({ projectId: id, page: 1, limit: 50 });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('title')}</h1>
      <p className="text-sm text-muted-foreground">{project.title}</p>
      {logs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">{t('empty')}</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('table')}</CardTitle>
            <CardDescription>{logs.length} entries</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('time')}</TableHead>
                  <TableHead>{t('provider')}</TableHead>
                  <TableHead>{t('model')}</TableHead>
                  <TableHead>{t('duration')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">
                      {new Date(l.createdAt * 1000).toLocaleString(locale)}
                    </TableCell>
                    <TableCell>{l.provider}</TableCell>
                    <TableCell className="font-mono text-xs">{l.model}</TableCell>
                    <TableCell>
                      {l.durationMs ? `${(l.durationMs / 1000).toFixed(1)}s` : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          l.status === 'success'
                            ? 'success'
                            : l.status === 'fail'
                              ? 'destructive'
                              : 'warning'
                        }
                      >
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
