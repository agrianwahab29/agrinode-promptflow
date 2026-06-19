import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { imagePrompts, type ImagePrompt } from '@/lib/db/schema';

export async function listImagePromptsByProject(projectId: number): Promise<ImagePrompt[]> {
  return db.select().from(imagePrompts).where(eq(imagePrompts.projectId, projectId));
}

export async function listMasterImagePrompts(projectId: number): Promise<ImagePrompt[]> {
  return db.select().from(imagePrompts).where(and(eq(imagePrompts.projectId, projectId), isNull(imagePrompts.sceneId)));
}

export async function listImagePromptsByScene(sceneId: number): Promise<ImagePrompt[]> {
  return db.select().from(imagePrompts).where(eq(imagePrompts.sceneId, sceneId));
}

export async function bulkCreateImagePrompts(items: Array<typeof imagePrompts.$inferInsert>): Promise<ImagePrompt[]> {
  if (items.length === 0) return [];
  return db.insert(imagePrompts).values(items).returning();
}

export async function deleteImagePromptsByProject(projectId: number): Promise<void> {
  await db.delete(imagePrompts).where(eq(imagePrompts.projectId, projectId));
}