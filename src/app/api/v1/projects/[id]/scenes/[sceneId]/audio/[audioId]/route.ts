import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, noContentResponse, successResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { getAudioById, updateSceneAudio, deleteSceneAudio } from '@/lib/db/repositories/scene-audio.repository';
import { SceneAudioSchema } from '@/lib/validation/schemas';
import { sceneAudio } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; sceneId: string; audioId: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const projectId = Number((await ctx.params).id);
  const audioId = Number((await ctx.params).audioId);
  if (!Number.isFinite(projectId) || !Number.isFinite(audioId))
    return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404);
  const existing = await getAudioById(audioId, projectId);
  if (!existing) return errorResponse('NOT_FOUND', 404);
  const raw = await req.json().catch(() => null);
  const parsed = SceneAudioSchema.partial().safeParse(raw);
  if (!parsed.success)
    return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  const d = parsed.data;
  const updatePayload: Partial<typeof sceneAudio.$inferInsert> = {};
  if (d.audio_type !== undefined) updatePayload.audioType = d.audio_type;
  if (d.description !== undefined) updatePayload.description = d.description;
  if (d.timing !== undefined) updatePayload.timing = d.timing;
  if (d.duration_seconds !== undefined) updatePayload.durationSeconds = d.duration_seconds;
  if (d.volume !== undefined) updatePayload.volume = d.volume;
  if (d.fade_in_ms !== undefined) updatePayload.fadeInMs = d.fade_in_ms;
  if (d.fade_out_ms !== undefined) updatePayload.fadeOutMs = d.fade_out_ms;
  if (d.music_genre !== undefined) updatePayload.musicGenre = d.music_genre;
  if (d.music_mood !== undefined) updatePayload.musicMood = d.music_mood;
  if (d.music_tempo_bpm !== undefined) updatePayload.musicTempoBpm = d.music_tempo_bpm;
  if (d.music_instruments !== undefined) updatePayload.musicInstruments = d.music_instruments;
  if (d.music_volume !== undefined) updatePayload.musicVolume = d.music_volume;
  if (d.sfx_list !== undefined) updatePayload.sfxList = d.sfx_list;
  if (d.ambient_type !== undefined) updatePayload.ambientType = d.ambient_type;
  if (d.ambient_volume !== undefined) updatePayload.ambientVolume = d.ambient_volume;
  const updated = await updateSceneAudio(audioId, projectId, updatePayload);
  return successResponse(updated);
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; sceneId: string; audioId: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const projectId = Number((await ctx.params).id);
  const audioId = Number((await ctx.params).audioId);
  if (!Number.isFinite(projectId) || !Number.isFinite(audioId))
    return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404);
  const existing = await getAudioById(audioId, projectId);
  if (!existing) return errorResponse('NOT_FOUND', 404);
  await deleteSceneAudio(audioId, projectId);
  return noContentResponse();
}
