'use client';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Blend, Moon, Sun, ArrowRight, Link } from 'lucide-react';

const TRANSITION_ICONS = {
  cut: Zap,
  dissolve: Blend,
  fade_to_black: Moon,
  fade_to_white: Sun,
  wipe: ArrowRight,
  match_cut: Link,
} as const;

interface SceneTransitionData {
  order: number;
  description: string;
  voiceoverScript: string;
  transitionType: string;
  transitionDurationMs: number;
  isLast?: boolean;
}

export function SceneTransitionCard({
  scene,
  children,
}: {
  scene: SceneTransitionData;
  children?: React.ReactNode;
}) {
  const t = useTranslations('transition');
  const Icon = TRANSITION_ICONS[scene.transitionType as keyof typeof TRANSITION_ICONS] ?? Zap;
  const dur = scene.transitionDurationMs;
  const durLabel = dur === 0 ? t('instant') : `${dur}ms`;

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {t('scene')} {scene.order}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <Icon className="h-3 w-3" />
                {t(`types.${scene.transitionType}`)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {durLabel}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{scene.description}</p>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {!scene.isLast && (
        <div className="flex justify-center py-2">
          <div
            className={`h-6 border-l-2 ${dur === 0 ? 'border-dashed' : 'border-solid'} border-muted-foreground/40`}
          />
        </div>
      )}
    </div>
  );
}
