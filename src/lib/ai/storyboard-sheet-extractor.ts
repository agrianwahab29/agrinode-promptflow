import type { PromptPackage } from '@/lib/validation/schemas';

export interface CharacterSheetEntry {
  name: string;
  visualDescription: string;
  referenceImagePrompt?: string;
}

export interface LocationSheetEntry {
  name: string;
  visualDescription: string;
  referenceImagePrompt?: string;
}

export interface VisualStyleGuide {
  aspectRatio: string;
  artDirection: string;
  colorPalette: string;
  cinematography: string;
}

export interface StoryboardSheets {
  characterSheet: CharacterSheetEntry[];
  locationSheet: LocationSheetEntry[];
  visualStyle: VisualStyleGuide;
}

export function extractSheets(pkg: PromptPackage): StoryboardSheets {
  const characterMap = new Map<string, CharacterSheetEntry>();

  for (const c of pkg.character_profiles) {
    const desc = `${c.nama}: ${c.wajah_asal} ethnicity, ${c.gayarambut} hair, wearing ${c.pakaian_atas} and ${c.pakaian_bawah}, ${c.alas_kaki}, ${c.aksi}, ${c.deskripsi_latar}`;
    const imgPrompt = pkg.image_prompts.characters.find((p) => p.target.toLowerCase() === c.nama.toLowerCase())?.prompt_text;
    characterMap.set(c.nama.toLowerCase(), {
      name: c.nama,
      visualDescription: desc,
      referenceImagePrompt: imgPrompt,
    });
  }

  const locationMap = new Map<string, LocationSheetEntry>();
  for (const s of pkg.scenes) {
    if (!s.location) continue;
    const loc = s.location as string;
    const key = loc.toLowerCase();
    if (locationMap.has(key)) continue;
    const imgPrompt = pkg.image_prompts.backgrounds.find((p) => loc.toLowerCase().includes(p.target.toLowerCase()) || p.target.toLowerCase().includes(loc.toLowerCase()))?.prompt_text;
    locationMap.set(key, {
      name: loc,
      visualDescription: `${loc}: ${s.description ?? ''}`.trim(),
      referenceImagePrompt: imgPrompt,
    });
  }

  return {
    characterSheet: Array.from(characterMap.values()),
    locationSheet: Array.from(locationMap.values()),
    visualStyle: {
      aspectRatio: pkg.style.aspect_ratio ?? '16:9',
      artDirection: `${pkg.style.type} animation style`,
      colorPalette: extractColorPalette(pkg),
      cinematography: inferCinematography(pkg),
    },
  };
}

function extractColorPalette(pkg: PromptPackage): string {
  const palettes = pkg.image_prompts.backgrounds
    .map((p) => {
      if (Array.isArray(p.color_palette)) return p.color_palette.join(', ');
      return p.color_palette;
    })
    .filter(Boolean) as string[];
  if (palettes.length > 0) return palettes.join('; ');
  return 'neutral cinematic palette';
}

function inferCinematography(pkg: PromptPackage): string {
  const cameras = pkg.image_prompts.backgrounds
    .map((p) => p.camera)
    .filter(Boolean) as string[];
  return cameras.length > 0 ? cameras.join('; ') : 'mixed wide shots and close-ups, smooth camera movements';
}
