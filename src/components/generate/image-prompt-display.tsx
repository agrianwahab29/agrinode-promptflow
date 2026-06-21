'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/common/copy-button';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ImagePromptData {
  target: string;
  promptText: string;
  composition?: string | null;
  lighting?: string | null;
  camera?: string | null;
  moodAtmosphere?: string | null;
  styleReferences?: string | null;
  colorPalette?: string | null;
  technical?: string | null;
  referenceFilename?: string | null;
}

export function ImagePromptDisplay({ prompt }: { prompt: ImagePromptData }) {
  const t = useTranslations('imagePrompt');
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          <span className="text-sm font-semibold">{prompt.target}</span>
          {prompt.referenceFilename && (
            <Badge variant="info" className="text-[10px]">
              ref: {prompt.referenceFilename}
            </Badge>
          )}
        </div>
        <CopyButton text={prompt.promptText} />
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 pl-8">
          {prompt.composition && (
            <LayerRow label={t('layers.composition')} value={prompt.composition} />
          )}
          {prompt.lighting && (
            <LayerRow label={t('layers.lighting')} value={prompt.lighting} />
          )}
          {prompt.camera && <LayerRow label={t('layers.camera')} value={prompt.camera} />}
          {prompt.moodAtmosphere && (
            <LayerRow label={t('layers.mood')} value={prompt.moodAtmosphere} />
          )}
          {prompt.styleReferences && (
            <LayerRow label={t('layers.style')} value={prompt.styleReferences} />
          )}
          {prompt.colorPalette && (
            <LayerRow label={t('layers.colorPalette')} value={prompt.colorPalette} />
          )}
          <div className="pt-1">
            <span className="text-xs font-semibold text-muted-foreground">
              {t('layers.technical')}:
            </span>
            <p className="mt-0.5 font-mono text-xs">{prompt.technical ?? prompt.promptText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function LayerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-xs">
      <span className="font-semibold text-muted-foreground">{label}:</span>{' '}
      <span className="font-mono">{value}</span>
    </div>
  );
}
