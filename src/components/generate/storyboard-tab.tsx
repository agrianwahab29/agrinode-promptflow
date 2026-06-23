'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/copy-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { Loader2, Film } from 'lucide-react';
import type { StoryboardSegment } from '@/lib/validation/schemas';

interface StoryboardTabProps {
  projectId: number;
}

export function StoryboardTab({ projectId }: StoryboardTabProps) {
  const t = useTranslations('generate');
  const [segments, setSegments] = useState<StoryboardSegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  useEffect(() => {
    void fetchSegments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  async function fetchSegments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/storyboard`);
      if (!res.ok) return;
      const data = await res.json();
      setSegments(data.segments ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setProgress('');
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segmentDurationSeconds: 10, panelsPerSegment: 8 }),
      });
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const data = JSON.parse(line.slice(5));
          if (data.stage) setProgress(`Tahap: ${data.stage} (${data.segmentIndex ?? '-'}/${data.total ?? '-'})`);
          if (data.segments) {
            setProgress(`Selesai: ${data.segments} segmen dihasilkan`);
            await fetchSegments();
          }
          if (data.message) setProgress(`Error: ${data.message}`);
        }
      }
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('loadingStoryboard')}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (segments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('storyboardTitle')}</CardTitle>
          <CardDescription>{t('storyboardDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Film className="mr-2 h-4 w-4" />}
            {generating ? t('generatingStoryboard') : t('generateStoryboard')}
          </Button>
          {progress && <p className="mt-2 text-sm text-muted-foreground">{progress}</p>}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('storyboardSegments', { count: segments.length })}
        </div>
        <Button variant="outline" onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {generating ? t('regenerating') : t('regenerateStoryboard')}
        </Button>
      </div>
      {generating && progress && <p className="text-sm text-muted-foreground">{progress}</p>}
      {segments.map((seg) => (
        <StoryboardSegmentCard key={seg.segmentIndex} segment={seg} />
      ))}
    </div>
  );
}

function StoryboardSegmentCard({ segment }: { segment: StoryboardSegment }) {
  const panels = segment.panels ?? [];
  const vs = segment.visualStyle;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Segmen {segment.segmentIndex}</CardTitle>
            <Badge variant="secondary">{segment.segmentTimeStart}s - {segment.segmentTimeEnd}s</Badge>
            <Badge variant="outline">{segment.panelCount} panel</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={segment.compiledMarkdownPrompt} label="Salin Markdown" />
          </div>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {vs.aspectRatio} • {vs.artDirection} • {vs.colorPalette}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion type="multiple" className="w-full">
          {panels.map((panel) => (
            <AccordionItem key={panel.index} value={`panel-${panel.index}`}>
              <AccordionTrigger className="text-sm hover:no-underline">
                <div className="flex items-center gap-2 text-left">
                  <Badge variant="secondary" className="shrink-0">{panel.index}</Badge>
                  <span className="text-muted-foreground shrink-0">{panel.time}</span>
                  <span className="font-medium">{panel.title}</span>
                  <span className="text-muted-foreground hidden sm:inline">| {panel.sceneCode}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                <div className="space-y-3 rounded-md bg-muted p-3">
                  <PanelSection label="Aksi/Visual" value={panel.actionVisual} />
                  <PanelSection label="Kamera/Gerakan" value={panel.cameraMovement} />
                  {panel.composition && <PanelSection label="Komposisi" value={panel.composition} />}
                  {panel.lighting && <PanelSection label="Pencahayaan" value={panel.lighting} />}
                  {panel.mood && <PanelSection label="Mood/Suasana" value={panel.mood} />}
                  <Separator />
                  <PanelSection label="Dialog/VO" value={panel.dialogueVo || '(tidak ada)'} />
                  {panel.onScreenText && <PanelSection label="On Screen Text" value={panel.onScreenText} />}
                  <PanelSection label="Transisi" value={panel.transition} />
                  <Separator />
                  <div className="space-y-1">
                    <div className="font-semibold">Prompt Gambar (AI Image Prompt)</div>
                    <div className="rounded border bg-background p-2 font-mono text-xs whitespace-pre-wrap">{panel.imagePrompt}</div>
                    {panel.referenceImagePrompt && (
                      <>
                        <div className="mt-2 font-semibold">Referensi Visual (Thumbnail Prompt)</div>
                        <div className="rounded border bg-background p-2 font-mono text-xs whitespace-pre-wrap">{panel.referenceImagePrompt}</div>
                      </>
                    )}
                  </div>
                  {panel.negativePrompt && <PanelSection label="Negative Prompt" value={panel.negativePrompt} />}
                  <Separator />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {panel.location && <PanelSection label="Lokasi" value={panel.location} />}
                    {panel.charactersPresent.length > 0 && (
                      <PanelSection label="Karakter Hadir" value={panel.charactersPresent.join(', ')} />
                    )}
                    {panel.props && panel.props.length > 0 && <PanelSection label="Properti" value={panel.props.join(', ')} />}
                    {panel.costumeNotes && <PanelSection label="Catatan Kostum" value={panel.costumeNotes} />}
                    {panel.audioNotes && <PanelSection label="Catatan Audio" value={panel.audioNotes} />}
                  </div>
                  {panel.productionNotes && (
                    <div className="rounded border-l-4 border-primary bg-background p-2">
                      <div className="font-semibold">Catatan Produksi</div>
                      <div className="whitespace-pre-wrap">{panel.productionNotes}</div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function PanelSection({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="font-semibold">{label}</div>
      <div className="whitespace-pre-wrap text-muted-foreground">{value}</div>
    </div>
  );
}
