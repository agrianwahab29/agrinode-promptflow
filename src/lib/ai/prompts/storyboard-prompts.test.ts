import { describe, it, expect } from 'vitest';
import { buildStoryboardOutlineSystemPrompt } from './storyboard-outline.system';
import { compileStoryboardMarkdown } from './storyboard-compiler';
import { StoryboardSegmentSchema } from '@/lib/validation/schemas';

describe('storyboard prompts', () => {
  it('outline system prompt contains required rules', () => {
    const prompt = buildStoryboardOutlineSystemPrompt();
    expect(prompt).toContain('maksimal 10 detik');
    expect(prompt).toContain('FADE IN');
    expect(prompt).toContain('Bahasa Indonesia');
  });

  it('compiles markdown from a valid segment', () => {
    const segment = StoryboardSegmentSchema.parse({
      segmentIndex: 1,
      segmentTimeStart: 0,
      segmentTimeEnd: 10,
      durationSeconds: 10,
      panelCount: 1,
      visualStyle: { aspectRatio: '16:9', artDirection: '3D', colorPalette: 'warm', cinematography: 'wide' },
      characterSheet: [{ name: 'Adrian', visualDescription: 'young man' }],
      locationSheet: [{ name: 'Lobby', visualDescription: 'modern lobby' }],
      panels: [{
        index: 1,
        time: '0:00 - 0:10',
        sceneCode: 'INT. LOBBY - DAY',
        title: 'Enter',
        imagePrompt: 'Adrian enters lobby',
        actionVisual: 'Adrian walks in',
        cameraMovement: 'WIDE SHOT',
        dialogueVo: '',
        transition: 'FADE IN',
        charactersPresent: ['Adrian'],
        location: 'Lobby',
      }],
      segmentTransitionNote: 'Cut to segment 2',
      compiledMarkdownPrompt: '# Storyboard Segment 1',
    });
    const md = compileStoryboardMarkdown(segment);
    expect(md).toContain('STORYBOARD');
    expect(md).toContain('Adrian');
    expect(md).toContain('WIDE SHOT');
    expect(md).toContain('Panduan Gaya Visual');
    expect(md).toContain('ACTION/VISUAL');
  });
});
