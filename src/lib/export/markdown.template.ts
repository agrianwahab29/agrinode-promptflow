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

  // V3: Scene Transitions
  lines.push('## Scene Transitions');
  lines.push('');
  for (const s of pkg.scenes) {
    const dur = s.transition_duration_ms ?? 0;
    const durLabel = dur === 0 ? 'instant' : `${dur}ms`;
    lines.push(`- **Scene ${s.order}:** ${s.transition_type} (${durLabel}, ${s.transition_easing}, ${s.transition_direction})`);
  }
  lines.push('');

  // V3: Voice Specifications
  lines.push('## Voice Specifications');
  lines.push('');
  for (const s of pkg.scenes) {
    const spd = s.voice_speed ?? 1.0;
    lines.push(`- **Scene ${s.order}:** ${s.voice_type} — ${s.voice_emotion}, speed ${spd}x, pitch ${s.voice_pitch}`);
  }
  lines.push('');

  // V3: Audio Specifications (from scene-level hints or empty)
  lines.push('## Audio Specifications');
  lines.push('');
  lines.push('_Audio specifications are managed via the audio panel UI._');
  lines.push('');

  // V3: Image Prompt Layers
  lines.push('## Image Prompt Layers');
  lines.push('');
  for (const s of pkg.scenes) {
    const allPrompts = [...s.image_prompts.characters, ...s.image_prompts.backgrounds];
    for (const p of allPrompts) {
      const layers: string[] = [];
      if (p.composition) layers.push(`Composition: ${p.composition}`);
      if (p.lighting) layers.push(`Lighting: ${p.lighting}`);
      if (p.camera) layers.push(`Camera: ${p.camera}`);
      if (p.mood_atmosphere) layers.push(`Mood: ${p.mood_atmosphere}`);
      if (p.style_references) layers.push(`Style: ${p.style_references}`);
      if (layers.length > 0) {
        lines.push(`- **Scene ${s.order} — ${p.target}:**`);
        for (const l of layers) {
          lines.push(`  - ${l}`);
        }
      }
    }
  }
  lines.push('');

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