import 'server-only';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { sceneAudio, type SceneAudio } from '@/lib/db/schema';

export async function listAudioByScene(projectId: number, sceneId: number): Promise<SceneAudio[]> {
  return db.select().from(sceneAudio).where(
    and(eq(sceneAudio.projectId, projectId), eq(sceneAudio.sceneId, sceneId))
  );
}

export async function getAudioById(audioId: number, projectId: number): Promise<SceneAudio | undefined> {
  const [row] = await db.select().from(sceneAudio).where(
    and(eq(sceneAudio.id, audioId), eq(sceneAudio.projectId, projectId))
  );
  return row;
}

export async function createSceneAudio(data: typeof sceneAudio.$inferInsert): Promise<SceneAudio> {
  const [row] = await db.insert(sceneAudio).values(data).returning();
  if (!row) throw new Error('Failed to create scene audio');
  return row;
}

export async function updateSceneAudio(
  audioId: number,
  projectId: number,
  data: Partial<typeof sceneAudio.$inferInsert>
): Promise<SceneAudio | undefined> {
  const [row] = await db.update(sceneAudio).set(data).where(
    and(eq(sceneAudio.id, audioId), eq(sceneAudio.projectId, projectId))
  ).returning();
  return row;
}

export async function deleteSceneAudio(audioId: number, projectId: number): Promise<boolean> {
  await db.delete(sceneAudio).where(
    and(eq(sceneAudio.id, audioId), eq(sceneAudio.projectId, projectId))
  );
  return true;
}

export async function deleteAudioByScene(projectId: number, sceneId: number): Promise<void> {
  await db.delete(sceneAudio).where(
    and(eq(sceneAudio.projectId, projectId), eq(sceneAudio.sceneId, sceneId))
  );
}
