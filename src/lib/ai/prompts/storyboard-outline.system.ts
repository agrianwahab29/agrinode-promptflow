import type { StoryboardSheets } from '../storyboard-sheet-extractor';
import type { SegmentRange } from '../storyboard-segmenter';

export interface OutlineContext {
  title: string;
  durationTargetSeconds: number;
  segment: SegmentRange;
  totalSegments: number;
  sheets: StoryboardSheets;
  previousSegmentSummary?: string;
  nextSegmentPreview?: string;
  panelsPerSegment: number;
  storyDescription?: string;
}

export function buildStoryboardOutlineSystemPrompt(): string {
  return `You are an expert storyboard artist and prompt engineer for AI video generation.
Your task is to break a video segment into a sequence of visual panels.

Rules:
- Each panel must fit within the 10-second segment.
- Panel durations should sum to exactly the segment duration.
- Use timestamp format: 0:00 - 0:01.25
- Each panel needs: index, time, scene_code (e.g. INT. LOBBY - DAY), title, characters_present, location, transition, brief.
- The first panel of segment 1 uses FADE IN.
- The last panel of the final segment uses FADE OUT.
- Other panels use CUT, MATCH CUT, DISSOLVE, or WIPE as appropriate.
- Maintain character and location consistency using the provided sheets.
- Camera language should be concise (e.g. LOW ANGLE - slow push in).

Output ONLY valid JSON matching the requested schema. No markdown, no prose.`;
}

export function buildStoryboardOutlineUserMessage(ctx: OutlineContext): string {
  const parts = [
    `Title: ${ctx.title}`,
    `Total duration: ${ctx.durationTargetSeconds}s`,
    `This segment: ${ctx.segment.start}s - ${ctx.segment.end}s (segment ${ctx.segment.segmentIndex} of ${ctx.totalSegments})`,
    `Target panels in this segment: ${ctx.panelsPerSegment}`,
    ctx.storyDescription ? `Story description: ${ctx.storyDescription}` : '',
    '',
    'CHARACTER SHEET (use exact visual descriptions):',
    JSON.stringify(ctx.sheets.characterSheet, null, 2),
    '',
    'LOCATION SHEET (use exact visual descriptions):',
    JSON.stringify(ctx.sheets.locationSheet, null, 2),
    '',
    'VISUAL STYLE GUIDE:',
    JSON.stringify(ctx.sheets.visualStyle, null, 2),
  ];

  if (ctx.previousSegmentSummary) {
    parts.push('', `PREVIOUS SEGMENT SUMMARY:\n${ctx.previousSegmentSummary}`);
  }
  if (ctx.nextSegmentPreview) {
    parts.push('', `NEXT SEGMENT PREVIEW:\n${ctx.nextSegmentPreview}`);
  }

  parts.push(
    '',
    `Generate an outline JSON with this exact shape:\n{\n  "panel_count": number,\n  "panels": [\n    {\n      "index": number,\n      "time": "0:00 - 0:01.25",\n      "scene_code": "INT/EXT. LOCATION - TIME",\n      "title": "short panel title",\n      "characters_present": ["Name"],\n      "location": "location name",\n      "transition": "CUT | MATCH CUT | FADE IN | FADE OUT | DISSOLVE | WIPE",\n      "brief": "one sentence visual/camera direction"\n    }\n  ],\n  "segment_transition_note": "how this segment connects to the next"\n}`
  );

  return parts.filter(Boolean).join('\n');
}
