import 'server-only';
import { cache } from 'react';
import { and, eq, desc, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { projects, type Project } from '@/lib/db/schema';

export async function listActiveProjects({ userId, page = 1, limit = 20 }: {
  userId: number; page?: number; limit?: number;
}): Promise<{ data: Project[]; total: number; totalPages: number }> {
  const offset = (page - 1) * limit;
  const data = await db.select().from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.createdAt))
    .limit(limit).offset(offset);
  const totalRow = await db.select({ count: sql<number>`count(*)` }).from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));
  const total = totalRow[0]?.count ?? 0;
  return { data, total, totalPages: Math.ceil(total / limit) };
}

export const getProjectById = cache(async (id: number, userId: number): Promise<Project | null> => {
  const [row] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);
  return row ?? null;
});

export async function getProjectRawById(id: number): Promise<Project | null> {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}

export async function createProject(input: {
  userId: number; title: string; durationType: string; durationTargetSeconds: number;
  styleType: string; aspectRatio: string; storyDescription?: string | null;
}): Promise<Project> {
  const [row] = await db.insert(projects).values({ ...input, status: 'draft' }).returning();
  if (!row) throw new Error('Failed to create project');
  return row;
}

export async function updateProjectResult(id: number, userId: number, resultJson: string, status: Project['status']): Promise<Project | null> {
  const [row] = await db.update(projects)
    .set({ resultJson, status, updatedAt: Math.floor(Date.now() / 1000) })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();
  return row ?? null;
}

export async function updateProjectMeta(id: number, userId: number, input: Partial<{
  title: string; durationType: string; durationTargetSeconds: number; styleType: string; aspectRatio: string;
}>): Promise<Project | null> {
  const [row] = await db.update(projects)
    .set({ ...input, updatedAt: Math.floor(Date.now() / 1000) })
    .where(and(eq(projects.id, id), eq(projects.userId, userId)))
    .returning();
  return row ?? null;
}

export async function softDeleteProject(id: number, userId: number): Promise<boolean> {
  const result = await db.update(projects)
    .set({ deletedAt: Math.floor(Date.now() / 1000) })
    .where(and(eq(projects.id, id), eq(projects.userId, userId), isNull(projects.deletedAt)));
  return (result.rowsAffected ?? 0) > 0;
}

export function toProjectDTO(row: Project): {
  id: number; userId: number; title: string; durationType: string; durationTargetSeconds: number;
  styleType: string; aspectRatio: string; status: string; resultJson: unknown | null;
  storyDescription: string | null;
  createdAt: string; updatedAt: string; deletedAt: string | null;
} {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    durationType: row.durationType,
    durationTargetSeconds: row.durationTargetSeconds,
    styleType: row.styleType,
    aspectRatio: row.aspectRatio,
    status: row.status,
    resultJson: row.resultJson ? JSON.parse(row.resultJson) : null,
    storyDescription: row.storyDescription ?? null, // V2
    createdAt: new Date(row.createdAt * 1000).toISOString(),
    updatedAt: new Date(row.updatedAt * 1000).toISOString(),
    deletedAt: row.deletedAt ? new Date(row.deletedAt * 1000).toISOString() : null,
  };
}