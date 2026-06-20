import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { requireSession } from '@/lib/auth/middleware';
import { getProjectById, toProjectDTO } from '@/lib/db/repositories/project.repo';
import { listAssetReferencesByProject } from '@/lib/db/repositories/asset-reference.repo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptPackageSchema } from '@/lib/validation/schemas';
import { ResultTabs } from '@/components/generate/result-tabs';
import { DeleteProjectButton } from '@/components/projects/delete-project-button';

export default async function ProjectDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id: idStr } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'projects' });
  const user = await requireSession();
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();
  const project = await getProjectById(id, user.id);
  if (!project) notFound();
  const dto = toProjectDTO(project);
  const refs = await listAssetReferencesByProject(id);
  let pkg = null;
  if (project.resultJson) {
    try { pkg = PromptPackageSchema.parse(JSON.parse(project.resultJson)); } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{dto.title}</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {dto.durationType} • {dto.durationTargetSeconds}s • {dto.styleType} {dto.aspectRatio}
            {' • '}
            <Badge variant={dto.status === 'complete' ? 'success' : 'secondary'}>{dto.status}</Badge>
          </div>
          {/* V2: show story description if present */}
          {dto.storyDescription && (
            <p className="mt-2 text-sm text-muted-foreground italic max-w-xl">{dto.storyDescription}</p>
          )}
        </div>
        <div className="flex gap-2">
          <a href={`/api/v1/projects/${dto.id}/export?format=json`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">Export JSON</Button>
          </a>
          <a href={`/api/v1/projects/${dto.id}/export?format=markdown`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">Export Markdown</Button>
          </a>
          <Link href={`/${locale}/generate`}>
            <Button size="sm">Generate Baru</Button>
          </Link>
          <DeleteProjectButton projectId={dto.id} projectTitle={dto.title} />
        </div>
      </div>

      {/* V2: read-only refs (upload moved to generate page) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('references')}</CardTitle>
          <CardDescription>{t('referencesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {refs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('referencesEmpty')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {refs.map((r) => (
                <div key={r.id} className="rounded-md border bg-card p-2">
                  <div className="aspect-square w-full overflow-hidden rounded bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={r.blobUrl} alt={r.label ?? r.filename} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-1 truncate text-xs font-medium" title={r.filename}>{r.filename}</div>
                  <div className="mt-1 flex items-center gap-1">
                    <Badge variant="secondary" className="text-[10px]">{r.tipe}</Badge>
                    {/* V2: show AI classification badge if present */}
                    {r.aiClassification && (
                      <Badge variant="info" className="text-[10px]">AI</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {pkg ? (
        <ResultTabs result={pkg} warnings={[]} />
      ) : (
        <Card>
          <CardHeader><CardTitle>Belum di-generate</CardTitle></CardHeader>
          <CardContent>
            <Link href={`/${locale}/generate`}>
              <Button>Generate sekarang</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
