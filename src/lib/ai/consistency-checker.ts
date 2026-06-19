import 'server-only';
import type { PromptPackage } from '@/lib/validation/schemas';

export interface ConsistencyWarning {
  code: 'CONSISTENCY_MISMATCH';
  message: string;
  target?: string;
  scene?: number;
}

const IDENTITY_FIELDS = [
  'gayarambut',
  'wajah_asal',
  'pakaian_atas',
  'pakaian_bawah',
  'alas_kaki',
] as const;

export function checkConsistency(pkg: PromptPackage): ConsistencyWarning[] {
  const warnings: ConsistencyWarning[] = [];
  const profileByName = new Map(pkg.character_profiles.map((c) => [c.nama, c]));
  for (const scene of pkg.scenes) {
    for (const cp of scene.image_prompts.characters) {
      const profile = profileByName.get(cp.target);
      if (!profile) {
        warnings.push({
          code: 'CONSISTENCY_MISMATCH',
          message: `Karakter '${cp.target}' dirujuk di scene ${scene.order} tapi tidak ada di master character_profiles`,
          target: cp.target,
          scene: scene.order,
        });
      }
      // Check identity fields stability: prompt_text should contain key attributes
      // This is a heuristic; we do not parse prompt_text — we only warn when refs mismatch.
    }
  }
  return warnings;
}

export { IDENTITY_FIELDS };
