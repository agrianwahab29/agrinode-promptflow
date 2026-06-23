import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  bulkCreateStoryboardSegments,
  getStoryboardSegmentsByProject,
  getStoryboardSegmentByIndex,
  deleteStoryboardSegmentsByProject,
  deleteStoryboardSegment,
} from './storyboard-segment.repo';

const returning = vi.fn();
const values = vi.fn();
const insert = vi.fn();
const orderBy = vi.fn();
const where = vi.fn();
const from = vi.fn();
const select = vi.fn();
const deleteWhere = vi.fn();
const del = vi.fn();

vi.mock('@/lib/db/client', () => ({
  db: {
    insert: (...args: unknown[]) => {
      insert(...args);
      return { values };
    },
    select: (...args: unknown[]) => {
      const configured = select(...args);
      return configured || { from };
    },
    delete: (...args: unknown[]) => {
      del(...args);
      return { where: deleteWhere };
    },
  },
}));

describe('storyboard segment repo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    values.mockReturnValue({ returning });
    returning.mockReturnValue({ all: vi.fn() });
    from.mockReturnValue({ where });
    where.mockReturnValue({ orderBy });
    orderBy.mockReturnValue({ all: vi.fn() });
    deleteWhere.mockResolvedValue(undefined);
  });

  it('creates segments and returns inserted rows', async () => {
    returning.mockReturnValueOnce({
      all: vi.fn().mockResolvedValue([{ id: 1, segmentIndex: 1 }]),
    });

    const result = await bulkCreateStoryboardSegments([{
      projectId: 1,
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
    }]);

    expect(insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]?.segmentIndex).toBe(1);
  });

  it('retrieves segments ordered by segment index', async () => {
    orderBy.mockReturnValueOnce({
      all: vi.fn().mockResolvedValue([{ id: 1, segmentIndex: 1 }, { id: 2, segmentIndex: 2 }]),
    });

    const result = await getStoryboardSegmentsByProject(1);

    expect(select).toHaveBeenCalled();
    expect(from).toHaveBeenCalled();
    expect(where).toHaveBeenCalled();
    expect(orderBy).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it('retrieves a single segment by index', async () => {
    const getFn = vi.fn().mockResolvedValue({ id: 1, segmentIndex: 2 });
    const singleWhere = vi.fn().mockReturnValue({
      get: getFn,
    });
    const singleFrom = vi.fn().mockReturnValue({ where: singleWhere });
    select.mockReturnValueOnce({ from: singleFrom });

    const result = await getStoryboardSegmentByIndex(1, 2);

    expect(result).toBeDefined();
    expect(result?.segmentIndex).toBe(2);
  });

  it('deletes segments by project', async () => {
    await deleteStoryboardSegmentsByProject(1);
    expect(del).toHaveBeenCalled();
    expect(deleteWhere).toHaveBeenCalled();
  });

  it('deletes a single segment', async () => {
    await deleteStoryboardSegment(1, 2);
    expect(del).toHaveBeenCalled();
    expect(deleteWhere).toHaveBeenCalled();
  });
});
