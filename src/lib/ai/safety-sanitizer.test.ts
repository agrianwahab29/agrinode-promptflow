import { describe, it, expect } from 'vitest';
import { sanitizePromptPackage } from './safety-sanitizer';
import type { PromptPackage } from '@/lib/validation/schemas';

function makeBasePkg(): PromptPackage {
  return {
    title: 'Test',
    duration_target: { type: 'shorts', seconds: 60 },
    style: { type: '3D', aspect_ratio: '16:9' },
    character_profiles: [],
    scenes: [],
    image_prompts: { characters: [], backgrounds: [] },
    supporting_characters: [],
    moral_message: 'test',
  };
}

describe('sanitizePromptPackage', () => {
  it('replaces "anak perempuan 9 tahun" with neutral term', () => {
    const pkg = makeBasePkg();
    pkg.character_profiles.push({
      nama: 'Rina', gayarambut: 'hitam', wajah_asal: 'bulat',
      pakaian_atas: 'kaos', pakaian_bawah: 'celana', alas_kaki: 'sandal',
      deskripsi_latar: 'Anak perempuan 9 tahun petualang', aksi: 'jalan', peran: 'utama',
      age_range: '8-12',
    });
    const report = sanitizePromptPackage(pkg);
    expect(report.modified).toBe(true);
    expect(pkg.character_profiles[0]!.deskripsi_latar).not.toMatch(/\d+\s*tahun/i);
    expect(pkg.character_profiles[0]!.age_range).toBe('young');
  });

  it('replaces "10-year-old girl" English pattern', () => {
    const pkg = makeBasePkg();
    pkg.image_prompts.characters.push({
      target: 'Hero', prompt_text: 'A 10-year-old girl with red hair', reference_filename: null,
    });
    sanitizePromptPackage(pkg);
    expect(pkg.image_prompts.characters[0]!.prompt_text).not.toMatch(/\d+[-\s]?year/i);
  });

  it('preserves already-safe text', () => {
    const pkg = makeBasePkg();
    pkg.image_prompts.characters.push({
      target: 'Hero', prompt_text: 'A young character with red hair', reference_filename: null,
    });
    const report = sanitizePromptPackage(pkg);
    expect(report.modified).toBe(false);
  });

  it('sanitizes scene image_prompts', () => {
    const pkg = makeBasePkg();
    pkg.scenes.push({
      order: 1, description: 'anak 8 tahun bermain', voiceover_script: 'x',
      voiceover_speaker: 'narrator', transition_type: 'cut', transition_duration_ms: 1000,
      transition_easing: 'linear', transition_direction: 'forward',
      voice_type: 'narrator', voice_emotion: 'neutral', voice_speed: 1.0, voice_pitch: 'medium',
      duration_seconds: 5, scene_pacing: 'normal', scene_mood: 'cheerful',
      image_prompts: {
        characters: [{ target: 'Kid', prompt_text: 'anak 7 tahun lari', reference_filename: null }],
        backgrounds: [],
      },
      audio_specs: [],
    });
    sanitizePromptPackage(pkg);
    expect(pkg.scenes[0]!.description).not.toMatch(/\d+\s*tahun/i);
    expect(pkg.scenes[0]!.image_prompts.characters[0]!.prompt_text).not.toMatch(/\d+\s*tahun/i);
  });

  it('maps age_range numbers to categories', () => {
    const pkg = makeBasePkg();
    pkg.character_profiles.push({
      nama: 'A', gayarambut: '', wajah_asal: '', pakaian_atas: '', pakaian_bawah: '',
      alas_kaki: '', deskripsi_latar: '', aksi: '', peran: 'utama', age_range: '15-17',
    });
    pkg.character_profiles.push({
      nama: 'B', gayarambut: '', wajah_asal: '', pakaian_atas: '', pakaian_bawah: '',
      alas_kaki: '', deskripsi_latar: '', aksi: '', peran: 'utama', age_range: '60+',
    });
    sanitizePromptPackage(pkg);
    expect(pkg.character_profiles[0]!.age_range).toBe('teen');
    expect(pkg.character_profiles[1]!.age_range).toBe('elderly');
  });
});