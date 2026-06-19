'use client';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/copy-button';
import type { PromptPackage } from '@/lib/validation/schemas';

type Warning = { code: string; message: string; target?: string; scene?: number };

export function ResultTabs({
  result,
  warnings,
}: {
  result: PromptPackage;
  warnings: Warning[];
}) {
  const [tab, setTab] = useState('scenes');

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="scenes">Adegan ({result.scenes.length})</TabsTrigger>
        <TabsTrigger value="characters">Karakter ({result.character_profiles.length})</TabsTrigger>
        <TabsTrigger value="imagePrompts">Image Prompts</TabsTrigger>
        <TabsTrigger value="voiceover">Voiceover</TabsTrigger>
        <TabsTrigger value="moral">Moral</TabsTrigger>
      </TabsList>

      {warnings.length > 0 && (
        <div className="mt-4 rounded-md border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 p-3 text-sm">
          <strong className="font-medium">Peringatan konsistensi:</strong>
          <ul className="ml-4 mt-1 list-disc">
            {warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      <TabsContent value="scenes" className="space-y-3">
        {result.scenes.map((s) => (
          <Card key={s.order}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Scene {s.order}</CardTitle>
                <CopyButton text={s.description} />
              </div>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <span className="font-semibold">Voiceover:</span> {s.voiceover_script}
              </div>
              {s.image_prompts.characters.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Karakter</div>
                  {s.image_prompts.characters.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 rounded-md bg-muted p-2 font-mono text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-semibold">{p.target}</span>
                        {p.reference_filename && (
                          <Badge variant="info" className="ml-2 text-[10px]">
                            ref: {p.reference_filename}
                          </Badge>
                        )}
                        <div className="mt-1">{p.prompt_text}</div>
                      </div>
                      <CopyButton text={p.prompt_text} label={`Copy prompt for ${p.target}`} />
                    </div>
                  ))}
                </div>
              )}
              {s.image_prompts.backgrounds.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Background</div>
                  {s.image_prompts.backgrounds.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start justify-between gap-2 rounded-md bg-muted p-2 font-mono text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-semibold">{p.target}</span>
                        {p.reference_filename && (
                          <Badge variant="info" className="ml-2 text-[10px]">
                            ref: {p.reference_filename}
                          </Badge>
                        )}
                        <div className="mt-1">{p.prompt_text}</div>
                      </div>
                      <CopyButton text={p.prompt_text} label={`Copy background prompt ${p.target}`} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="characters" className="space-y-3">
        {result.character_profiles.map((c, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.nama}</CardTitle>
                <Badge variant={c.peran === 'utama' ? 'default' : 'secondary'}>{c.peran}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <div>
                <span className="font-semibold">Gaya rambut:</span> {c.gayarambut}
              </div>
              <div>
                <span className="font-semibold">Wajah/asal:</span> {c.wajah_asal}
              </div>
              <div>
                <span className="font-semibold">Pakaian atas:</span> {c.pakaian_atas}
              </div>
              <div>
                <span className="font-semibold">Pakaian bawah:</span> {c.pakaian_bawah}
              </div>
              <div>
                <span className="font-semibold">Alas kaki:</span> {c.alas_kaki}
              </div>
              <div>
                <span className="font-semibold">Latar:</span> {c.deskripsi_latar}
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Aksi:</span> {c.aksi}
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="imagePrompts" className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Karakter (master list)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.image_prompts.characters.map((p, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 rounded-md border p-2 font-mono text-xs"
              >
                <div className="flex-1">
                  <span className="font-semibold">{p.target}</span>
                  {p.reference_filename && (
                    <Badge variant="info" className="ml-2 text-[10px]">
                      ref: {p.reference_filename}
                    </Badge>
                  )}
                  <div className="mt-1">{p.prompt_text}</div>
                </div>
                <CopyButton text={p.prompt_text} />
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Background (master list)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.image_prompts.backgrounds.map((p, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-2 rounded-md border p-2 font-mono text-xs"
              >
                <div className="flex-1">
                  <span className="font-semibold">{p.target}</span>
                  {p.reference_filename && (
                    <Badge variant="info" className="ml-2 text-[10px]">
                      ref: {p.reference_filename}
                    </Badge>
                  )}
                  <div className="mt-1">{p.prompt_text}</div>
                </div>
                <CopyButton text={p.prompt_text} />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="voiceover" className="space-y-2">
        {result.scenes.map((s) => (
          <Card key={s.order}>
            <CardHeader>
              <CardTitle className="text-sm">Scene {s.order}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between gap-2 rounded-md bg-muted p-3 text-sm">
                <p className="flex-1">{s.voiceover_script}</p>
                <CopyButton text={s.voiceover_script} />
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="moral">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pesan Moral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between gap-2 rounded-md bg-accent p-4 text-sm">
              <p className="flex-1 italic">{result.moral_message}</p>
              <CopyButton text={result.moral_message} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
