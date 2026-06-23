import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/lib/auth/config', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 1 } }),
}));

vi.mock('@/lib/db/repositories/project.repo', () => ({
  getProjectById: vi.fn().mockResolvedValue({ id: 1, userId: 1, title: 'Test' }),
}));

vi.mock('@/lib/db/repositories/storyboard-segment.repo', () => ({
  getStoryboardSegmentsByProject: vi.fn().mockResolvedValue([
    { segmentIndex: 1, markdownPrompt: '# Seg 1' },
  ]),
}));

describe('GET /api/v1/projects/[id]/storyboard', () => {
  it('returns segments for the project', async () => {
    const req = new Request('http://localhost/api/v1/projects/1/storyboard');
    const res = await GET(req, { params: Promise.resolve({ id: '1' }) });
    const json = await res.json();
    expect(json.segments).toHaveLength(1);
  });
});
