import 'server-only';
import type { PromptPackage } from '@/lib/validation/schemas';

export function renderMarkdown(pkg: PromptPackage): string {
  const lines: string[] = [];
  lines.push(`# ${pkg.title}`);
  lines.push('');
  lines.push(`> **Durasi:** ${pkg.duration_target.type} (${pkg.duration_target.seconds}s)`);
  lines.push(`> **Style:** ${pkg.style.type}, rasio ${pkg.style.aspect_ratio}`);
  lines.push('');

  lines.push('## Profil Karakter');
  lines.push('');
  if (pkg.character_profiles.length === 0) {
    lines.push('_Tidak ada karakter._');
  } else {
    for (const c of pkg.character_profiles) {
      lines.push(`### ${c.nama} _(${c.peran})_`);
      lines.push(`- **Gaya rambut:** ${c.gayarambut}`);
      lines.push(`- **Wajah/asal:** ${c.wajah_asal}`);
      lines.push(`- **Pakaian atas:** ${c.pakaian_atas}`);
      lines.push(`- **Pakaian bawah:** ${c.pakaian_bawah}`);
      lines.push(`- **Alas kaki:** ${c.alas_kaki}`);
      lines.push(`- **Latar:** ${c.deskripsi_latar}`);
      lines.push(`- **Aksi:** ${c.aksi}`);
      lines.push('');
    }
  }

  lines.push('## Karakter Pendukung');
  lines.push('');
  if (pkg.supporting_characters.length === 0) {
    lines.push('_Tidak ada._');
  } else {
    for (const s of pkg.supporting_characters) {
      lines.push(`- **${s.nama}** _(${s.tipe})_: ${s.aksi}`);
    }
  }
  lines.push('');

  lines.push('## Adegan');
  lines.push('');
  for (const s of pkg.scenes) {
    lines.push(`### Scene ${s.order}`);
    lines.push(`**Deskripsi:** ${s.description}`);
    lines.push('');
    lines.push(`**Voiceover:**`);
    lines.push('');
    lines.push(`> ${s.voiceover_script}`);
    lines.push('');
    if (s.image_prompts.characters.length > 0) {
      lines.push(`**Image Prompt Tokoh:**`);
      for (const p of s.image_prompts.characters) {
        lines.push(`- _${p.target}_${p.reference_filename ? ` (ref: \`${p.reference_filename}\`)` : ''}: ${p.prompt_text}`);
      }
      lines.push('');
    }
    if (s.image_prompts.backgrounds.length > 0) {
      lines.push(`**Image Prompt Background:**`);
      for (const p of s.image_prompts.backgrounds) {
        lines.push(`- _${p.target}_${p.reference_filename ? ` (ref: \`${p.reference_filename}\`)` : ''}: ${p.prompt_text}`);
      }
      lines.push('');
    }
  }

  lines.push('## Image Prompt Master List');
  lines.push('');
  if (pkg.image_prompts.characters.length > 0) {
    lines.push('### Karakter');
    for (const p of pkg.image_prompts.characters) {
      lines.push(`- _${p.target}_${p.reference_filename ? ` (ref: \`${p.reference_filename}\`)` : ''}: ${p.prompt_text}`);
    }
    lines.push('');
  }
  if (pkg.image_prompts.backgrounds.length > 0) {
    lines.push('### Background');
    for (const p of pkg.image_prompts.backgrounds) {
      lines.push(`- _${p.target}_${p.reference_filename ? ` (ref: \`${p.reference_filename}\`)` : ''}: ${p.prompt_text}`);
    }
    lines.push('');
  }

  lines.push('## Pesan Moral');
  lines.push('');
  lines.push(`> ${pkg.moral_message}`);
  lines.push('');

  return lines.join('\n');
}