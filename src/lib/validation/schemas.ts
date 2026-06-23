import { z } from 'zod';

// ===== LLM Output Schema (PRD §8.2) =====
export const CharacterProfileSchema = z.object({
  nama: z.string(),
  gayarambut: z.string(),
  wajah_asal: z.string(),
  pakaian_atas: z.string(),
  pakaian_bawah: z.string(),
  alas_kaki: z.string(),
  deskripsi_latar: z.string(),
  aksi: z.string(),
  peran: z.string(),
  // V3: voice assignment — toleran terhadap nilai unknown (normalizer sudah coerce)
  voice_type: z.enum(['child', 'teen', 'adult_male', 'adult_female', 'elderly_male', 'elderly_female', 'narrator']).catch('narrator').optional(),
  age_range: z.string().optional(),
});

export const ImagePromptItemSchema = z.object({
  target: z.string(),
  prompt_text: z.string(),
  reference_filename: z.string().nullable(),
  // V3: 8-layer structure
  composition: z.string().nullable().optional(),
  lighting: z.string().nullable().optional(),
  camera: z.string().nullable().optional(),
  mood_atmosphere: z.string().nullable().optional(),
  style_references: z.string().nullable().optional(),
  color_palette: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  technical: z.string().nullable().optional(),
});

export const SceneImagePromptsSchema = z.object({
  characters: z.array(ImagePromptItemSchema),
  backgrounds: z.array(ImagePromptItemSchema),
});

// V3: Scene audio spec (embedded in scene, not DB table)
export const SceneAudioSpecSchema = z.object({
  audio_type: z.string().default('ambient'),
  description: z.string().min(1),
  timing: z.string().default('throughout'),
  duration_seconds: z.number().nullable().optional(),
  volume: z.number().min(0).max(1).default(0.5),
  fade_in_ms: z.number().min(0).default(0),
  fade_out_ms: z.number().min(0).default(0),
  music_genre: z.string().nullable().optional(),
  music_mood: z.string().nullable().optional(),
  music_tempo_bpm: z.number().nullable().optional(),
  music_instruments: z.string().nullable().optional(),
  music_volume: z.number().min(0).max(1).default(0.5),
  sfx_list: z.union([z.string(), z.array(z.string())]).nullable().optional(),
  ambient_type: z.string().nullable().optional(),
  ambient_volume: z.number().min(0).max(1).default(0.4),
});

export const SceneSchema = z.object({
  order: z.number(),
  description: z.string(),
  // LLM kadang kirim null → normalizer coerce ke '', Zod terima
  voiceover_script: z.string().catch(''),
  voiceover_speaker: z.string().catch('narrator').default('narrator'),
  image_prompts: SceneImagePromptsSchema,
  audio_specs: z.array(SceneAudioSpecSchema).optional(),
  transition_type: z.string().catch('dissolve').default('dissolve'),
  transition_duration_ms: z.number().min(0).catch(1500).default(1500),
  transition_easing: z.string().catch('ease_in_out').default('ease_in_out'),
  transition_direction: z.string().catch('forward').default('forward'),
  // Scene voice_type string longgar (model kadang kirim nilai kreatif)
  voice_type: z.string().catch('narrator').default('narrator'),
  voice_emotion: z.string().catch('neutral').default('neutral'),
  voice_speed: z.number().catch(1.0).default(1.0),
  voice_pitch: z.string().catch('auto').default('auto'),
  duration_seconds: z.number().nullable().optional(),
  scene_pacing: z.string().catch('normal').default('normal'),
  scene_mood: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
});

export const SupportingCharacterSchema = z.object({
  nama: z.string(),
  tipe: z.string(),
  aksi: z.string(),
});

export const SceneAudioSchema = z.object({
  audio_type: z.enum(['background_music', 'sfx', 'ambient', 'music_cue', 'transition_audio']),
  description: z.string().min(1),
  timing: z.enum(['start', 'throughout', 'end', 'specific_moment']).default('throughout'),
  duration_seconds: z.number().nullable().optional(),
  volume: z.number().min(0).max(1).default(0.5),
  fade_in_ms: z.number().min(0).default(0),
  fade_out_ms: z.number().min(0).default(0),
  music_genre: z.string().nullable().optional(),
  music_mood: z.string().nullable().optional(),
  music_tempo_bpm: z.number().min(60).max(200).nullable().optional(),
  music_instruments: z.string().nullable().optional(),
  music_volume: z.number().min(0).max(1).default(0.7),
  sfx_list: z.string().nullable().optional(),
  ambient_type: z.string().nullable().optional(),
  ambient_volume: z.number().min(0).max(1).default(0.5),
});

export type SceneAudioType = z.infer<typeof SceneAudioSchema>;

export const ThemePreferenceSchema = z.enum(['dark', 'light', 'system']).default('dark');
export type ThemePreference = z.infer<typeof ThemePreferenceSchema>;

