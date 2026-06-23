import { describe, it, expect } from 'vitest';
import { calculateSegments } from './storyboard-segmenter';

describe('calculateSegments', () => {
  it('splits 30s into 3 segments of 10s', () => {
    expect(calculateSegments(30, 10)).toEqual([
      { segmentIndex: 1, start: 0, end: 10 },
      { segmentIndex: 2, start: 10, end: 20 },
      { segmentIndex: 3, start: 20, end: 30 },
    ]);
  });

  it('rounds up partial segments', () => {
    expect(calculateSegments(35, 10)).toHaveLength(4);
    expect(calculateSegments(35, 10)[3]).toEqual({ segmentIndex: 4, start: 30, end: 35 });
  });
});
