/**
 * Pre-Zod normalizer untuk output LLM mentah.
 * Model sering kirim nilai null/undefined/unknown-enum yang bikin Zod strict gagal.
 * Normalizer koersi data ke bentuk ramah-schema SEBELUM validasi ketat.
 */

const VOICE_TYPE_ENUM = ['child', 'teen', 'adult_male', 'adult_female', 'elderly_male', 'elderly_female', 'narrator'] as const;
type VoiceTypeEnum = (typeof VOICE_TYPE_ENUM)[number];

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function toStringOrEmpty(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  // array/object → JSON string fallback (jarang terjadi)
  try { return JSON.stringify(v); } catch { return ''; }
}

function toStringOrNull(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.join(', ');
  try { return JSON.stringify(v); } catch { return null; }
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function coerceVoiceType(v: unknown): VoiceTypeEnum | undefined {
  if (v === null || v === undefined) return undefined;
  if (typeof v !== 'string') return undefined;
  const lower = v.trim().toLowerCase();
  if ((VOICE_TYPE_ENUM as readonly string[]).includes(lower)) return lower as VoiceTypeEnum;
  // Heuristik umum: silent→narrator, unknown→narrator
  const synonyms: Record<string, VoiceTypeEnum> = {
    silent: 'narrator',
    none: 'narrator',
    default: 'narrator',
    unknown: 'narrator',
    boy: 'child',
    girl: 'child',
    kid: 'child',
    man: 'adult_male',
    woman: 'adult_female',
    male: 'adult_male',
    female: 'adult_female',
    old_man: 'elderly_male',
    old_woman: 'elderly_female',
    grandfather: 'elderly_male',
    grandmother: 'elderly_female',
  };
  if (synonyms[lower]) return synonyms[lower];
  // Fallback narrator
  return 'narrator';
}

function normalizeImagePromptItem(item: unknown): unknown {
  if (!isObject(item)) return item;
  const out: Record<string, unknown> = { ...item };
  // color_palette bisa array atau string, biarkan Zod handle union
  // reference_filename null OK
  return out;
}

function normalizeImagePrompts(ip: unknown): unknown {
  if (!isObject(ip)) return ip;
  const out: Record<string, unknown> = { ...ip };
  if (Array.isArray(out.characters)) out.characters = out.characters.map(normalizeImagePromptItem);
  if (Array.isArray(out.backgrounds)) out.backgrounds = out.backgrounds.map(normalizeImagePromptItem);
  return out;
}

function normalizeAudioSpec(spec: unknown): unknown {
  if (!isObject(spec)) return spec;
  const out: Record<string, unknown> = { ...spec };
  // sfx_list: array → join string untuk DB text column
  if (Array.isArray(out.sfx_list)) out.sfx_list = (out.sfx_list as unknown[]).join(', ');
  else if (out.sfx_list !== undefined && out.sfx_list !== null) {
    out.sfx_list = toStringOrNull(out.sfx_list);
  }
  return out;
}

function normalizeScene(scene: unknown): unknown {
  if (!isObject(scene)) return scene;
  const out: Record<string, unknown> = { ...scene };

  // voiceover_script: null → '' (Zod butuh string)
  out.voiceover_script = toStringOrEmpty(out.voiceover_script);
  // voiceover_speaker: null → 'narrator'
  if (out.voiceover_speaker === null || out.voiceover_speaker === undefined || out.voiceover_speaker === '') {
    out.voiceover_speaker = 'narrator';
  } else {
    out.voiceover_speaker = toStringOrEmpty(out.voiceover_speaker) || 'narrator';
  }

  // voice_type (scene-level): coerce ke enum
  out.voice_type = coerceVoiceType(out.voice_type) ?? 'narrator';

  // voice_speed number coerce
  const speed = toNumber(out.voice_speed);
  if (speed !== null) out.voice_speed = Math.max(0.5, Math.min(2.0, speed));

  // audio_specs
  if (Array.isArray(out.audio_specs)) {
    out.audio_specs = out.audio_specs.map(normalizeAudioSpec);
  }

  // image_prompts (scene-level bisa juga ada)
  if (out.image_prompts !== undefined) {
    out.image_prompts = normalizeImagePrompts(out.image_prompts);
  }

  return out;
}

function normalizeCharacterProfile(cp: unknown): unknown {
  if (!isObject(cp)) return cp;
  const out: Record<string, unknown> = { ...cp };
  // voice_type: coerce ke enum
  const v = coerceVoiceType(out.voice_type);
  if (v !== undefined) out.voice_type = v;
  else delete out.voice_type; // optional, biarkan Zod skip
  // String fields null → ''
  for (const k of ['nama', 'gayarambut', 'wajah_asal', 'pakaian_atas', 'pakaian_bawah', 'alas_kaki', 'deskripsi_latar', 'aksi', 'peran']) {
    out[k] = toStringOrEmpty(out[k]);
  }
  return out;
}

/**
 * Normalize raw LLM output sebelum Zod parse.
 * Tidak throw — kirim data ramah-schema, biarkan Zod yang validasi struktur.
 */
export function normalizePromptPackage(raw: unknown): unknown {
  if (!isObject(raw)) return raw;
  const out: Record<string, unknown> = { ...raw };

  if (Array.isArray(out.character_profiles)) {
    out.character_profiles = out.character_profiles.map(normalizeCharacterProfile);
  }
  if (Array.isArray(out.scenes)) {
    out.scenes = out.scenes.map(normalizeScene);
  }
  if (out.image_prompts !== undefined) {
    out.image_prompts = normalizeImagePrompts(out.image_prompts);
  }

  // supporting_characters null → []
  if (out.supporting_characters === null || out.supporting_characters === undefined) {
    out.supporting_characters = [];
  }

  return out;
}