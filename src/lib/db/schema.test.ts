import { describe, it, expect } from 'vitest';
import { storyboardSegments } from './schema';

describe('storyboard_segments schema', () => {
  it('has expected columns', () => {
    expect(storyboardSegments.segmentIndex).toBeDefined();
    expect(storyboardSegments.panelsJson).toBeDefined();
    expect(storyboardSegments.markdownPrompt).toBeDefined();
  });
});
