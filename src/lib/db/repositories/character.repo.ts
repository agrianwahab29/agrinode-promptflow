import 'server-only';
import { and, eq, count } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { characters, type Character } from '@/lib/db/schema';

export const MAX_CHARACTERS_PER_PROJECT = 10;

export async function listCharacters(projectId: number): Promise<Character[]> {
  return db.select().from(characters).where(eq(characters.projectId, projectId));
}

export async function countCharacters(projectId: number): Promise<number> {
  const [row] = await db.select({ count: count() }).from(characters).where(eq(characters.projectId, projectId));
  return row?.count ?? 0;
}

export async function getCharacterById(id: number): Promise<Character | null> {
  const [row] = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  return row ?? null;
}

export async function createCharacter(input: typeof characters.$inferInsert): Promise<Character> {
  const total = await countCharacters(input.projectId);
  if (total >= MAX_CHARACTERS_PER_PROJECT) {
    throw new Error(`MAX_CHARACTERS_EXCEEDED:${MAX_CHARACTERS_PER_PROJECT}`);
  }
  const [row] = await db.insert(characters).values(input).returning();
  if (!row) throw new Error('Failed to create character');
  return row;
}

export async function bulkCreateCharacters(items: Array<typeof characters.$inferInsert>): Promise<Character[]> {
  if (items.length === 0) return [];
  const projectId = items[0]!.projectId;
  const total = await countCharacters(projectId);
  if (total + items.length > MAX_CHARACTERS_PER_PROJECT) {
    throw new Error(`MAX_CHARACTERS_EXCEEDED:${MAX_CHARACTERS_PER_PROJECT}`);
  }
  return db.insert(characters).values(items).returning();
}

export async function findCharacterByName(projectId: number, nama: string): Promise<Character | null> {
  const [row] = await db.select().from(characters)
    .where(and(eq(characters.projectId, projectId), eq(characters.nama, nama)))
    .limit(1);
  return row ?? null;
}

export async function deleteCharactersByProject(projectId: number): Promise<void> {
  await db.delete(characters).where(eq(characters.projectId, projectId));
}