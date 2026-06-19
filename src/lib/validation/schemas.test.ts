import { describe, it, expect } from 'vitest';
import {
  CreateProjectInputSchema,
  PromptPackageSchema,
  CreateProviderConfigInputSchema,
  GenerateInputSchema,
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

  it('rejects invalid peran enum', () => {
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
    expect(r.success).toBe(false);
  });
});
