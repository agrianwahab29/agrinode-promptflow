import { sql } from 'drizzle-orm';
import { integer, text, real, sqliteTable, uniqueIndex, index } from 'drizzle-orm/sqlite-core';

// users
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name'),
  passwordHash: text('password_hash').notNull(),
  image: text('image'),
  role: text('role').notNull().default('user'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`).notNull(),
});

// provider_configs
export const providerConfigs = sqliteTable('provider_configs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  name: text('name').notNull(),
  baseUrl: text('base_url').notNull(),
  model: text('model').notNull(),
  apiKeyEncrypted: text('api_key_encrypted'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  userIdx: uniqueIndex('idx_provider_configs_user_name').on(t.userId, t.name),
}));

// projects
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  durationType: text('duration_type').notNull(),
  durationTargetSeconds: integer('duration_target_seconds').notNull(),
  styleType: text('style_type').notNull(),
  aspectRatio: text('aspect_ratio').notNull(),
  resultJson: text('result_json'),
  status: text('status').notNull().default('draft'),
  storyDescription: text('story_description'), // V2: optional story description (max 500 char)
  themePreference: text('theme_preference').default('dark'), // V3: UI theme preference (dark/light/system)
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`).notNull(),
  deletedAt: integer('deleted_at'),
}, (t) => ({
  userIdx: index('idx_projects_user_id').on(t.userId),
  userCreatedIdx: index('idx_projects_user_created').on(t.userId, t.createdAt),
}));

// asset_references
export const assetReferences = sqliteTable('asset_references', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  tipe: text('tipe').notNull(),
  filename: text('filename').notNull(),
  blobUrl: text('blob_url').notNull(),
  label: text('label'),
  mimeType: text('mime_type'),
  sizeBytes: integer('size_bytes'),
  aiClassification: text('ai_classification'), // V2: JSON result from Vision LLM classification
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_asset_refs_project_id').on(t.projectId),
  projectTipeIdx: index('idx_asset_refs_project_tipe').on(t.projectId, t.tipe),
}));

// characters
export const characters = sqliteTable('characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  nama: text('nama').notNull(),
  gayarambut: text('gayarambut').notNull(),
  wajahAsal: text('wajah_asal').notNull(),
  pakaianAtas: text('pakaian_atas').notNull(),
  pakaianBawah: text('pakaian_bawah').notNull(),
  alasKaki: text('alas_kaki').notNull(),
  deskripsiLatar: text('deskripsi_latar').notNull(),
  aksi: text('aksi').notNull(),
  peran: text('peran').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_characters_project_id').on(t.projectId),
  projectNamaIdx: uniqueIndex('idx_characters_project_nama').on(t.projectId, t.nama),
}));

// scenes
export const scenes = sqliteTable('scenes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  orderNo: integer('order_no').notNull(),
  description: text('description').notNull(),
  voiceoverScript: text('voiceover_script').notNull(),
  // V3: Transition (F-V3-02)
  transitionType: text('transition_type').notNull().default('cut'),
  transitionDurationMs: integer('transition_duration_ms').notNull().default(0),
  transitionEasing: text('transition_easing').notNull().default('linear'),
  transitionDirection: text('transition_direction').notNull().default('forward'),
  // V3: Voice (F-V3-04)
  voiceType: text('voice_type').notNull().default('narrator'),
  voiceEmotion: text('voice_emotion').notNull().default('neutral'),
  voiceSpeed: real('voice_speed').notNull().default(1.0),
  voicePitch: text('voice_pitch').notNull().default('auto'),
  // V3: Duration (F-V3-05)
  durationSeconds: integer('duration_seconds'),
  // V3: Pacing & Mood (ASUMSI)
  scenePacing: text('scene_pacing').notNull().default('normal'),
  sceneMood: text('scene_mood'),
  // V3: Voiceover speaker (who is speaking in this scene)
  voiceoverSpeaker: text('voiceover_speaker').notNull().default('narrator'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_scenes_project_id').on(t.projectId),
  projectOrderIdx: uniqueIndex('idx_scenes_project_order').on(t.projectId, t.orderNo),
}));

// image_prompts
export const imagePrompts = sqliteTable('image_prompts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sceneId: integer('scene_id').references(() => scenes.id, { onDelete: 'cascade' }),
  tipe: text('tipe').notNull(),
  target: text('target').notNull(),
  promptText: text('prompt_text').notNull(),
  referenceFilename: text('reference_filename'),
  // V3: Structured Layers — ASUMSI
  composition: text('composition'),
  lighting: text('lighting'),
  camera: text('camera'),
  // V3: Metadata — SRS S4.4, PRD S7.2
  moodAtmosphere: text('mood_atmosphere'),
  styleReferences: text('style_references'),
  // V3: Additional layers (8-layer completeness)
  colorPalette: text('color_palette'),
  technical: text('technical'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_image_prompts_project_id').on(t.projectId),
  sceneIdx: index('idx_image_prompts_scene_id').on(t.sceneId),
  projectTipeIdx: index('idx_image_prompts_project_tipe').on(t.projectId, t.tipe),
  projectSceneIdx: index('idx_image_prompts_project_scene').on(t.projectId, t.sceneId),
}));

