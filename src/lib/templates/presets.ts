/**
 * V3 Template Presets
 * Each preset provides default transition, voice, and audio configs
 * for different video styles.
 */

// --- Transition Config ---
export interface TransitionConfig {
  type: 'cut' | 'dissolve' | 'fade_to_black' | 'fade_to_white' | 'wipe' | 'match_cut';
  durationMs: number;
  easing: 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out';
  direction: 'forward' | 'backward' | 'loop';
}

// --- Voice Config ---
export interface VoiceConfig {
  type: 'child' | 'teen' | 'adult_male' | 'adult_female' | 'elderly_male' | 'elderly_female' | 'narrator';
  emotion: 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'dramatic';
  speed: number;
  pitch: 'low' | 'medium' | 'high' | 'auto';
}

// --- Audio Config ---
export interface AudioConfig {
  backgroundMusic?: {
    description: string;
    genre: string;
    mood: string;
    tempoBpm: number;
    instruments: string;
    volume: number;
  };
  ambient?: {
    description: string;
    ambientType: string;
    volume: number;
  };
}

// --- Preset Type ---
export interface TemplatePreset {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  transition: TransitionConfig;
  voice: VoiceConfig;
  audio: AudioConfig;
}

// --- Template Presets ---
export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'tutorial',
    name: 'Tutorial',
    nameEn: 'Tutorial',
    description: 'Gaya edukatif dengan transisi halus dan narasi jelas',
    descriptionEn: 'Educational style with smooth transitions and clear narration',
    transition: {
      type: 'dissolve',
      durationMs: 800,
      easing: 'ease_in_out',
      direction: 'forward',
    },
    voice: {
      type: 'narrator',
      emotion: 'calm',
      speed: 1.0,
      pitch: 'auto',
    },
    audio: {
      backgroundMusic: {
        description: 'Soft lo-fi background for learning',
        genre: 'lo-fi',
        mood: 'calm',
        tempoBpm: 80,
        instruments: 'piano, soft pads',
        volume: 0.3,
      },
      ambient: {
        description: 'Gentle classroom ambience',
        ambientType: 'classroom',
        volume: 0.15,
      },
    },
  },
  {
    id: 'cinematic',
    name: 'Sinematik',
    nameEn: 'Cinematic',
    description: 'Gaya film dengan transisi dramatis dan musik orkestra',
    descriptionEn: 'Film-style with dramatic transitions and orchestral music',
    transition: {
      type: 'fade_to_black',
      durationMs: 1500,
      easing: 'ease_in_out',
      direction: 'forward',
    },
    voice: {
      type: 'adult_male',
      emotion: 'dramatic',
      speed: 0.9,
      pitch: 'low',
    },
    audio: {
      backgroundMusic: {
        description: 'Epic orchestral score',
        genre: 'orchestral',
        mood: 'dramatic',
        tempoBpm: 100,
        instruments: 'strings, brass, percussion',
        volume: 0.6,
      },
      ambient: {
        description: 'Cinematic atmosphere with subtle wind',
        ambientType: 'cinematic',
        volume: 0.2,
      },
    },
  },
  {
    id: 'kids',
    name: 'Anak-anak',
    nameEn: 'Kids',
    description: 'Gaya ceria untuk anak-anak dengan transisi cepat dan musik riang',
    descriptionEn: 'Cheerful kids style with quick transitions and upbeat music',
    transition: {
      type: 'wipe',
      durationMs: 400,
      easing: 'ease_out',
      direction: 'forward',
    },
    voice: {
      type: 'child',
      emotion: 'excited',
      speed: 1.1,
      pitch: 'high',
    },
    audio: {
      backgroundMusic: {
        description: 'Playful children music with xylophone',
        genre: 'children',
        mood: 'cheerful',
        tempoBpm: 120,
        instruments: 'xylophone, ukulele, claps',
        volume: 0.5,
      },
      ambient: {
        description: 'Playful playground sounds',
        ambientType: 'playground',
        volume: 0.15,
      },
    },
  },
  {
    id: 'documentary',
    name: 'Dokumenter',
    nameEn: 'Documentary',
    description: 'Gaya dokumenter profesional dengan transisi bersih dan narasi netral',
    descriptionEn: 'Professional documentary style with clean transitions and neutral narration',
    transition: {
      type: 'cut',
      durationMs: 0,
      easing: 'linear',
      direction: 'forward',
    },
    voice: {
      type: 'narrator',
      emotion: 'neutral',
      speed: 1.0,
      pitch: 'medium',
    },
    audio: {
      backgroundMusic: {
        description: 'Subtle documentary underscore',
        genre: 'ambient',
        mood: 'peaceful',
        tempoBpm: 70,
        instruments: 'ambient pads, soft piano',
        volume: 0.25,
      },
      ambient: {
        description: 'Natural outdoor ambience',
        ambientType: 'nature',
        volume: 0.3,
      },
    },
  },
  {
    id: 'action',
    name: 'Aksi',
    nameEn: 'Action',
    description: 'Gaya aksi cepat dengan transisi tajam dan musik intens',
    descriptionEn: 'Fast-paced action style with sharp transitions and intense music',
    transition: {
      type: 'match_cut',
      durationMs: 200,
      easing: 'ease_in',
      direction: 'forward',
    },
    voice: {
      type: 'adult_male',
      emotion: 'excited',
      speed: 1.2,
      pitch: 'medium',
    },
    audio: {
      backgroundMusic: {
        description: 'High-energy electronic action beat',
        genre: 'electronic',
        mood: 'dramatic',
        tempoBpm: 140,
        instruments: 'synth, drums, bass',
        volume: 0.7,
      },
      ambient: {
        description: 'Tense atmosphere with subtle explosions',
        ambientType: 'tense',
        volume: 0.25,
      },
    },
  },
];

/**
 * Get preset by ID
 */
export function getPresetById(id: string): TemplatePreset | undefined {
  return TEMPLATE_PRESETS.find((p) => p.id === id);
}

/**
 * Get all preset IDs
 */
export function getPresetIds(): string[] {
  return TEMPLATE_PRESETS.map((p) => p.id);
}
