import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { storyboardSegments, type NewStoryboardSegment, type StoryboardSegment } from '../schema';

export async function bulkCreateStoryboardSegments(
  inserts: NewStoryboardSegment[],
): Promise<StoryboardSegment[]> {
  if (inserts.length === 0) return [];
  return db.insert(storyboardSegments).values(inserts).returning().all();
}

export async function getStoryboardSegmentsByProject(projectId: number): Promise<StoryboardSegment[]> {
  return db.select().from(storyboardSegments).where(eq(storyboardSegments.projectId, projectId)).orderBy(storyboardSegments.segmentIndex).all();
}

export async function getStoryboardSegmentByIndex(projectId: number, segmentIndex: number): Promise<StoryboardSegment | undefined> {
  return db.select().from(storyboardSegments).where(and(eq(storyboardSegments.projectId, projectId), eq(storyboardSegments.segmentIndex, segmentIndex))).get();
}

export async function deleteStoryboardSegmentsByProject(projectId: number): Promise<void> {
  await db.delete(storyboardSegments).where(eq(storyboardSegments.projectId, projectId));
}

export async function deleteStoryboardSegment(projectId: number, segmentIndex: number): Promise<void> {
  await db.delete(storyboardSegments).where(and(eq(storyboardSegments.projectId, projectId), eq(storyboardSegments.segmentIndex, segmentIndex)));
}