export const PromptPackageSchema = z.object({
  title: z.string(),
  duration_target: z.object({
    type: z.enum(['shorts', 'tutorial']),
    seconds: z.number(),
  }),
  style: z.object({
    type: z.enum(['3D', '2D']),
    aspect_ratio: z.string(),
  }),
  character_profiles: z.array(CharacterProfileSchema),
  scenes: z.array(SceneSchema),
  image_prompts: z.object({
    characters: z.array(ImagePromptItemSchema),
    backgrounds: z.array(ImagePromptItemSchema),
  }),
  supporting_characters: z.array(SupportingCharacterSchema),
  moral_message: z.string(),
});

export type PromptPackage = z.infer<typeof PromptPackageSchema>;

// ===== Input Schemas =====
export const TitleSchema = z.string().min(3).max(200).trim();

export const DurationSchema = z.object({
  durationType: z.enum(['shorts', 'tutorial']),
  durationTargetSeconds: z.number().int().positive(),
});

export const StyleSchema = z.object({
  styleType: z.enum(['3D', '2D']),
  aspectRatio: z.string().min(1).max(20),
});

const CreateProjectInputBaseSchema = z.object({
  title: TitleSchema,
  durationType: z.enum(['shorts', 'tutorial']),
  durationTargetSeconds: z.number().int().positive(),
  styleType: z.enum(['3D', '2D']),
  aspectRatio: z.string().min(1).max(20),
});

export const CreateProjectInputSchema = CreateProjectInputBaseSchema.refine(
  (d) => d.durationType !== 'shorts' || d.durationTargetSeconds <= 180,
  { message: 'Shorts maksimal 180 detik', path: ['durationTargetSeconds'] },
).refine(
  (d) => d.durationType !== 'tutorial' || (d.durationTargetSeconds >= 420 && d.durationTargetSeconds <= 900),
  { message: 'Tutorial ideal 420-900 detik (7-15 menit)', path: ['durationTargetSeconds'] },
);

export const UpdateProjectInputSchema = CreateProjectInputBaseSchema.partial();

export const ProviderEnum = z.enum(['ollama', 'openrouter', '9router', 'custom']);

export const CreateProviderConfigInputSchema = z.object({
  provider: ProviderEnum,
  name: z.string().min(1).max(100),
  baseUrl: z.string().url(),
  model: z.string().min(1),
  apiKey: z.string().min(1),
  isActive: z.number().int().min(0).max(1).optional(),
});

export const UpdateProviderConfigInputSchema = CreateProviderConfigInputSchema.partial().omit({ provider: true });

// V2: 6-tipe role classification
export const AssetRoleEnum = z.enum(['tokoh', 'background', 'prop', 'accessory', 'environment', 'other']);
export type AssetRole = z.infer<typeof AssetRoleEnum>;

export const GenerateReferenceSchema = z.object({
  name: z.string().min(1),
  type: AssetRoleEnum,
});