// generation_logs
export const generationLogs = sqliteTable('generation_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  durationMs: integer('duration_ms'),
  status: text('status').notNull(),
  errorMessage: text('error_message'),
  logsJson: text('logs_json'), // V2: JSON array of real-time processing logs
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_gen_logs_project_id').on(t.projectId),
  projectCreatedIdx: index('idx_gen_logs_project_created').on(t.projectId, t.createdAt),
}));

// supporting_characters
export const supportingCharacters = sqliteTable('supporting_characters', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sceneId: integer('scene_id').references(() => scenes.id, { onDelete: 'set null' }),
  nama: text('nama').notNull(),
  tipe: text('tipe').notNull(),
  aksi: text('aksi').notNull(),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_supporting_chars_project_id').on(t.projectId),
  sceneIdx: index('idx_supporting_chars_scene_id').on(t.sceneId),
}));

// scene_audio — V3 NEW table
export const sceneAudio = sqliteTable('scene_audio', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sceneId: integer('scene_id').notNull().references(() => scenes.id, { onDelete: 'cascade' }),
  audioType: text('audio_type').notNull(),
  description: text('description').notNull(),
  timing: text('timing').notNull().default('throughout'),
  durationSeconds: integer('duration_seconds'),
  volume: real('volume').notNull().default(0.7),
  fadeInMs: integer('fade_in_ms').notNull().default(0),
  fadeOutMs: integer('fade_out_ms').notNull().default(0),
  musicGenre: text('music_genre'),
  musicMood: text('music_mood'),
  musicTempoBpm: integer('music_tempo_bpm'),
  musicInstruments: text('music_instruments'),
  musicVolume: real('music_volume').default(0.7),
  sfxList: text('sfx_list'),
  ambientType: text('ambient_type'),
  ambientVolume: real('ambient_volume').default(0.5),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_scene_audio_project_id').on(t.projectId),
  sceneIdx: index('idx_scene_audio_scene_id').on(t.sceneId),
  projectSceneIdx: index('idx_scene_audio_project_scene').on(t.projectId, t.sceneId),
}));

// storyboard_segments — F-SB-01
export const storyboardSegments = sqliteTable('storyboard_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  segmentIndex: integer('segment_index').notNull(),
  segmentTimeStart: integer('segment_time_start').notNull(),
  segmentTimeEnd: integer('segment_time_end').notNull(),
  panelCount: integer('panel_count').notNull(),
  visualStyleJson: text('visual_style_json').notNull(),
  characterSheetJson: text('character_sheet_json').notNull(),
  locationSheetJson: text('location_sheet_json').notNull(),
  panelsJson: text('panels_json').notNull(),
  markdownPrompt: text('markdown_prompt').notNull(),
  segmentTransitionNote: text('segment_transition_note'),
  provider: text('provider').notNull(),
  model: text('model').notNull(),
  status: text('status').notNull().default('draft'),
  createdAt: integer('created_at').default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at').default(sql`(unixepoch())`).notNull(),
}, (t) => ({
  projectIdx: index('idx_storyboard_segments_project_id').on(t.projectId),
  projectSegmentIdx: uniqueIndex('idx_storyboard_segments_project_segment').on(t.projectId, t.segmentIndex),
}));

// Inferred types — use everywhere instead of duplicating interfaces (CR §4.6)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ProviderConfig = typeof providerConfigs.$inferSelect;
export type NewProviderConfig = typeof providerConfigs.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type AssetReference = typeof assetReferences.$inferSelect;
export type NewAssetReference = typeof assetReferences.$inferInsert;
export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
export type ImagePrompt = typeof imagePrompts.$inferSelect;
export type NewImagePrompt = typeof imagePrompts.$inferInsert;
export type GenerationLog = typeof generationLogs.$inferSelect;
export type NewGenerationLog = typeof generationLogs.$inferInsert;
export type SupportingCharacter = typeof supportingCharacters.$inferSelect;
export type NewSupportingCharacter = typeof supportingCharacters.$inferInsert;
export type SceneAudio = typeof sceneAudio.$inferSelect;
export type NewSceneAudio = typeof sceneAudio.$inferInsert;
export type StoryboardSegment = typeof storyboardSegments.$inferSelect;
export type NewStoryboardSegment = typeof storyboardSegments.$inferInsert;