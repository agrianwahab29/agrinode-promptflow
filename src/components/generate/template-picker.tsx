'use client';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TitleTemplate } from '@/lib/templates/titles';

export function TemplatePicker({ templates, onPick }: { templates: TitleTemplate[]; onPick: (t: TitleTemplate) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Atau pilih template judul populer:</p>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        {templates.map((t) => (
          <Card key={t.id} className="transition-colors hover:bg-accent">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{t.title}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">{t.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between p-3 pt-0">
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-[10px]">{t.durationType}</Badge>
                <Badge variant="outline" className="text-[10px]">{t.styleType}</Badge>
              </div>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => onPick(t)}
                aria-label={`Pakai template ${t.title}`}
              >
                <Sparkles className="mr-1 h-3 w-3" /> Pakai
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
