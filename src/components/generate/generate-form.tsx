'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { CreateProjectInputSchema, type PromptPackage } from '@/lib/validation/schemas';
import { ResultTabs } from './result-tabs';
import { TemplatePicker } from './template-picker';
import { TEMPLATE_TITLES, type TitleTemplate } from '@/lib/templates/titles';

const FormSchema = CreateProjectInputSchema;
type FormValues = z.infer<typeof FormSchema>;

export function GenerateForm({ locale: _locale }: { locale: string }) {
  const [result, setResult] = useState<PromptPackage | null>(null);
  const [warnings, setWarnings] = useState<Array<{ code: string; message: string }>>([]);
  const [streaming, setStreaming] = useState(false);
  const [refsText, setRefsText] = useState('');
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      durationType: 'shorts',
      durationTargetSeconds: 60,
      styleType: '3D',
      aspectRatio: '16:9',
    },
  });

  function applyTemplate(t: TitleTemplate) {
    form.reset({
      title: t.title,
      durationType: t.durationType,
      durationTargetSeconds: t.durationType === 'shorts' ? 60 : 600,
      styleType: t.styleType,
      aspectRatio: '16:9',
    });
  }

  async function onSubmit(values: FormValues) {
    setStreaming(true);
    setResult(null);
    setWarnings([]);
    const refs = refsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, type: 'tokoh' as const }));
    try {
      const res = await fetch('/api/v1/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: {
            title: values.title,
            durationTarget: {
              type: values.durationType,
              seconds: values.durationTargetSeconds,
            },
            style: {
              type: values.styleType,
              ratio: values.aspectRatio,
            },
            references: refs,
          },
        }),
      });
      if (!res.ok || !res.body) {
        const txt = await res.text();
        toast.error(`Generate gagal: ${txt.slice(0, 200)}`);
        setStreaming(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const events = buf.split('\n\n');
        buf = events.pop() ?? '';
        for (const evt of events) {
          const lines = evt.split('\n');
          let evType = '';
          let evData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) evType = line.slice(7).trim();
            else if (line.startsWith('data: ')) evData += line.slice(6);
          }
          if (!evType || !evData) continue;
          try {
            const parsed = JSON.parse(evData);
            if (evType === 'done') {
              setResult(parsed.result as PromptPackage);
              setWarnings(parsed.warnings ?? []);
              toast.success('Generate selesai');
            } else if (evType === 'error') {
              toast.error(parsed.message ?? 'Generate gagal');
            }
          } catch {
            // skip malformed event
          }
        }
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Network error');
    } finally {
      setStreaming(false);
    }
  }

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Hasil Generate</h2>
          <Button variant="outline" onClick={() => setResult(null)}>
            Generate Baru
          </Button>
        </div>
        <ResultTabs result={result} warnings={warnings} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Prompt Animasi</CardTitle>
        <CardDescription>
          Masukkan judul + durasi + style, sistem akan menghasilkan paket prompt terstruktur.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TemplatePicker templates={TEMPLATE_TITLES} onPick={applyTemplate} />
        <div className="my-4 border-t" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Animasi</Label>
            <Input id="title" {...form.register('title')} placeholder="Petualangan di Hutan" />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="durationType">Durasi</Label>
              <Select id="durationType" {...form.register('durationType')}>
                <option value="shorts">Shorts (30-60s)</option>
                <option value="tutorial">Tutorial (7-15 min)</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="durationTargetSeconds">Target Detik</Label>
              <Input
                id="durationTargetSeconds"
                type="number"
                {...form.register('durationTargetSeconds', { valueAsNumber: true })}
              />
              {form.formState.errors.durationTargetSeconds && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.durationTargetSeconds.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="styleType">Style</Label>
              <Select id="styleType" {...form.register('styleType')}>
                <option value="3D">3D</option>
                <option value="2D">2D</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Rasio</Label>
              <Select id="aspectRatio" {...form.register('aspectRatio')}>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
                <option value="1:1">1:1</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refs">Referensi (nama file, satu per baris)</Label>
            <Textarea
              id="refs"
              rows={3}
              placeholder="hero.png&#10;hutan-bg.png"
              value={refsText}
              onChange={(e) => setRefsText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Upload via project detail page. Lalu paste nama file di sini (satu per baris).</p>
          </div>

          {streaming && (
            <Alert variant="info">
              <AlertDescription>Sedang generate... mohon tunggu.</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={streaming} className="w-full">
            {streaming ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
