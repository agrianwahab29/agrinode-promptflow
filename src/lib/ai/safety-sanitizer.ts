import 'server-only';
import type { PromptPackage } from '@/lib/validation/schemas';

/**
 * Post-processing sanitizer untuk menghilangkan frasa usia eksplisit
 * yang dapat memicu safety filter pada video/image generator downstream.
 *
 * Mengganti: "anak X tahun", "usia X tahun", "X-year-old", dll.
 * dengan istilah netral yang aman.
 */

const AGE_PATTERNS: Array<{ regex: RegExp; replacement: string }> = [
  // Indonesia: "anak perempuan/laki-laki 9 tahun", "anak 10 tahun"
  { regex: /anak\s+(perempuan|laki-laki|kecil)\s+\d+\s+tahun/gi, replacement: 'petualang cilik' },
  { regex: /\banak\s+\d+\s+tahun\b/gi, replacement: 'petualang cilik' },
  { regex: /usia\s+\d+\s+tahun/gi, replacement: 'karakter muda' },
  { regex: /\bberusia\s+\d+\s+tahun\b/gi, replacement: 'muda' },
  // English: "9-year-old girl", "10-year-old boy"
  { regex: /\b\d+[-\s]?year[-\s]?old\s+(girl|boy|child|kid)\b/gi, replacement: 'young character' },
  { regex: /\b\d+[-\s]?year[-\s]?old\b/gi, replacement: 'young' },
  // Standalone "X tahun" when context suggests age (heuristic: preceded by character words)
  { regex: /(karakter|tokoh|anak|bocah|putra|putri)\s+\d+\s+tahun/gi, replacement: '$1 muda' },
];

// age_range hanya boleh kategori netral
const ALLOWED_AGE_RANGES = new Set(['young', 'teen', 'adult', 'elderly']);

function sanitizeText(text: string): string {
  let out = text;
  for (const { regex, replacement } of AGE_PATTERNS) {
    out = out.replace(regex, replacement);
  }
  return out;
}

function sanitizeAgeRange(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const lower = value.toLowerCase().trim();
  // Jika sudah kategori netral, biarkan
  if (ALLOWED_AGE_RANGES.has(lower)) return value;
  // Jika mengandung angka, map ke kategori
  if (/\d/.test(value)) {
    const num = parseInt(value, 10);
    if (num < 13) return 'young';
    if (num < 20) return 'teen';
    if (num < 50) return 'adult';
    return 'elderly';
  }
  return value;
}

export interface SanitizationReport {
  modified: boolean;
  changes: Array<{ field: string; target?: string; scene?: number; before: string; after: string }>;
}

/**
 * Sanitize PromptPackage in-place (mutates, returns report).
 * Jalankan SETELAH LLM merespons, SEBELUM Zod validation & DB save.
 */
export function sanitizePromptPackage(pkg: PromptPackage): SanitizationReport {
  const changes: SanitizationReport['changes'] = [];

  // 1. character_profiles.deskripsi_latar
  for (const c of pkg.character_profiles) {
    if (c.deskripsi_latar) {
      const before = c.deskripsi_latar;
      const after = sanitizeText(before);
      if (before !== after) {
        c.deskripsi_latar = after;
        changes.push({ field: 'deskripsi_latar', target: c.nama, before, after });
      }
    }
    // age_range
    const arBefore = c.age_range;
    const arAfter = sanitizeAgeRange(arBefore);
    if (arBefore !== arAfter) {
      c.age_range = arAfter;
      changes.push({ field: 'age_range', target: c.nama, before: arBefore ?? '', after: arAfter ?? '' });
    }
  }

  // 2. scenes[].description
  for (const s of pkg.scenes) {
    if (s.description) {
      const before = s.description;
      const after = sanitizeText(before);
      if (before !== after) {
        s.description = after;
        changes.push({ field: 'scene.description', scene: s.order, before, after });
      }
    }
    // scene image_prompts.characters[].prompt_text
    for (const cp of s.image_prompts.characters) {
      if (cp.prompt_text) {
        const before = cp.prompt_text;
        const after = sanitizeText(before);
        if (before !== after) {
          cp.prompt_text = after;
          changes.push({ field: 'scene.image_prompt.character', target: cp.target, scene: s.order, before, after });
        }
      }
    }
    // scene image_prompts.backgrounds[].prompt_text
    for (const bg of s.image_prompts.backgrounds) {
      if (bg.prompt_text) {
        const before = bg.prompt_text;
        const after = sanitizeText(before);
        if (before !== after) {
          bg.prompt_text = after;
          changes.push({ field: 'scene.image_prompt.background', target: bg.target, scene: s.order, before, after });
        }
      }
    }
  }

  // 3. root image_prompts
  for (const cp of pkg.image_prompts.characters) {
    if (cp.prompt_text) {
      const before = cp.prompt_text;
      const after = sanitizeText(before);
      if (before !== after) {
        cp.prompt_text = after;
        changes.push({ field: 'image_prompt.character', target: cp.target, before, after });
      }
    }
  }
  for (const bg of pkg.image_prompts.backgrounds) {
    if (bg.prompt_text) {
      const before = bg.prompt_text;
      const after = sanitizeText(before);
      if (before !== after) {
        bg.prompt_text = after;
        changes.push({ field: 'image_prompt.background', target: bg.target, before, after });
      }
    }
  }

  return { modified: changes.length > 0, changes };
}