'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/copy-button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
          if (data.stage) setProgress(`Stage: ${data.stage} (${data.segmentIndex ?? '-'}/${data.total ?? '-'})`);
          if (data.segments) {
            setProgress(`Done: ${data.segments} segments generated`);
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
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Segment {segment.segmentIndex}</CardTitle>
            <Badge variant="secondary">{segment.segmentTimeStart}s - {segment.segmentTimeEnd}s</Badge>
            <Badge variant="outline">{segment.panelCount} panels</Badge>
          </div>
          <div className="flex items-center gap-2">
            <CopyButton text={segment.compiledMarkdownPrompt} label="Copy Markdown" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <Accordion type="multiple" className="w-full">
          {segment.panels.map((panel) => (
            <AccordionItem key={panel.index} value={`panel-${panel.index}`}>
              <AccordionTrigger className="text-sm">
                Panel {panel.index} | {panel.time} | {panel.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm">
                <div className="space-y-1 rounded-md bg-muted p-3">
                  <div><span className="font-semibold">Scene:</span> {panel.sceneCode}</div>
                  <div><span className="font-semibold">Image Prompt:</span> {panel.imagePrompt}</div>
                  <div><span className="font-semibold">Action:</span> {panel.actionVisual}</div>
                  <div><span className="font-semibold">Camera:</span> {panel.cameraMovement}</div>
                  <div><span className="font-semibold">VO:</span> {panel.dialogueVo || '-'}</div>
                  <div><span className="font-semibold">Transition:</span> {panel.transition}</div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
