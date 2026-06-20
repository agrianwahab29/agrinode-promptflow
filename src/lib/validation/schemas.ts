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
  peran: z.enum(['utama', 'lain', 'pendamping']),
});

export const ImagePromptItemSchema = z.object({
  target: z.string(),
  prompt_text: z.string(),
  reference_filename: z.string().nullable(),
});

export const SceneImagePromptsSchema = z.object({
  characters: z.array(ImagePromptItemSchema),
  backgrounds: z.array(ImagePromptItemSchema),
});

export const SceneSchema = z.object({
  order: z.number(),
  description: z.string(),
  voiceover_script: z.string(),
  image_prompts: SceneImagePromptsSchema,
});

export const SupportingCharacterSchema = z.object({
  nama: z.string(),
  tipe: z.enum(['pendukung', 'hewan']),
  aksi: z.string(),
});

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
