export interface SegmentRange {
  segmentIndex: number;
  start: number;
  end: number;
}

export function calculateSegments(totalSeconds: number, segmentDurationSeconds: number = 10): SegmentRange[] {
  if (totalSeconds <= 0) return [];
  const duration = Math.max(1, segmentDurationSeconds);
  const count = Math.ceil(totalSeconds / duration);
  return Array.from({ length: count }, (_, i) => {
    const start = i * duration;
    const end = Math.min(start + duration, totalSeconds);
    return { segmentIndex: i + 1, start, end };
  });
}
