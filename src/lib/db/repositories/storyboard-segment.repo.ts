import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { storyboardSegments, type NewStoryboardSegment, type StoryboardSegment as StoryboardSegmentRow } from '../schema';
import type { StoryboardSegment } from '@/lib/validation/schemas';

export interface StoryboardSegmentDTO extends Omit<StoryboardSegment, 'visualStyle' | 'characterSheet' | 'locationSheet' | 'panels'> {
  visualStyleJson: string;
  characterSheetJson: string;
  locationSheetJson: string;
  panelsJson: string;
}

function toSegmentDTO(row: StoryboardSegmentRow): StoryboardSegment {
  const panels = safeParseJson<StoryboardSegment['panels']>(row.panelsJson, []);
  const visualStyle = safeParseJson<StoryboardSegment['visualStyle']>(row.visualStyleJson, {
    aspectRatio: '',
    artDirection: '',
    colorPalette: '',
    cinematography: '',
  });
  const characterSheet = safeParseJson<StoryboardSegment['characterSheet']>(row.characterSheetJson, []);
  const locationSheet = safeParseJson<StoryboardSegment['locationSheet']>(row.locationSheetJson, []);

  return {
    segmentIndex: row.segmentIndex,
    segmentTimeStart: row.segmentTimeStart,
    segmentTimeEnd: row.segmentTimeEnd,
    durationSeconds: row.segmentTimeEnd - row.segmentTimeStart,
    panelCount: row.panelCount,
    visualStyle,
    characterSheet,
    locationSheet,
    panels,
    segmentTransitionNote: row.segmentTransitionNote ?? '',
    compiledMarkdownPrompt: row.markdownPrompt,
  };
}

function safeParseJson<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

export async function bulkCreateStoryboardSegments(
  inserts: NewStoryboardSegment[],
): Promise<StoryboardSegmentRow[]> {
  if (inserts.length === 0) return [];
  return db.insert(storyboardSegments).values(inserts).returning().all();
}

export async function getStoryboardSegmentsByProject(projectId: number): Promise<StoryboardSegment[]> {
  const rows = await db.select().from(storyboardSegments).where(eq(storyboardSegments.projectId, projectId)).orderBy(storyboardSegments.segmentIndex).all();
  return rows.map(toSegmentDTO);
}

export async function getStoryboardSegmentByIndex(projectId: number, segmentIndex: number): Promise<StoryboardSegment | undefined> {
  const row = await db.select().from(storyboardSegments).where(and(eq(storyboardSegments.projectId, projectId), eq(storyboardSegments.segmentIndex, segmentIndex))).get();
  if (!row) return undefined;
  return toSegmentDTO(row);
}

export async function deleteStoryboardSegmentsByProject(projectId: number): Promise<void> {
  await db.delete(storyboardSegments).where(eq(storyboardSegments.projectId, projectId));
}

export async function deleteStoryboardSegment(projectId: number, segmentIndex: number): Promise<void> {
  await db.delete(storyboardSegments).where(and(eq(storyboardSegments.projectId, projectId), eq(storyboardSegments.segmentIndex, segmentIndex)));
}
