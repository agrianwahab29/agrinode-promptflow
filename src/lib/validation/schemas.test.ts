import { describe, it, expect } from 'vitest';
import {
  CreateProjectInputSchema,
  PromptPackageSchema,
  CreateProviderConfigInputSchema,
  GenerateInputSchema,
  AssetRoleEnum,
  ClassificationResultSchema,
  SseLogEntrySchema,
  StoryboardSegmentSchema,
} from './schemas';

describe('TitleSchema', () => {
  it('accepts valid title', () => {
    const r = CreateProjectInputSchema.safeParse({
      title: 'Petualangan Hutan',
      durationType: 'shorts',
      durationTargetSeconds: 60,
      styleType: '3D',
      aspectRatio: '16:9',
    });
    expect(r.success).toBe(true);
  });

  it('rejects title < 3 chars', () => {
    const r = CreateProjectInputSchema.safeParse({
      title: 'ab',
      durationType: 'shorts',
      durationTargetSeconds: 60,
      styleType: '3D',
      aspectRatio: '16:9',
    });
    expect(r.success).toBe(false);
  });

  it('rejects shorts > 180s', () => {
    const r = CreateProjectInputSchema.safeParse({
      title: 'Valid Title',
      durationType: 'shorts',
      durationTargetSeconds: 250,
      styleType: '3D',
      aspectRatio: '16:9',
    });
    expect(r.success).toBe(false);
  });

  it('rejects tutorial outside 420-900s', () => {
    const r = CreateProjectInputSchema.safeParse({
      title: 'Valid Title',
      durationType: 'tutorial',
      durationTargetSeconds: 100,
      styleType: '3D',
      aspectRatio: '16:9',
    });
    expect(r.success).toBe(false);
  });

  it('accepts tutorial in 420-900s', () => {
    const r = CreateProjectInputSchema.safeParse({
      title: 'Valid Title',
      durationType: 'tutorial',
      durationTargetSeconds: 600,
      styleType: '3D',
      aspectRatio: '16:9',
    });
    expect(r.success).toBe(true);
  });
});

describe('CreateProviderConfigInputSchema', () => {
  it('rejects non-URL baseUrl', () => {
    const r = CreateProviderConfigInputSchema.safeParse({
      provider: 'ollama',
      name: 'Test',
      baseUrl: 'not-a-url',
      model: 'm',
      apiKey: 'k',
    });
    expect(r.success).toBe(false);
  });

  it('rejects invalid provider enum', () => {
    const r = CreateProviderConfigInputSchema.safeParse({
      provider: 'invalid',
      name: 'Test',
      baseUrl: 'https://x.com',
      model: 'm',
      apiKey: 'k',
    });
    expect(r.success).toBe(false);
  });

  it('accepts all valid providers', () => {
    for (const p of ['ollama', 'openrouter', '9router', 'custom'] as const) {
      const r = CreateProviderConfigInputSchema.safeParse({
        provider: p, name: 'T', baseUrl: 'https://x.com', model: 'm', apiKey: 'k',
      });
      expect(r.success).toBe(true);
    }
  });
});

describe('GenerateInputSchema', () => {
  it('requires durationTarget', () => {
    const r = GenerateInputSchema.safeParse({
      input: {
        title: 'Hello',
        style: { type: '3D', ratio: '16:9' },
      },
    });
    expect(r.success).toBe(false);
  });

  it('accepts minimal input', () => {
    const r = GenerateInputSchema.safeParse({
      input: {
        title: 'Hello',
        durationTarget: { type: 'shorts', seconds: 60 },
        style: { type: '3D', ratio: '16:9' },
      },
    });
    expect(r.success).toBe(true);
  });
});

describe('PromptPackageSchema', () => {
  it('accepts minimal valid package', () => {
    const r = PromptPackageSchema.safeParse({
      title: 'Test',
      duration_target: { type: 'shorts', seconds: 60 },
      style: { type: '3D', aspect_ratio: '16:9' },
      character_profiles: [],
      scenes: [],
      image_prompts: { characters: [], backgrounds: [] },
      supporting_characters: [],
      moral_message: 'Be kind.',
    });
    expect(r.success).toBe(true);
  });

  it('rejects missing moral_message', () => {
    const r = PromptPackageSchema.safeParse({
      title: 'Test',
      duration_target: { type: 'shorts', seconds: 60 },
      style: { type: '3D', aspect_ratio: '16:9' },
      character_profiles: [],
      scenes: [],
      image_prompts: { characters: [], backgrounds: [] },
      supporting_characters: [],
    });
    expect(r.success).toBe(false);
  });

  it('accepts arbitrary peran string (schema loosened in e3dc6ac)', () => {
    const r = PromptPackageSchema.safeParse({
      title: 'Test',
      duration_target: { type: 'shorts', seconds: 60 },
      style: { type: '3D', aspect_ratio: '16:9' },
      character_profiles: [{ nama: 'X', gayarambut: 'a', wajah_asal: 'b', pakaian_atas: 'c', pakaian_bawah: 'd', alas_kaki: 'e', deskripsi_latar: 'f', aksi: 'g', peran: 'invalid' }],
      scenes: [],
      image_prompts: { characters: [], backgrounds: [] },
      supporting_characters: [],
      moral_message: 'Hi',
    });
    expect(r.success).toBe(true);
  });
});

