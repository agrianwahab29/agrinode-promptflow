'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/common/copy-button';
import { SceneTransitionCard } from './scene-transition-card';
import { VoiceTypeSelector } from './voice-type-selector';
import { ImagePromptDisplay } from './image-prompt-display';
import { AudioPanel } from './audio-panel';
import { Mic, Clock, User } from 'lucide-react';
import type { PromptPackage } from '@/lib/validation/schemas';

type Warning = { code: string; message: string; target?: string; scene?: number };

export function ResultTabs({
  result,
  warnings,
}: {
  result: PromptPackage;
  warnings: Warning[];
}) {
  const t = useTranslations('generate');
  const [tab, setTab] = useState('scenes');

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
        <TabsTrigger value="scenes">{t('tabScenes')} ({result.scenes.length})</TabsTrigger>
        <TabsTrigger value="characters">{t('tabCharacters')} ({result.character_profiles.length})</TabsTrigger>
        <TabsTrigger value="imagePrompts">{t('tabImagePrompts')}</TabsTrigger>
        <TabsTrigger value="voiceover">{t('tabVoiceover')}</TabsTrigger>
        <TabsTrigger value="moral">{t('tabMoral')}</TabsTrigger>
      </TabsList>

      {warnings.length > 0 && (
        <div className="mt-4 rounded-md border border-[var(--color-warning)]/40 bg-[var(--color-warning)]/10 p-3 text-sm">
          <strong className="font-medium">{t('warningsTitle')}</strong>
          <ul className="ml-4 mt-1 list-disc">
            {warnings.map((w, i) => (
              <li key={i}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      <TabsContent value="scenes" className="space-y-3">
        {result.scenes.map((s, idx) => {
          const isLast = idx === result.scenes.length - 1;
          const nextScene = !isLast ? result.scenes[idx + 1] : null;
          const audioSpecs = s.audio_specs ?? [];

          return (
            <SceneTransitionCard
              key={s.order}
              scene={{
                order: s.order,
                description: s.description,
                voiceoverScript: s.voiceover_script,
                transitionType: s.transition_type,
                transitionDurationMs: s.transition_duration_ms,
                isLast,
              }}
            >
              {/* Voiceover with speaker identification */}
              <div className="rounded-md border bg-card p-3 text-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{t('voiceover')}:</span>
                  <Badge variant="outline" className="text-xs">
                    <User className="mr-1 h-3 w-3" />
                    {s.voiceover_speaker ?? 'narrator'}
                  </Badge>
                  {s.duration_seconds != null && (
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="mr-1 h-3 w-3" />
                      {s.duration_seconds}s
                    </Badge>
                  )}
                  {s.scene_mood && (
                    <Badge variant="outline" className="text-xs">
                      {s.scene_mood}
                    </Badge>
                  )}
                </div>
                <p>{s.voiceover_script}</p>
              </div>

              {/* Voice spec */}
              <div className="mt-3">
                <div className="mb-1 text-xs font-semibold text-muted-foreground">{t('voiceSpec')}</div>
                <VoiceTypeSelector
                  voice={{
                    voiceType: s.voice_type,
                    voiceEmotion: s.voice_emotion,
                    voiceSpeed: s.voice_speed,
                    voicePitch: s.voice_pitch,
                  }}
                />
              </div>

              {/* Audio specs (from LLM) */}
              {audioSpecs.length > 0 && (
                <div className="mt-3">
                  <div className="mb-1 text-xs font-semibold text-muted-foreground">{t('audioSpec')}</div>
                  <AudioPanel audio={audioSpecs} />
                </div>
              )}

              {/* Image prompts (8 layers) */}
              {s.image_prompts.characters.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">{t('characters')}</div>
                  {s.image_prompts.characters.map((p, i) => (
                    <ImagePromptDisplay
                      key={i}
                      prompt={{
                        target: p.target,
                        promptText: p.prompt_text,
                        composition: p.composition,
                        lighting: p.lighting,
                        camera: p.camera,
                        moodAtmosphere: p.mood_atmosphere,
                        styleReferences: p.style_references,
                        referenceFilename: p.reference_filename,
                      }}
                    />
                  ))}
                </div>
              )}
              {s.image_prompts.backgrounds.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">{t('backgrounds')}</div>
                  {s.image_prompts.backgrounds.map((p, i) => (
                    <ImagePromptDisplay
                      key={i}
                      prompt={{
                        target: p.target,
                        promptText: p.prompt_text,
                        composition: p.composition,
                        lighting: p.lighting,
                        camera: p.camera,
                        moodAtmosphere: p.mood_atmosphere,
                        styleReferences: p.style_references,
                        referenceFilename: p.reference_filename,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Transition flow hint to next scene */}
              {nextScene && (
                <div className="mt-3 rounded-md border border-dashed bg-muted/30 p-2 text-xs text-muted-foreground">
                  <span className="font-semibold">→ Scene {nextScene.order}:</span> {t('transitionTo', {
                    type: nextScene.transition_type,
                    duration: nextScene.transition_duration_ms,
                    easing: nextScene.transition_easing,
                  })}
                </div>
              )}
            </SceneTransitionCard>
          );
        })}
      </TabsContent>

      <TabsContent value="characters" className="space-y-3">
        {result.character_profiles.map((c, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{c.nama}</CardTitle>
                <div className="flex items-center gap-2">
                  {c.voice_type && (
                    <Badge variant="outline" className="text-xs">
                      <Mic className="mr-1 h-3 w-3" />
                      {t(`voice.${c.voice_type}`)}
                    </Badge>
                  )}
                  <Badge variant={c.peran === 'utama' ? 'default' : 'secondary'}>{c.peran}</Badge>
                </div>
              </div>
              {c.age_range && (
                <CardDescription>{t('ageRange')}: {c.age_range}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
              <div><span className="font-semibold">{t('fieldHair')}:</span> {c.gayarambut}</div>
              <div><span className="font-semibold">{t('fieldFaceOrigin')}:</span> {c.wajah_asal}</div>
              <div><span className="font-semibold">{t('fieldTopWear')}:</span> {c.pakaian_atas}</div>
              <div><span className="font-semibold">{t('fieldBottomWear')}:</span> {c.pakaian_bawah}</div>
              <div><span className="font-semibold">{t('fieldFootwear')}:</span> {c.alas_kaki}</div>
              <div><span className="font-semibold">{t('fieldBackground')}:</span> {c.deskripsi_latar}</div>
              <div className="md:col-span-2"><span className="font-semibold">{t('fieldAction')}:</span> {c.aksi}</div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="imagePrompts" className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('masterCharacters')}</CardTitle>
            <CardDescription>{t('masterDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.image_prompts.characters.map((p, i) => (
              <ImagePromptDisplay
                key={i}
                prompt={{
                  target: p.target,
                  promptText: p.prompt_text,
                  composition: p.composition,
                  lighting: p.lighting,
                  camera: p.camera,
                  moodAtmosphere: p.mood_atmosphere,
                  styleReferences: p.style_references,
                  referenceFilename: p.reference_filename,
                }}
              />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('masterBackgrounds')}</CardTitle>
            <CardDescription>{t('masterDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.image_prompts.backgrounds.map((p, i) => (
              <ImagePromptDisplay
                key={i}
                prompt={{
                  target: p.target,
                  promptText: p.prompt_text,
                  composition: p.composition,
                  lighting: p.lighting,
                  camera: p.camera,
                  moodAtmosphere: p.mood_atmosphere,
                  styleReferences: p.style_references,
                  referenceFilename: p.reference_filename,
                }}
              />
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="voiceover" className="space-y-2">
        {result.scenes.map((s) => (
          <Card key={s.order}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('scene')} {s.order}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    <User className="mr-1 h-3 w-3" />
                    {s.voiceover_speaker ?? 'narrator'}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">{s.voice_type}</Badge>
                  <Badge variant="outline" className="text-xs">{s.voice_emotion}</Badge>
                </div>
              </div>
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
            <CardTitle className="text-base">{t('moralMessage')}</CardTitle>
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
