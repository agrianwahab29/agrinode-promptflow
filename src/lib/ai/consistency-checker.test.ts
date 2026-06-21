import { describe, it, expect } from 'vitest';
import { checkConsistency } from './consistency-checker';
import type { PromptPackage } from '@/lib/validation/schemas';

const basePackage: PromptPackage = {
  title: 'T',
  duration_target: { type: 'shorts', seconds: 60 },
  style: { type: '3D', aspect_ratio: '16:9' },
  character_profiles: [
    { nama: 'Hero', gayarambut: 'hitam', wajah_asal: 'ID', pakaian_atas: 'kaos', pakaian_bawah: 'celana', alas_kaki: 'sepatu', deskripsi_latar: 'desa', aksi: 'jalan', peran: 'utama' },
  ],
  scenes: [
    {
      order: 1,
      description: 'Hero jalan',
      voiceover_script: '...',
      voiceover_speaker: 'narrator',
      image_prompts: { characters: [{ target: 'Hero', prompt_text: '3D Hero', reference_filename: null }], backgrounds: [] },
      transition_type: 'cut',
      transition_duration_ms: 0,
      transition_easing: 'linear',
      transition_direction: 'forward',
      voice_type: 'narrator',
      voice_emotion: 'neutral',
      voice_speed: 1.0,
      voice_pitch: 'auto',
      scene_pacing: 'normal',
    },
    {
      order: 2,
      description: 'Hero lompat',
      voiceover_script: '...',
      voiceover_speaker: 'narrator',
      image_prompts: { characters: [{ target: 'Hero', prompt_text: '3D Hero', reference_filename: null }], backgrounds: [] },
      transition_type: 'cut',
      transition_duration_ms: 0,
      transition_easing: 'linear',
      transition_direction: 'forward',
      voice_type: 'narrator',
      voice_emotion: 'neutral',
      voice_speed: 1.0,
      voice_pitch: 'auto',
      scene_pacing: 'normal',
    },
  ],
  image_prompts: { characters: [], backgrounds: [] },
  supporting_characters: [],
  moral_message: 'Be kind.',
};

describe('checkConsistency', () => {
  it('returns no warnings when all scenes reference existing characters', () => {
    expect(checkConsistency(basePackage)).toEqual([]);
  });

  it('warns when scene references unknown character', () => {
    const pkg: PromptPackage = {
      ...basePackage,
      scenes: [
        { ...basePackage.scenes[0]!, image_prompts: { characters: [{ target: 'Ghost', prompt_text: 'x', reference_filename: null }], backgrounds: [] } },
        basePackage.scenes[1]!,
      ],
    };
    const warnings = checkConsistency(pkg);
    expect(warnings.length).toBe(1);
    expect(warnings[0]!.code).toBe('CONSISTENCY_MISMATCH');
    expect(warnings[0]!.target).toBe('Ghost');
    expect(warnings[0]!.scene).toBe(1);
  });
});
