import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { GenerateInputSchema, PromptPackageSchema } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/api/error';
import { createProject, getProjectById, updateProjectResult } from '@/lib/db/repositories/project.repo';
import { getActiveProviderConfig, getProviderConfig, listProviderConfigs } from '@/lib/db/repositories/provider-config.repo';
import { bulkCreateCharacters, deleteCharactersByProject } from '@/lib/db/repositories/character.repo';
import { bulkCreateScenes, deleteScenesByProject } from '@/lib/db/repositories/scene.repo';
import { bulkCreateImagePrompts, deleteImagePromptsByProject } from '@/lib/db/repositories/image-prompt.repo';
import { bulkCreateSupportingCharacters, deleteSupportingCharactersByProject } from '@/lib/db/repositories/supporting-character.repo';
import { createGenerationLog } from '@/lib/db/repositories/generation-log.repo';
import { attachOrphanedRefs } from '@/lib/db/repositories/asset-reference.repo';
import { createSceneAudio } from '@/lib/db/repositories/scene-audio.repository';
import { generatePromptPackage } from '@/lib/ai/llm-client';
import { buildSystemPrompt, buildUserMessage } from '@/lib/ai/prompt-builder';
import { checkConsistency } from '@/lib/ai/consistency-checker';
import { createLogBuffer, type LogBuffer } from '@/lib/ai/log-buffer';

export const runtime = 'nodejs';
export const maxDuration = 300; // Vercel Hobby plan max
export const dynamic = 'force-dynamic';

interface SseEvent {
  event: 'progress' | 'stage' | 'done' | 'error' | 'log';
  data: Record<string, unknown>;
}

