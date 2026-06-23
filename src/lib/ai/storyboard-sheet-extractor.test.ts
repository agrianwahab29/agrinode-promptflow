import { describe, it, expect } from 'vitest';
import { extractSheets } from './storyboard-sheet-extractor';
import { type PromptPackage } from '@/lib/validation/schemas';

const mockPkg: PromptPackage = {
  title: 'Di Balik Awan',
  duration_target: { type: 'shorts', seconds: 60 },
  style: { type: '3D', aspect_ratio: '16:9' },
  moral_message: '',
  scenes: [
    {
      order: 1,
      description: 'Lobby kantor mewah',
      voiceover_script: '...',
      transition_type: 'cut',
      transition_duration_ms: 0,
      transition_easing: 'linear',
      transition_direction: 'forward',
      voice_type: 'narrator',
      voice_emotion: 'neutral',
      voice_speed: 1,
      voice_pitch: 'auto',
      duration_seconds: 5,
      scene_pacing: 'normal',
      voiceover_speaker: 'narrator',
      location: 'INT. LOBBY - DAY',
      image_prompts: { characters: [], backgrounds: [] },
      audio_specs: [],
    },
  ],
  character_profiles: [
    {
      nama: 'Adrian',
      gayarambut: 'hitam pendek',
      wajah_asal: 'Asia',
      pakaian_atas: 'kemeja putih',
      pakaian_bawah: 'celana hitam',
      alas_kaki: 'sepatu hitam',
      deskripsi_latar: 'lobby mewah',
      aksi: 'berjalan',
      peran: 'utama',
    },
  ],
  image_prompts: {
    characters: [
      { target: 'Adrian', prompt_text: 'Young Asian man, white shirt, black pants...', reference_filename: null },
    ],
    backgrounds: [
      { target: 'Office Lobby', prompt_text: 'Luxury modern office lobby, marble floor, golden hour...', reference_filename: null },
    ],
  },
  supporting_characters: [],
};

describe('extractSheets', () => {
  it('extracts character and location sheets', () => {
    const sheets = extractSheets(mockPkg);
    expect(sheets.characterSheet).toHaveLength(1);
    expect(sheets.characterSheet[0]?.name).toBe('Adrian');
    expect(sheets.locationSheet).toHaveLength(1);
    expect(sheets.locationSheet[0]?.name).toBe('INT. LOBBY - DAY');
  });
});
