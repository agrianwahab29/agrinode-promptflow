'use client';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { CreateProjectInputSchema, type PromptPackage } from '@/lib/validation/schemas';
import { ResultTabs } from './result-tabs';
import { TemplatePicker } from './template-picker';
import { TEMPLATE_TITLES, type TitleTemplate } from '@/lib/templates/titles';
import { DropzoneUploader, type AssetRef } from './dropzone-uploader';
import { LogViewer, type LogEntry } from './log-viewer';

const FormSchema = CreateProjectInputSchema;
type FormValues = z.infer<typeof FormSchema>;

const STORY_SUGGESTIONS = [
  "Bisu: Tokoh tidak berbicara, tambahkan 'mouth closed, not speaking' di setiap Image Prompt.",
  "Sinematik: Gunakan angle kamera dinamis (Dutch angle/low angle) dengan lighting dramatis.",
  "Balita: Target penonton balita (2-5 thn), palet warna cerah pastel, pacing lambat, aman.",
  "Fantasi Gelap: Dark fantasy, palet warna gelap (navy/ungu), high-contrast lighting."
];

const STAGE_LABELS: Record<string, string> = {
  starting: 'Mulai generate...',
  character_profiles: 'Mempersiapkan profil karakter',
  llm_calling: 'Memanggil LLM (proses terberat)',
  scenes: 'Menyusun scene',
  image_prompts: 'Membuat prompt gambar',
  supporting_characters: 'Membuat karakter pendukung',
  moral_message: 'Menulis pesan moral',
  saving: 'Menyimpan ke database',
};
const STAGE_ORDER = ['starting', 'character_profiles', 'llm_calling', 'scenes', 'image_prompts', 'supporting_characters', 'moral_message', 'saving'];

function ElapsedTimer() {
  const [sec, setSec] = useState(0);
  const idRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    idRef.current = setInterval(() => setSec((s) => s + 1), 1000);
    return () => { if (idRef.current) clearInterval(idRef.current); };
  }, []);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return <span className="tabular-nums">{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>;
}