function sseFormat(evt: SseEvent): string {
  return `event: ${evt.event}\ndata: ${JSON.stringify(evt.data)}\n\n`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const raw = await req.json().catch(() => null);
  const parsed = GenerateInputSchema.safeParse(raw);
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  const inp = parsed.data.input;

  if (inp.durationTarget.type === 'shorts' && inp.durationTarget.seconds > 180) {
    return errorResponse('VALIDATION_ERROR', 422, 'Shorts maksimal 180 detik', { field: 'seconds', max: 180 });
  }

  let cfg = inp.providerId ? await getProviderConfig(inp.providerId, userId) : await getActiveProviderConfig(userId);
  if (!cfg) {
    // Fallback: ambil provider pertama user
    const all = await listProviderConfigs(userId);
    cfg = all[0] ?? null;
  }
  if (!cfg) return errorResponse('NOT_FOUND', 404, 'Provider config tidak ditemukan. Tambah provider di halaman Settings.');

  console.log('[generate] Provider dipakai: id=%d name=%s model=%s baseUrl=%s', cfg.id, cfg.name, cfg.model, cfg.baseUrl);

  let projectId: number | undefined = parsed.data.projectId;
  if (projectId === undefined) {
    const proj = await createProject({
      userId,
      title: inp.title,
      durationType: inp.durationTarget.type,
      durationTargetSeconds: inp.durationTarget.seconds,
      styleType: inp.style.type,
      aspectRatio: inp.style.ratio,
      storyDescription: inp.storyDescription ?? null, // V2
    });
    projectId = proj.id;
  } else {
    const owned = await getProjectById(projectId, userId);
    if (!owned) return errorResponse('CONFLICT', 409, 'Project bukan milik user');
  }
  const finalProjectId: number = projectId;

  // V2: attach orphaned refs (uploaded before project existed)
  const orphanRefIds = (parsed.data as Record<string, unknown>).orphanRefIds;
  if (Array.isArray(orphanRefIds) && orphanRefIds.length > 0) {
    const ids = orphanRefIds.filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
    await attachOrphanedRefs(ids, finalProjectId);
  }

  const references = inp.references ?? [];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (evt: SseEvent) => controller.enqueue(encoder.encode(sseFormat(evt)));
      const start = Date.now();
      let logId: number | null = null;

      // V2: log buffer for real-time processing logs
      const logBuffer: LogBuffer = createLogBuffer();
      const emitLog = (level: 'info' | 'warn' | 'error', message: string) => {
        const entry = logBuffer.add(level, message);
        send({ event: 'log', data: entry as unknown as Record<string, unknown> });
      };

      // Helper: send progress + log + small delay for visible stage progression
      const advance = (stage: string, meta: Record<string, unknown> = {}, logMsg?: string) => {
        send({ event: 'progress', data: { stage, ...meta } });
        if (logMsg) emitLog('info', logMsg);
      };
      const tick = (ms: number) => new Promise((r) => setTimeout(r, ms));

      try {
        send({ event: 'stage', data: { stage: 'starting', projectId: finalProjectId } });
        emitLog('info', `Memulai generate untuk project #${finalProjectId}`);
        advance('character_profiles', { delta: '' }, 'Mempersiapkan profil karakter...');
        await tick(200);

        emitLog('info', `Provider: ${cfg.name} (${cfg.model})`);
        console.log('[generate] Mulai LLM call project=%d', finalProjectId);
        emitLog('info', 'Menghubungi LLM provider...');
        const pkg = await generatePromptPackage({
          provider: { provider: cfg.provider, baseUrl: cfg.baseUrl, model: cfg.model, apiKeyEncrypted: cfg.apiKeyEncrypted },
          system: buildSystemPrompt(),
          messages: [{ role: 'user', content: buildUserMessage(inp, references) }],
        });
        console.log('[generate] LLM selesai project=%d scenes=%d chars=%d', finalProjectId, pkg.scenes?.length ?? 0, pkg.character_profiles?.length ?? 0);
        emitLog('info', `LLM response diterima. ${pkg.character_profiles?.length ?? 0} karakter, ${pkg.scenes?.length ?? 0} scene.`);

        const validated = PromptPackageSchema.parse(pkg);
        emitLog('info', 'Validasi paket prompt berhasil.');

        // Visible stage progression: send + tick between each
        advance('scenes', { count: validated.scenes.length }, `Menyusun ${validated.scenes.length} scene...`);
        await tick(300);
        advance('image_prompts', { characters: validated.image_prompts.characters.length, backgrounds: validated.image_prompts.backgrounds.length }, `Membuat ${validated.image_prompts.characters.length + validated.image_prompts.backgrounds.length} prompt gambar...`);
        await tick(300);
        advance('supporting_characters', { count: validated.supporting_characters.length }, validated.supporting_characters.length > 0 ? `Membuat ${validated.supporting_characters.length} karakter pendukung...` : 'Tidak ada karakter pendukung.');
        await tick(300);
        advance('moral_message', { delta: validated.moral_message }, 'Menulis pesan moral...');
        await tick(300);

        console.log('[generate] Menyimpan ke DB project=%d', finalProjectId);
        emitLog('info', 'Menyimpan hasil ke database...');
        await updateProjectResult(finalProjectId, userId, JSON.stringify(validated), 'complete');
        await deleteImagePromptsByProject(finalProjectId);
        await deleteSupportingCharactersByProject(finalProjectId);
        await deleteScenesByProject(finalProjectId);
        await deleteCharactersByProject(finalProjectId);

        if (validated.character_profiles.length > 0) {
          emitLog('info', `Menyimpan ${validated.character_profiles.length} profil karakter...`);
          await bulkCreateCharacters(validated.character_profiles.map((c) => ({
            projectId: finalProjectId,
            nama: c.nama,
            gayarambut: c.gayarambut,
            wajahAsal: c.wajah_asal,
            pakaianAtas: c.pakaian_atas,
            pakaianBawah: c.pakaian_bawah,
            alasKaki: c.alas_kaki,
            deskripsiLatar: c.deskripsi_latar,
            aksi: c.aksi,
            peran: c.peran,
          })));
        }
        if (validated.scenes.length > 0) {
          emitLog('info', `Menyimpan ${validated.scenes.length} scene...`);
          const savedScenes = await bulkCreateScenes(validated.scenes.map((s) => ({
            projectId: finalProjectId,
            orderNo: s.order,
            description: s.description,
            voiceoverScript: s.voiceover_script,
            voiceoverSpeaker: s.voiceover_speaker ?? 'narrator',
            transitionType: s.transition_type,
            transitionDurationMs: s.transition_duration_ms,
            transitionEasing: s.transition_easing,
            transitionDirection: s.transition_direction,
            voiceType: s.voice_type,
            voiceEmotion: s.voice_emotion,
            voiceSpeed: s.voice_speed,
            voicePitch: s.voice_pitch,
            durationSeconds: s.duration_seconds ?? null,
            scenePacing: s.scene_pacing,
            sceneMood: s.scene_mood ?? null,
          })));

          // V3: Save audio_specs to scene_audio table
          let audioCount = 0;
          for (let si = 0; si < validated.scenes.length; si++) {
            const sceneData = validated.scenes[si];
            const savedScene = savedScenes[si];
            if (!sceneData?.audio_specs?.length || !savedScene) continue;
            for (const audio of sceneData.audio_specs) {
              await createSceneAudio({
                projectId: finalProjectId,
                sceneId: savedScene.id,
                audioType: audio.audio_type,
                description: audio.description,
                timing: audio.timing,
                durationSeconds: audio.duration_seconds ?? null,
                volume: audio.volume,
                fadeInMs: audio.fade_in_ms,
                fadeOutMs: audio.fade_out_ms,
                musicGenre: audio.music_genre ?? null,
                musicMood: audio.music_mood ?? null,
                musicTempoBpm: audio.music_tempo_bpm ?? null,
                musicInstruments: audio.music_instruments ?? null,
                musicVolume: audio.music_volume ?? null,
                sfxList: audio.sfx_list ?? null,
                ambientType: audio.ambient_type ?? null,
                ambientVolume: audio.ambient_volume ?? null,
              });
              audioCount++;
            }
          }
          if (audioCount > 0) emitLog('info', `Menyimpan ${audioCount} audio spec...`);

          // V3: Save scene-level image prompts with proper sceneId linkage
          const allSceneImagePrompts: Array<Parameters<typeof bulkCreateImagePrompts>[0][number]> = [];
          for (let si = 0; si < validated.scenes.length; si++) {
            const sceneData = validated.scenes[si];
            const savedScene = savedScenes[si];
            if (!sceneData?.image_prompts || !savedScene) continue;
            for (const ch of sceneData.image_prompts.characters) {
              allSceneImagePrompts.push({
                projectId: finalProjectId,
                sceneId: savedScene.id,
                tipe: 'tokoh',
                target: ch.target,
                promptText: ch.prompt_text,
                referenceFilename: ch.reference_filename,
                composition: ch.composition ?? null,
                lighting: ch.lighting ?? null,
                camera: ch.camera ?? null,
                moodAtmosphere: ch.mood_atmosphere ?? null,
                styleReferences: ch.style_references ?? null,
                colorPalette: Array.isArray(ch.color_palette) ? JSON.stringify(ch.color_palette) : (ch.color_palette ?? null),
                technical: ch.technical ?? null,
              });
            }
            for (const bg of sceneData.image_prompts.backgrounds) {
              allSceneImagePrompts.push({
                projectId: finalProjectId,
                sceneId: savedScene.id,
                tipe: 'background',
                target: bg.target,
                promptText: bg.prompt_text,
                referenceFilename: bg.reference_filename,
                composition: bg.composition ?? null,
                lighting: bg.lighting ?? null,
                camera: bg.camera ?? null,
                moodAtmosphere: bg.mood_atmosphere ?? null,
                styleReferences: bg.style_references ?? null,
                colorPalette: Array.isArray(bg.color_palette) ? JSON.stringify(bg.color_palette) : (bg.color_palette ?? null),
                technical: bg.technical ?? null,
              });
            }
          }
          if (allSceneImagePrompts.length > 0) {
            await bulkCreateImagePrompts(allSceneImagePrompts);
            emitLog('info', `Menyimpan ${allSceneImagePrompts.length} prompt gambar scene (dengan sceneId)...`);
          }
        }
        if (validated.image_prompts.characters.length + validated.image_prompts.backgrounds.length > 0) {
          const total = validated.image_prompts.characters.length + validated.image_prompts.backgrounds.length;
          emitLog('info', `Menyimpan ${total} prompt gambar master...`);
          await bulkCreateImagePrompts([
            ...validated.image_prompts.characters.map((p) => ({
              projectId: finalProjectId, sceneId: null, tipe: 'tokoh', target: p.target,
              promptText: p.prompt_text, referenceFilename: p.reference_filename,
              composition: p.composition ?? null, lighting: p.lighting ?? null, camera: p.camera ?? null,
              moodAtmosphere: p.mood_atmosphere ?? null, styleReferences: p.style_references ?? null,
              colorPalette: Array.isArray(p.color_palette) ? JSON.stringify(p.color_palette) : (p.color_palette ?? null),
              technical: p.technical ?? null,
            })),
            ...validated.image_prompts.backgrounds.map((p) => ({
              projectId: finalProjectId, sceneId: null, tipe: 'background', target: p.target,
              promptText: p.prompt_text, referenceFilename: p.reference_filename,
              composition: p.composition ?? null, lighting: p.lighting ?? null, camera: p.camera ?? null,
              moodAtmosphere: p.mood_atmosphere ?? null, styleReferences: p.style_references ?? null,
              colorPalette: Array.isArray(p.color_palette) ? JSON.stringify(p.color_palette) : (p.color_palette ?? null),
              technical: p.technical ?? null,
            })),
          ]);
        }
        if (validated.supporting_characters.length > 0) {
          emitLog('info', `Menyimpan ${validated.supporting_characters.length} karakter pendukung...`);
          await bulkCreateSupportingCharacters(validated.supporting_characters.map((s) => ({ projectId: finalProjectId, sceneId: null, nama: s.nama, tipe: s.tipe, aksi: s.aksi })));
        }
        emitLog('info', 'Semua data tersimpan.');

        const warnings = checkConsistency(validated);
        const durationMs = Date.now() - start;
        emitLog('info', `Generate selesai dalam ${durationMs}ms. ${warnings.length} warning(s).`);

        // V2: persist logs to generation_logs
        const logEntries = logBuffer.drain();
        const log = await createGenerationLog({
          projectId: finalProjectId,
          provider: cfg.provider,
          model: cfg.model,
          durationMs,
          status: warnings.length > 0 ? 'partial' : 'success',
          errorMessage: null,
          logsJson: JSON.stringify(logEntries),
        });
        logId = log.id;

        send({ event: 'done', data: { result: validated, warnings, generationLogId: logId } });
      } catch (e) {
        const durationMs = Date.now() - start;
        const errMsg = e instanceof Error ? e.message : String(e);
        emitLog('error', `Generate gagal: ${errMsg}`);

        try {
          const logEntries = logBuffer.drain();
          await createGenerationLog({
            projectId: finalProjectId,
            provider: cfg.provider,
            model: cfg.model,
            durationMs,
            status: 'fail',
            errorMessage: errMsg.slice(0, 500),
            logsJson: JSON.stringify(logEntries),
          });
        } catch { /* ignore */ }
        send({ event: 'error', data: { code: 'PROVIDER_ERROR', message: errMsg } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