export const GenerateInputSchema = z.object({
  projectId: z.number().int().positive().optional(),
  input: z.object({
    title: TitleSchema,
    durationTarget: z.object({
      type: z.enum(['shorts', 'tutorial']),
      seconds: z.number().int().positive(),
    }).refine(
      (d) => d.type !== 'shorts' || d.seconds <= 180,
      { message: 'Shorts maksimal 180 detik', path: ['seconds'] },
    ),
    style: z.object({
      type: z.enum(['3D', '2D']),
      ratio: z.string(),
    }),
    providerId: z.number().int().positive().optional(),
    references: z.array(GenerateReferenceSchema).optional(),
    storyDescription: z.string().max(500).optional(), // V2: optional story context
  }),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
export type CreateProviderConfigInput = z.infer<typeof CreateProviderConfigInputSchema>;
export type UpdateProviderConfigInput = z.infer<typeof UpdateProviderConfigInputSchema>;
export type GenerateInput = z.infer<typeof GenerateInputSchema>;

// ===== Storyboard schemas (F-SB-01) =====
// Rich Indonesian storyboard panel matching professional storyboard format.
export const StoryboardPanelSchema = z.object({
  index: z.number().int().min(1),
  time: z.string().min(1),
  sceneCode: z.string().min(1),
  title: z.string().min(1),
  // Image prompt stays in English because image/video generators understand English best.
  imagePrompt: z.string().min(1),
  // Reference thumbnail prompt (English) used as visual reference for the panel.
  referenceImagePrompt: z.string().optional(),
  actionVisual: z.string().min(1),
  cameraMovement: z.string().min(1),
  composition: z.string().optional(),
  lighting: z.string().optional(),
  mood: z.string().optional(),
  dialogueVo: z.string(),
  onScreenText: z.string().optional(),
  transition: z.string().min(1),
  charactersPresent: z.array(z.string()),
  location: z.string().min(1),
  props: z.array(z.string()).optional(),
  costumeNotes: z.string().optional(),
  negativePrompt: z.string().optional(),
  audioNotes: z.string().optional(),
  productionNotes: z.string().optional(),
  durationSeconds: z.number().min(0.1).optional(),
});

// Storyboard LLM Stage 1 output: outline panels per 10-second segment
export const StoryboardOutlinePanelSchema = z.object({
  index: z.number().int().min(1),
  time: z.string().min(1),
  scene_code: z.string().min(1),
  title: z.string().min(1),
  characters_present: z.array(z.string()),
  location: z.string().min(1),
  transition: z.string().min(1),
  brief: z.string().min(1),
  duration_seconds: z.number().min(0.1).optional(),
});

export const StoryboardOutlineSchema = z.object({
  panel_count: z.number().int().min(1),
  panels: z.array(StoryboardOutlinePanelSchema).min(1),
  segment_transition_note: z.string().min(1),
});

// Storyboard LLM Stage 2 output: detailed panel prompts
export const StoryboardDetailedPanelSchema = z.object({
  index: z.number().int().min(1),
  time: z.string().min(1),
  scene_code: z.string().min(1),
  title: z.string().min(1),
  imagePrompt: z.string().min(1),
  referenceImagePrompt: z.string().optional(),
  actionVisual: z.string().min(1),
  cameraMovement: z.string().min(1),
  composition: z.string().optional(),
  lighting: z.string().optional(),
  mood: z.string().optional(),
  dialogueVo: z.string(),
  onScreenText: z.string().optional(),
  transition: z.string().min(1),
  charactersPresent: z.array(z.string()),
  location: z.string().min(1),
  props: z.array(z.string()).optional(),
  costumeNotes: z.string().optional(),
  negativePrompt: z.string().optional(),
  audioNotes: z.string().optional(),
  productionNotes: z.string().optional(),
  durationSeconds: z.number().min(0.1).optional(),
});

export const StoryboardPanelsSchema = z.object({
  panels: z.array(StoryboardDetailedPanelSchema).min(1),
  segmentTransitionNote: z.string().min(1),
});

export const StoryboardSegmentSchema = z.object({
  segmentIndex: z.number().int().min(1),
  segmentTimeStart: z.number().int().min(0),
  segmentTimeEnd: z.number().int().min(1),
  durationSeconds: z.number().int().min(1),
  panelCount: z.number().int().min(1),
  visualStyle: z.object({
    aspectRatio: z.string().min(1),
    artDirection: z.string().min(1),
    colorPalette: z.string().min(1),
    cinematography: z.string().min(1),
  }),
  characterSheet: z.array(z.object({
    name: z.string().min(1),
    visualDescription: z.string().min(1),
    referenceImagePrompt: z.string().optional(),
  })),
  locationSheet: z.array(z.object({
    name: z.string().min(1),
    visualDescription: z.string().min(1),
    referenceImagePrompt: z.string().optional(),
  })),
  panels: z.array(StoryboardPanelSchema).min(1),
  segmentTransitionNote: z.string().min(1),
  compiledMarkdownPrompt: z.string().min(1),
});

export type StoryboardPanel = z.infer<typeof StoryboardPanelSchema>;
export type StoryboardOutlinePanel = z.infer<typeof StoryboardOutlinePanelSchema>;
export type StoryboardOutline = z.infer<typeof StoryboardOutlineSchema>;
export type StoryboardDetailedPanel = z.infer<typeof StoryboardDetailedPanelSchema>;
export type StoryboardPanels = z.infer<typeof StoryboardPanelsSchema>;
export type StoryboardSegment = z.infer<typeof StoryboardSegmentSchema>;

// ===== DTO Types =====
export type ProjectDTO = {
  id: number;
  userId: number;
  title: string;
  durationType: 'shorts' | 'tutorial';
  durationTargetSeconds: number;
  styleType: '3D' | '2D';
  aspectRatio: string;
  status: 'draft' | 'generating' | 'complete' | 'failed';
  resultJson: unknown | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProviderConfigDTO = {
  id: number;
  userId: number;
  provider: 'ollama' | 'openrouter' | '9router' | 'custom';
  name: string;
  baseUrl: string;
  model: string;
  apiKeyMasked: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export const ErrorCodeEnum = z.enum([
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'PROVIDER_ERROR',
  'TIMEOUT',
  'INTERNAL',
  'BAD_GATEWAY',
  'SERVICE_UNAVAILABLE',
]);

// ===== V2: AI Classification Schema =====
export const ClassificationResultSchema = z.object({
  role: AssetRoleEnum,
  label: z.string(),
  confidence: z.number().min(0).max(1),
  description: z.string().optional(),
});

export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;

// ===== V2: SSE Log Entry Schema =====
export const SseLogEntrySchema = z.object({
  level: z.enum(['info', 'warn', 'error']),
  message: z.string(),
  timestamp: z.number(),
});

export type SseLogEntry = z.infer<typeof SseLogEntrySchema>;
