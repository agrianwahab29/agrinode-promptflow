import { describe, it, expect, vi, beforeEach } from 'vitest';
import { epochNow } from '@/lib/utils';
import { toProjectDTO } from '@/lib/db/repositories/project.repo';

vi.mock('@/lib/db/client', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
  },
}));

describe('project.repo utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('epochNow returns unix seconds', () => {
    const t = epochNow();
    expect(t).toBeGreaterThan(1700000000);
    expect(t).toBeLessThan(3000000000);
  });

  it('toProjectDTO serializes deletedAt correctly', () => {
    const now = Math.floor(Date.now() / 1000);
    const row: Parameters<typeof toProjectDTO>[0] = {
      id: 1,
      userId: 1,
      title: 't',
      durationType: 'shorts',
      durationTargetSeconds: 60,
      styleType: '3D',
      aspectRatio: '16:9',
      resultJson: null,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    const dto = toProjectDTO(row);
    expect(dto.deletedAt).toBeNull();
    expect(dto.resultJson).toBeNull();
  });
});