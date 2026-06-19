import 'server-only';
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generationLogs, type GenerationLog } from '@/lib/db/schema';

export async function createGenerationLog(input: typeof generationLogs.$inferInsert): Promise<GenerationLog> {
  const [row] = await db.insert(generationLogs).values(input).returning();
  if (!row) throw new Error('Failed to create generation log');
  return row;
}

export async function listGenerationLogs({ projectId, page = 1, limit = 20 }: {
  projectId: number; page?: number; limit?: number;
}): Promise<{ data: GenerationLog[]; total: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  const data = await db.select().from(generationLogs)
    .where(eq(generationLogs.projectId, projectId))
    .orderBy(desc(generationLogs.createdAt))
    .limit(limit).offset(offset);
  const totalRow = await db.select({ count: sql<number>`count(*)` }).from(generationLogs)
    .where(eq(generationLogs.projectId, projectId));
  const total = totalRow[0]?.count ?? 0;
  return { data, total, totalPages: Math.ceil(total / limit) };
}

export async function getLastGenerationLog(projectId: number): Promise<GenerationLog | null> {
  const [row] = await db.select().from(generationLogs)
    .where(eq(generationLogs.projectId, projectId))
    .orderBy(desc(generationLogs.createdAt))
    .limit(1);
  return row ?? null;
}