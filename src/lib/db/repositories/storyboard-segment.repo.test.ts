import { describe, it, expect, beforeAll } from 'vitest';
import { eq } from 'drizzle-orm';
import { bulkCreateStoryboardSegments, getStoryboardSegmentsByProject } from './storyboard-segment.repo';
import { db } from '../client';
import { projects, users } from '../schema';

async function seedUserAndProject() {
  const existing = await db.select().from(users).where(eq(users.email, 'sb@test.com')).limit(1);
  let user;
  if (existing.length > 0) {
    user = existing[0]!;
  } else {
    const inserted = await db.insert(users).values({ email: 'sb@test.com', name: 'Test', passwordHash: 'x' }).returning().get();
    user = inserted!;
  }
  const project = await db.insert(projects).values({
    userId: user.id,
    title: 'Test',
    durationType: 'standard',
    durationTargetSeconds: 30,
    styleType: 'cinematic',
    aspectRatio: '16:9',
  }).returning().get();
  return { user, project };
}

beforeAll(async () => {
  await db.run('PRAGMA foreign_keys = ON');
});

describe('storyboard segment repo', () => {
  it('creates and retrieves segments', async () => {
    const { project } = await seedUserAndProject();
    const segments = [{
      projectId: project.id,
      segmentIndex: 1,
      segmentTimeStart: 0,
      segmentTimeEnd: 10,
      panelCount: 4,
      visualStyleJson: '{}',
      characterSheetJson: '[]',
      locationSheetJson: '[]',
      panelsJson: '[]',
      markdownPrompt: '# Segment 1',
      segmentTransitionNote: 'cut',
      provider: 'openai',
      model: 'gpt-4o',
    }];
    await bulkCreateStoryboardSegments(segments);
    const result = await getStoryboardSegmentsByProject(project.id);
    expect(result).toHaveLength(1);
    expect(result[0]?.segmentIndex).toBe(1);
  });
});
