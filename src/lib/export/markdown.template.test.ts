import { describe, it, expect } from 'vitest';
import { renderMarkdown } from './markdown.template';
import type { PromptPackage } from '@/lib/validation/schemas';

const sample: PromptPackage = {
  title: 'Petualangan Hutan',
  duration_target: { type: 'shorts', seconds: 60 },
  style: { type: '3D', aspect_ratio: '16:9' },
  character_profiles: [
    { nama: 'Hero', gayarambut: 'hitam', wajah_asal: 'ID', pakaian_atas: 'kaos', pakaian_bawah: 'celana', alas_kaki: 'sepatu', deskripsi_latar: 'desa', aksi: 'jalan', peran: 'utama' },
  ],
  scenes: [
    { order: 1, description: 'Hero jalan', voiceover_script: 'Mulai!', image_prompts: { characters: [{ target: 'Hero', prompt_text: '3D Hero jalan', reference_filename: null }], backgrounds: [{ target: 'Hutan', prompt_text: '3D forest', reference_filename: null }] } },
  ],
  image_prompts: {
    characters: [{ target: 'Hero', prompt_text: '3D Hero portrait', reference_filename: null }],
    backgrounds: [{ target: 'Hutan', prompt_text: '3D forest', reference_filename: null }],
  },
  supporting_characters: [{ nama: 'Kancil', tipe: 'hewan', aksi: 'melompat' }],
  moral_message: 'Jaga alam.',
};

describe('renderMarkdown', () => {
  it('produces deterministic markdown', () => {
    const md = renderMarkdown(sample);
    expect(md).toContain('# Petualangan Hutan');
    expect(md).toContain('## Profil Karakter');
    expect(md).toContain('### Hero');
    expect(md).toContain('## Adegan');
    expect(md).toContain('### Scene 1');
    expect(md).toContain('## Pesan Moral');
    expect(md).toContain('> Jaga alam.');
  });

  it('handles empty character profiles', () => {
    const md = renderMarkdown({ ...sample, character_profiles: [] });
    expect(md).toContain('Tidak ada karakter');
  });

  it('renders reference_filename when present', () => {
    const md = renderMarkdown({
      ...sample,
      image_prompts: { characters: [{ target: 'Hero', prompt_text: 'p', reference_filename: 'hero.png' }], backgrounds: [] },
    });
    expect(md).toContain('ref: `hero.png`');
  });
});