export function GenerateForm({ locale: _locale }: { locale: string }) {
  const [result, setResult] = useState<PromptPackage | null>(null);
  const [warnings, setWarnings] = useState<Array<{ code: string; message: string }>>([]);
  const [streaming, setStreaming] = useState(false);
  const [currentStage, setCurrentStage] = useState<string | null>(null);
  const [stageMeta, setStageMeta] = useState<Record<string, unknown>>({});
  const [streamedContent, setStreamedContent] = useState('');
  const [storyDescription, setStoryDescription] = useState('');
  const [refsText, setRefsText] = useState('');
  const [uploadedRefs, setUploadedRefs] = useState<AssetRef[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [llmElapsedMs, setLlmElapsedMs] = useState<number | null>(null);
  const [savingStarted, setSavingStarted] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [partialSceneIds, setPartialSceneIds] = useState<number[]>([]);
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
    setCurrentStage('starting');
    setStageMeta({});
    setStreamedContent('');
    setLogs([]);
    setLlmElapsedMs(null);
    setSavingStarted(false);
    const refs = refsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, type: 'tokoh' as const }));
    // Add uploaded refs as 'tokoh' by default (user can edit JSON before generate)
    for (const ur of uploadedRefs) {
      if (!refs.find((r) => r.name === ur.filename)) {
        refs.push({ name: ur.filename, type: (ur.tipe as 'tokoh') || 'tokoh' });
      }
    }
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
            storyDescription: storyDescription.trim() || undefined,
          },
          // V2: pass orphan ref IDs so server can attach them
          ...(uploadedRefs.length > 0 ? { orphanRefIds: uploadedRefs.map((r) => r.id) } : {}),
        }),
      });
      if (!res.ok || !res.body) {
        const txt = await res.text();
        toast.error(`Generate gagal: ${txt.slice(0, 200)}`);
        setStreaming(false);
        setCurrentStage(null);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let receivedDone = false;
      let receivedError = false;
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
            if (evType === 'stage' || evType === 'progress') {
              setCurrentStage(parsed.stage ?? evType);
              setStageMeta(parsed);
              if (parsed.projectId != null && typeof parsed.projectId === 'number') setProjectId(parsed.projectId);
              if (parsed.stage === 'llm_calling') setLlmElapsedMs(0);
              if (parsed.stage === 'saving' && !savingStarted) setSavingStarted(true);
            } else if (evType === 'heartbeat') {
              setLlmElapsedMs(parsed.elapsedMs as number);
            } else if (evType === 'log') {
              // V2: append log entry
              setLogs((prev) => [...prev.slice(-499), parsed as LogEntry]);
            } else if (evType === 'stream_chunk') {
              setStreamedContent((prev) => prev + String(parsed.chunk ?? ''));
            } else if (evType === 'done') {
              receivedDone = true;
              setResult(parsed.result as PromptPackage);
              setWarnings(parsed.warnings ?? []);
              setPartialSceneIds(parsed.partialSceneIds ?? []);
              setCurrentStage(null);
              toast.success('Generate selesai');
            } else if (evType === 'error') {
              receivedError = true;
              toast.error(parsed.message ?? 'Generate gagal');
              setCurrentStage(null);
            }
          } catch {
            // skip malformed event
          }
        }
      }
      // Stream ended without done/error = server killed (Vercel timeout) or network abort
      if (!receivedDone && !receivedError) {
        toast.error('Koneksi terputus sebelum generate selesai. Cek status project — mungkin timeout server (60s).');
        setCurrentStage(null);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Network error');
      setCurrentStage(null);
    } finally {
      setStreaming(false);
    }
  }

  if (result && projectId != null) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Hasil Generate</h2>
          <Button variant="outline" onClick={() => setResult(null)}>
            Generate Baru
          </Button>
        </div>
        <ResultTabs result={result} warnings={warnings} partialSceneIds={partialSceneIds} projectId={projectId} />
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

          {/* V2: Story description field (optional, max 500 char) */}
          <div className="space-y-2">
            <Label htmlFor="storyDescription">Deskripsi Cerita (opsional, max 500)</Label>
            <Textarea
              id="storyDescription"
              rows={3}
              maxLength={500}
              placeholder="Ceritakan gambaran umum cerita untuk konteks yang lebih kaya..."
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
            />
            <div className="flex flex-wrap gap-2 mt-1">
              {STORY_SUGGESTIONS.map((sug, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="cursor-pointer font-normal hover:bg-secondary text-[10px]"
                  onClick={() => {
                    setStoryDescription((prev) => {
                      const newText = prev ? prev + '\n' + sug : sug;
                      return newText.slice(0, 500);
                    });
                  }}
                >
                  + {sug.split(':')[0]}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-right">{storyDescription.length}/500</p>
          </div>

          {/* V2: Upload references inline */}
          <div className="space-y-2">
            <Label>Upload Referensi Gambar (opsional)</Label>
            <DropzoneUploader
              projectId={0}
              onUploaded={(refs) => setUploadedRefs((prev) => [...prev, ...refs])}
            />
            {uploadedRefs.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {uploadedRefs.map((r) => (
                  <span key={r.id} className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs">
                    {r.filename}
                    <button type="button" onClick={() => setUploadedRefs((prev) => prev.filter((x) => x.id !== r.id))} className="text-destructive hover:text-destructive/80">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="refs">Referensi Tambahan (nama file, satu per baris)</Label>
            <Textarea
              id="refs"
              rows={2}
              placeholder="hero.png&#10;hutan-bg.png"
              value={refsText}
              onChange={(e) => setRefsText(e.target.value)}
            />
          </div>

          {streaming && currentStage && (
            <div className="rounded-md border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{STAGE_LABELS[currentStage] ?? currentStage}</span>
                <span className="text-muted-foreground text-xs"><ElapsedTimer /></span>
              </div>
              {currentStage === 'llm_calling' && llmElapsedMs !== null && (
                <div className="flex items-center gap-2 text-xs text-primary">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-primary" />
                  Menunggu respons LLM: {(llmElapsedMs / 1000).toFixed(0)}s
                  {llmElapsedMs > 30000 && <span className="text-amber-600"> (biasanya 30-120s, mohon tunggu)</span>}
                </div>
              )}
              <div className="space-y-1.5">
                {STAGE_ORDER.map((stage, i) => {
                  const done = STAGE_ORDER.indexOf(currentStage) > i;
                  const active = currentStage === stage;
                  return (
                    <div key={stage} className="flex items-center gap-2 text-xs">
                      <span className={`inline-block w-4 text-center ${done ? 'text-green-600' : active ? 'text-primary' : 'text-muted-foreground'}`}>
                        {done ? '✓' : active ? '●' : '○'}
                      </span>
                      <span className={done ? 'text-green-600 line-through' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                        {STAGE_LABELS[stage] ?? stage}
                      </span>
                      {active && <span className="ml-auto animate-pulse text-primary text-[10px]">●●●</span>}
                    </div>
                  );
                })}
              </div>
              {stageMeta.count !== undefined && (
                <p className="text-xs text-muted-foreground">Ditemukan {String(stageMeta.count)} item...</p>
              )}
              {stageMeta.provider != null && (
                <p className="text-xs text-muted-foreground">
                  Provider: {String(stageMeta.provider)}{stageMeta.model != null ? ` / ${String(stageMeta.model)}` : ''}
                </p>
              )}
              {/* LLM Streaming Viewer */}
              {currentStage === 'llm_calling' && streamedContent && (
                <div className="mt-2 p-2 bg-black text-green-400 text-[10px] font-mono h-48 overflow-y-auto rounded whitespace-pre-wrap flex flex-col-reverse" style={{ overflowAnchor: 'auto' }}>
                  {streamedContent}
                </div>
              )}
              {/* V2: Real-time processing logs — auto-expanded during streaming */}
              <LogViewer logs={logs} defaultOpen={true} streaming={streaming} />
            </div>
          )}

          <Button type="submit" disabled={streaming} className="w-full">
            {streaming ? 'Generating...' : 'Generate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
