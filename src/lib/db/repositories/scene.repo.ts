import 'server-only';
import { eq, asc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { scenes, type Scene } from '@/lib/db/schema';

export async function listScenesByProject(projectId: number): Promise<Scene[]> {
  return db.select().from(scenes).where(eq(scenes.projectId, projectId)).orderBy(asc(scenes.orderNo));
}

export async function bulkCreateScenes(items: Array<typeof scenes.$inferInsert>): Promise<Scene[]> {
  if (items.length === 0) return [];
  return db.insert(scenes).values(items).returning();
}

export async function deleteScenesByProject(projectId: number): Promise<void> {
  await db.delete(scenes).where(eq(scenes.projectId, projectId));
}