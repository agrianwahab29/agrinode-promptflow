import 'server-only';
import { and, eq, isNull, desc, count, avg, sql, gte } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { projects, generationLogs, assetReferences, providerConfigs } from '@/lib/db/schema';

export interface DashboardStats {
  totalProjects: number;
  successfulGenerations: number;
  failedGenerations: number;
  partialGenerations: number;
  avgDurationMs: number;
  totalCharacters: number;
  totalScenes: number;
  totalAssetReferences: number;
  perProviderBreakdown: Array<{ provider: string; model: string; count: number; avgDurationMs: number }>;
  recentProjects: Array<{ id: number; title: string; status: string; createdAt: string }>;
  weeklyTrend: Array<{ week: string; count: number }>;
  storageBytes: number;
}

export async function getDashboardStats(userId: number): Promise<DashboardStats> {
  // 1. Total projects
  const [projCount] = await db
    .select({ value: count() })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));

  // 2. Successful generations
  const [succCount] = await db
    .select({ value: count() })
    .from(generationLogs)
    .innerJoin(projects, eq(generationLogs.projectId, projects.id))
    .where(and(eq(projects.userId, userId), eq(generationLogs.status, 'success')));

  // 3. Failed
  const [failCount] = await db
    .select({ value: count() })
    .from(generationLogs)
    .innerJoin(projects, eq(generationLogs.projectId, projects.id))
    .where(and(eq(projects.userId, userId), eq(generationLogs.status, 'fail')));

  // 4. Partial
  const [partCount] = await db
    .select({ value: count() })
    .from(generationLogs)
    .innerJoin(projects, eq(generationLogs.projectId, projects.id))
    .where(and(eq(projects.userId, userId), eq(generationLogs.status, 'partial')));

  // 5. Avg duration
  const [avgDur] = await db
    .select({ value: avg(generationLogs.durationMs) })
    .from(generationLogs)
    .innerJoin(projects, eq(generationLogs.projectId, projects.id))
    .where(eq(projects.userId, userId));

  // 6. Asset references count
  const [refCount] = await db
    .select({ value: sql<number>`COALESCE(SUM(${assetReferences.sizeBytes}), 0)` })
    .from(assetReferences)
    .innerJoin(projects, eq(assetReferences.projectId, projects.id))
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));

  // 7. Per-provider breakdown
  const providerRows = await db
    .select({
      provider: generationLogs.provider,
      model: generationLogs.model,
      count: count(),
      avgDurationMs: avg(generationLogs.durationMs),
    })
    .from(generationLogs)
    .innerJoin(projects, eq(generationLogs.projectId, projects.id))
    .where(eq(projects.userId, userId))
    .groupBy(generationLogs.provider, generationLogs.model);

  // 8. Recent projects (5)
  const recentRows = await db
    .select({
      id: projects.id,
      title: projects.title,
      status: projects.status,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.createdAt))
    .limit(5);

  // 9. Weekly trend (last 8 weeks)
  const eightWeeksAgo = Math.floor(Date.now() / 1000) - 8 * 7 * 24 * 60 * 60;
  const trendRows = await db
    .select({
      week: sql<string>`strftime('%Y-%W', datetime(${projects.createdAt}, 'unixepoch'))`,
      count: count(),
    })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt), gte(projects.createdAt, eightWeeksAgo)))
    .groupBy(sql`strftime('%Y-%W', datetime(${projects.createdAt}, 'unixepoch'))`);

  // 10. Provider count (for "active providers" metric)
  void providerConfigs; // referenced to satisfy import (used in future)

  return {
    totalProjects: Number(projCount?.value ?? 0),
    successfulGenerations: Number(succCount?.value ?? 0),
    failedGenerations: Number(failCount?.value ?? 0),
    partialGenerations: Number(partCount?.value ?? 0),
    avgDurationMs: Math.round(Number(avgDur?.value ?? 0)),
    totalCharacters: 0, // skipped in V2 lightweight dashboard
    totalScenes: 0,
    totalAssetReferences: Number(refCount?.value ?? 0),
    perProviderBreakdown: providerRows.map((r) => ({
      provider: r.provider,
      model: r.model,
      count: Number(r.count),
      avgDurationMs: Math.round(Number(r.avgDurationMs ?? 0)),
    })),
    recentProjects: recentRows.map((r) => ({
      id: r.id,
      title: r.title,
      status: r.status,
      createdAt: new Date(r.createdAt * 1000).toISOString(),
    })),
    weeklyTrend: trendRows.map((r) => ({ week: r.week, count: Number(r.count) })),
    storageBytes: Number(refCount?.value ?? 0),
  };
}
