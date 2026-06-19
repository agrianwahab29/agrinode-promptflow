import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { GenerateInputSchema, PromptPackageSchema } from '@/lib/validation/schemas';
import { errorResponse } from '@/lib/api/error';
import { createProject, getProjectById, updateProjectResult } from '@/lib/db/repositories/project.repo';
import { getActiveProviderConfig, getProviderConfig } from '@/lib/db/repositories/provider-config.repo';
import { bulkCreateCharacters, deleteCharactersByProject } from '@/lib/db/repositories/character.repo';
import { bulkCreateScenes, deleteScenesByProject } from '@/lib/db/repositories/scene.repo';
import { bulkCreateImagePrompts, deleteImagePromptsByProject } from '@/lib/db/repositories/image-prompt.repo';
import { bulkCreateSupportingCharacters, deleteSupportingCharactersByProject } from '@/lib/db/repositories/supporting-character.repo';
import { createGenerationLog } from '@/lib/db/repositories/generation-log.repo';
import { generatePromptPackage } from '@/lib/ai/llm-client';
import { buildSystemPrompt, buildUserMessage } from '@/lib/ai/prompt-builder';
import { checkConsistency } from '@/lib/ai/consistency-checker';

export const runtime = 'nodejs';
export const maxDuration = 300;
export const dynamic = 'force-dynamic';

interface SseEvent {
  event: 'progress' | 'stage' | 'done' | 'error';
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

  const cfg = inp.providerId ? await getProviderConfig(inp.providerId, userId) : await getActiveProviderConfig(userId);
  if (!cfg) return errorResponse('NOT_FOUND', 404, 'Provider config tidak ditemukan');

  let projectId: number | undefined = parsed.data.projectId;
  if (projectId === undefined) {
    const proj = await createProject({
      userId,
      title: inp.title,
      durationType: inp.durationTarget.type,
      durationTargetSeconds: inp.durationTarget.seconds,
      styleType: inp.style.type,
      aspectRatio: inp.style.ratio,
    });
    projectId = proj.id;
  } else {
    const owned = await getProjectById(projectId, userId);
    if (!owned) return errorResponse('CONFLICT', 409, 'Project bukan milik user');
  }
  const finalProjectId: number = projectId;

  const references = inp.references ?? [];

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (evt: SseEvent) => controller.enqueue(encoder.encode(sseFormat(evt)));
      const start = Date.now();
      let logId: number | null = null;
      try {
        send({ event: 'stage', data: { stage: 'starting', projectId: finalProjectId } });
        send({ event: 'progress', data: { stage: 'character_profiles', delta: '' } });

        const pkg = await generatePromptPackage({
          provider: { provider: cfg.provider, baseUrl: cfg.baseUrl, model: cfg.model, apiKeyEncrypted: cfg.apiKeyEncrypted },
          system: buildSystemPrompt(),
          messages: [{ role: 'user', content: buildUserMessage(inp, references) }],
        });

        const validated = PromptPackageSchema.parse(pkg);
        send({ event: 'progress', data: { stage: 'scenes', delta: '', count: validated.scenes.length } });
        send({ event: 'progress', data: { stage: 'image_prompts', delta: '', characters: validated.image_prompts.characters.length, backgrounds: validated.image_prompts.backgrounds.length } });
        send({ event: 'progress', data: { stage: 'supporting_characters', delta: '', count: validated.supporting_characters.length } });
        send({ event: 'progress', data: { stage: 'moral_message', delta: validated.moral_message } });

        await updateProjectResult(finalProjectId, userId, JSON.stringify(validated), 'complete');
        await deleteImagePromptsByProject(finalProjectId);
        await deleteSupportingCharactersByProject(finalProjectId);
        await deleteScenesByProject(finalProjectId);
        await deleteCharactersByProject(finalProjectId);

        if (validated.character_profiles.length > 0) {
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
          await bulkCreateScenes(validated.scenes.map((s) => ({
            projectId: finalProjectId,
            orderNo: s.order,
            description: s.description,
            voiceoverScript: s.voiceover_script,
          })));
        }
        if (validated.image_prompts.characters.length + validated.image_prompts.backgrounds.length > 0) {
          await bulkCreateImagePrompts([
            ...validated.image_prompts.characters.map((p) => ({ projectId: finalProjectId, sceneId: null, tipe: 'tokoh', target: p.target, promptText: p.prompt_text, referenceFilename: p.reference_filename })),
            ...validated.image_prompts.backgrounds.map((p) => ({ projectId: finalProjectId, sceneId: null, tipe: 'background', target: p.target, promptText: p.prompt_text, referenceFilename: p.reference_filename })),
          ]);
        }
        if (validated.supporting_characters.length > 0) {
          await bulkCreateSupportingCharacters(validated.supporting_characters.map((s) => ({ projectId: finalProjectId, sceneId: null, nama: s.nama, tipe: s.tipe, aksi: s.aksi })));
        }

        const warnings = checkConsistency(validated);
        const durationMs = Date.now() - start;
        const log = await createGenerationLog({
          projectId: finalProjectId,
          provider: cfg.provider,
          model: cfg.model,
          durationMs,
          status: warnings.length > 0 ? 'partial' : 'success',
          errorMessage: null,
        });
        logId = log.id;

        send({ event: 'done', data: { result: validated, warnings, generationLogId: logId } });
      } catch (e) {
        const durationMs = Date.now() - start;
        try {
          await createGenerationLog({
            projectId: finalProjectId,
            provider: cfg.provider,
            model: cfg.model,
            durationMs,
            status: 'fail',
            errorMessage: e instanceof Error ? e.message.slice(0, 500) : String(e),
          });
        } catch { /* ignore */ }
        send({ event: 'error', data: { code: 'PROVIDER_ERROR', message: e instanceof Error ? e.message : 'Generation gagal' } });
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