describe('V2: AssetRoleEnum (6-tipe)', () => {
  it('accepts all 6 valid roles', () => {
    for (const r of ['tokoh', 'background', 'prop', 'accessory', 'environment', 'other'] as const) {
      expect(AssetRoleEnum.safeParse(r).success).toBe(true);
    }
  });

  it('rejects invalid role', () => {
    expect(AssetRoleEnum.safeParse('foo').success).toBe(false);
  });
});

describe('V2: ClassificationResultSchema', () => {
  it('accepts valid classification', () => {
    const r = ClassificationResultSchema.safeParse({
      role: 'tokoh', label: 'Hero', confidence: 0.95,
    });
    expect(r.success).toBe(true);
  });

  it('rejects confidence out of range', () => {
    const r = ClassificationResultSchema.safeParse({
      role: 'tokoh', label: 'X', confidence: 1.5,
    });
    expect(r.success).toBe(false);
  });
});

describe('V2: SseLogEntrySchema', () => {
  it('accepts info log', () => {
    const r = SseLogEntrySchema.safeParse({ level: 'info', message: 'hi', timestamp: 123 });
    expect(r.success).toBe(true);
  });

  it('rejects invalid level', () => {
    const r = SseLogEntrySchema.safeParse({ level: 'debug', message: 'hi', timestamp: 123 });
    expect(r.success).toBe(false);
  });
});

describe('V2: GenerateInputSchema storyDescription', () => {
  it('accepts storyDescription up to 500', () => {
    const r = GenerateInputSchema.safeParse({
      input: {
        title: 'Valid Title',
        durationTarget: { type: 'shorts', seconds: 60 },
        style: { type: '3D', ratio: '16:9' },
        storyDescription: 'A'.repeat(500),
      },
    });
    expect(r.success).toBe(true);
  });

  it('rejects storyDescription > 500', () => {
    const r = GenerateInputSchema.safeParse({
      input: {
        title: 'Valid Title',
        durationTarget: { type: 'shorts', seconds: 60 },
        style: { type: '3D', ratio: '16:9' },
        storyDescription: 'A'.repeat(501),
      },
    });
    expect(r.success).toBe(false);
  });

  it('accepts missing storyDescription', () => {
    const r = GenerateInputSchema.safeParse({
      input: {
        title: 'Valid Title',
        durationTarget: { type: 'shorts', seconds: 60 },
        style: { type: '3D', ratio: '16:9' },
      },
    });
    expect(r.success).toBe(true);
  });
});

describe('V2: GenerateReferenceSchema 6-tipe', () => {
  it('accepts all 6 roles', () => {
    for (const type of ['tokoh', 'background', 'prop', 'accessory', 'environment', 'other'] as const) {
      const r = GenerateInputSchema.safeParse({
        input: {
          title: 'Valid Title',
          durationTarget: { type: 'shorts', seconds: 60 },
          style: { type: '3D', ratio: '16:9' },
          references: [{ name: 'a.png', type }],
        },
      });
      expect(r.success).toBe(true);
    }
  });

  it('rejects invalid role', () => {
    const r = GenerateInputSchema.safeParse({
      input: {
        title: 'Valid Title',
        durationTarget: { type: 'shorts', seconds: 60 },
        style: { type: '3D', ratio: '16:9' },
        references: [{ name: 'a.png', type: 'invalid' }],
      },
    });
    expect(r.success).toBe(false);
  });
});

const minimalSegment = {
  segmentIndex: 1,
  segmentTimeStart: 0,
  segmentTimeEnd: 10,
  durationSeconds: 10,
  panelCount: 8,
  visualStyle: {
    aspectRatio: '16:9',
    artDirection: '3D animation semi-realistic',
    colorPalette: 'warm golden hour',
    cinematography: 'wide shots with slow push-ins',
  },
  characterSheet: [{ name: 'Adrian', visualDescription: 'young man, white shirt, black trousers' }],
  locationSheet: [{ name: 'Office Lobby', visualDescription: 'modern marble lobby, golden sunset light' }],
  panels: [
    {
      index: 1,
      time: '0:00 - 0:01.25',
      sceneCode: 'INT. LOBBY - DAY',
      title: 'Lobby Pertama',
      imagePrompt: 'low angle shot of Adrian walking into luxury office lobby...',
      actionVisual: 'Adrian walks confidently into the lobby',
      cameraMovement: 'LOW ANGLE - slow push in',
      dialogueVo: 'Setiap mimpi dimulai dari sebuah keinginan kecil.',
      transition: 'FADE IN',
      charactersPresent: ['Adrian'],
      location: 'Office Lobby',
    },
  ],
  segmentTransitionNote: 'FADE OUT to segment 2',
  compiledMarkdownPrompt: '# Storyboard Segment 1...',
};

it('validates a minimal storyboard segment', () => {
  expect(StoryboardSegmentSchema.safeParse(minimalSegment).success).toBe(true);
});
