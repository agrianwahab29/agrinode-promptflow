import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { supportingCharacters, type SupportingCharacter } from '@/lib/db/schema';

export async function bulkCreateSupportingCharacters(items: Array<typeof supportingCharacters.$inferInsert>): Promise<SupportingCharacter[]> {
  if (items.length === 0) return [];
  return db.insert(supportingCharacters).values(items).returning();
}

export async function deleteSupportingCharactersByProject(projectId: number): Promise<void> {
  await db.delete(supportingCharacters).where(eq(supportingCharacters.projectId, projectId));
}