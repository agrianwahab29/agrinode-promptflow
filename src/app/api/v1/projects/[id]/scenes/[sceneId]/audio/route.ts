import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { listAudioByScene, createSceneAudio } from '@/lib/db/repositories/scene-audio.repository';
import { SceneAudioSchema } from '@/lib/validation/schemas';

export const runtime = 'nodejs';

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; sceneId: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const projectId = Number((await ctx.params).id);
  const sceneId = Number((await ctx.params).sceneId);
  if (!Number.isFinite(projectId) || !Number.isFinite(sceneId))
    return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404);
  const audio = await listAudioByScene(projectId, sceneId);
  return successResponse(audio);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; sceneId: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const projectId = Number((await ctx.params).id);
  const sceneId = Number((await ctx.params).sceneId);
  if (!Number.isFinite(projectId) || !Number.isFinite(sceneId))
    return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404);
  const raw = await req.json().catch(() => null);
  const parsed = SceneAudioSchema.safeParse(raw);
  if (!parsed.success)
    return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  const audio = await createSceneAudio({
    projectId,
    sceneId,
    audioType: parsed.data.audio_type,
    description: parsed.data.description,
    timing: parsed.data.timing,
    durationSeconds: parsed.data.duration_seconds ?? null,
    volume: parsed.data.volume,
    fadeInMs: parsed.data.fade_in_ms,
    fadeOutMs: parsed.data.fade_out_ms,
    musicGenre: parsed.data.music_genre ?? null,
    musicMood: parsed.data.music_mood ?? null,
    musicTempoBpm: parsed.data.music_tempo_bpm ?? null,
    musicInstruments: parsed.data.music_instruments ?? null,
    musicVolume: parsed.data.music_volume,
    sfxList: parsed.data.sfx_list ?? null,
    ambientType: parsed.data.ambient_type ?? null,
    ambientVolume: parsed.data.ambient_volume,
  });
  return successResponse(audio, 201);
}
