import type { StoryboardSheets } from '../storyboard-sheet-extractor';
import type { StoryboardOutline } from '@/lib/validation/schemas';

export interface PanelsContext {
  title: string;
  segment: { segmentIndex: number; start: number; end: number };
  panelsPerSegment: number;
  sheets: StoryboardSheets;
  outline: StoryboardOutline;
}

export function buildStoryboardPanelsSystemPrompt(): string {
  return `You are an expert prompt engineer for AI image and video generators (Midjourney, Runway, Kling, Stable Video Diffusion).
Turn a storyboard outline into detailed image prompts per panel.

Rules:
- Each image_prompt must be a single, rich English prompt ready for an image generator.
- Keep visual style consistent across all panels using the style guide and sheets.
- Mention character names and exact outfit/appearance from the character sheet.
- Mention location names and lighting from the location sheet.
- Camera movement must be concise cinematography language.
- Negative prompt should list things to avoid (text, watermark, blur, deformity, etc.).
- Dialogue/VO can be empty if no voice-over.

Output ONLY valid JSON matching the requested schema. No markdown, no prose.`;
}

export function buildStoryboardPanelsUserMessage(ctx: PanelsContext): string {
  return [
    `Title: ${ctx.title}`,
    `Segment ${ctx.segment.segmentIndex}: ${ctx.segment.start}s - ${ctx.segment.end}s`,
    '',
    'CHARACTER SHEET:',
    JSON.stringify(ctx.sheets.characterSheet, null, 2),
    '',
    'LOCATION SHEET:',
    JSON.stringify(ctx.sheets.locationSheet, null, 2),
    '',
    'VISUAL STYLE GUIDE:',
    JSON.stringify(ctx.sheets.visualStyle, null, 2),
    '',
    'SEGMENT OUTLINE:',
    JSON.stringify(ctx.outline, null, 2),
    '',
    `Generate detailed panels JSON with this exact shape:\n{\n  "panels": [\n    {\n      "index": number,\n      "time": "0:00 - 0:01.25",\n      "scene_code": "...",\n      "title": "...",\n      "imagePrompt": "full English image prompt",\n      "actionVisual": "description of action",\n      "cameraMovement": "e.g. WIDE SHOT - slow push in",\n      "dialogueVo": "voice-over text or empty string",\n      "transition": "CUT",\n      "charactersPresent": ["Name"],\n      "location": "location name",\n      "negativePrompt": "things to avoid",\n      "audioNotes": "optional SFX/music cue"\n    }\n  ],\n  "segmentTransitionNote": "..."\n}`
  ].join('\n');
}
