import { describe, it, expect, vi } from 'vitest';
import { generateStoryboardSegment, type StoryboardEngineOptions } from './storyboard-engine';
import { type PromptPackage } from '@/lib/validation/schemas';

vi.mock('./llm-client', () => ({
  generatePromptPackage: vi.fn().mockResolvedValueOnce({
    panel_count: 4,
    panels: [
      { index: 1, time: '0:00 - 0:02.5', scene_code: 'INT. LOBBY - DAY', title: 'Enter', characters_present: ['Adrian'], location: 'Office Lobby', transition: 'FADE IN', brief: 'Adrian enters' },
      { index: 2, time: '0:02.5 - 0:05', scene_code: 'INT. LOBBY - DAY', title: 'Walk', characters_present: ['Adrian'], location: 'Office Lobby', transition: 'CUT', brief: 'walk' },
      { index: 3, time: '0:05 - 0:07.5', scene_code: 'INT. LOBBY - DAY', title: 'Pause', characters_present: ['Adrian'], location: 'Office Lobby', transition: 'CUT', brief: 'pause' },
      { index: 4, time: '0:07.5 - 0:10', scene_code: 'INT. LOBBY - DAY', title: 'Look', characters_present: ['Adrian'], location: 'Office Lobby', transition: 'CUT', brief: 'look' },
    ],
    segment_transition_note: 'Cut to segment 2',
  }).mockResolvedValueOnce({
    panels: [
      { index: 1, time: '0:00 - 0:02.5', scene_code: 'INT. LOBBY - DAY', title: 'Enter', imagePrompt: 'A', actionVisual: 'Adrian enters', cameraMovement: 'WIDE', dialogueVo: '', transition: 'FADE IN', charactersPresent: ['Adrian'], location: 'Office Lobby' },
      { index: 2, time: '0:02.5 - 0:05', scene_code: 'INT. LOBBY - DAY', title: 'Walk', imagePrompt: 'B', actionVisual: 'walk', cameraMovement: 'PAN', dialogueVo: '', transition: 'CUT', charactersPresent: ['Adrian'], location: 'Office Lobby' },
      { index: 3, time: '0:05 - 0:07.5', scene_code: 'INT. LOBBY - DAY', title: 'Pause', imagePrompt: 'C', actionVisual: 'pause', cameraMovement: 'STATIC', dialogueVo: '', transition: 'CUT', charactersPresent: ['Adrian'], location: 'Office Lobby' },
      { index: 4, time: '0:07.5 - 0:10', scene_code: 'INT. LOBBY - DAY', title: 'Look', imagePrompt: 'D', actionVisual: 'look', cameraMovement: 'PUSH IN', dialogueVo: '', transition: 'CUT', charactersPresent: ['Adrian'], location: 'Office Lobby' },
    ],
    segmentTransitionNote: 'Cut to segment 2',
  }),
}));

const mockPkg: PromptPackage = {
  title: 'Di Balik Awan',
  duration_target: { type: 'shorts', seconds: 20 },
  style: { type: '3D', aspect_ratio: '16:9' },
  moral_message: 'Keberanian bermimpi',
  scenes: [
    {
      order: 1, description: 'Lobby', voiceover_script: '...', transition_type: 'cut', transition_duration_ms: 0,
      transition_easing: 'linear', transition_direction: 'forward', voice_type: 'narrator', voice_emotion: 'neutral',
      voice_speed: 1, voice_pitch: 'auto', duration_seconds: 5, scene_pacing: 'normal', voiceover_speaker: 'narrator',
      location: 'INT. LOBBY - DAY', image_prompts: { characters: [], backgrounds: [] }, audio_specs: [],
    },
    {
      order: 2, description: 'Room', voiceover_script: '...', transition_type: 'cut', transition_duration_ms: 0,
      transition_easing: 'linear', transition_direction: 'forward', voice_type: 'narrator', voice_emotion: 'neutral',
      voice_speed: 1, voice_pitch: 'auto', duration_seconds: 5, scene_pacing: 'normal', voiceover_speaker: 'narrator',
      location: 'INT. BEDROOM - DAY', image_prompts: { characters: [], backgrounds: [] }, audio_specs: [],
    },
  ],
  character_profiles: [{
    nama: 'Adrian', gayarambut: 'hitam pendek', wajah_asal: 'Asia', pakaian_atas: 'kemeja putih',
    pakaian_bawah: 'celana hitam', alas_kaki: 'sepatu hitam', deskripsi_latar: 'lobby', aksi: 'berjalan', peran: 'utama',
  }],
  image_prompts: { characters: [], backgrounds: [] },
  supporting_characters: [],
};

const mockOptions: StoryboardEngineOptions = {
  providerConfig: { id: 1, provider: 'openai', name: 'mock', baseUrl: 'http://localhost', model: 'gpt-4o', apiKeyEncrypted: null, userId: 1, isActive: 1, createdAt: 0, updatedAt: 0 },
  segment: { segmentIndex: 1, start: 0, end: 10 },
  totalSegments: 2,
  panelsPerSegment: 4,
  previousSegmentSummary: undefined,
  nextSegmentPreview: undefined,
};

describe('generateStoryboardSegment', () => {
  it('returns a segment with valid schema when LLM mocked', async () => {
    const result = await generateStoryboardSegment(mockPkg, mockOptions);
    expect(result.segmentIndex).toBe(1);
    expect(result.panels).toHaveLength(4);
    expect(result.compiledMarkdownPrompt).toContain('STORYBOARD');
  });
});
