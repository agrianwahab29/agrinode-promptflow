ALTER TABLE `scenes` ADD `transition_type` text NOT NULL DEFAULT 'cut';--> statement-breakpoint
ALTER TABLE `scenes` ADD `transition_duration_ms` integer NOT NULL DEFAULT 0;--> statement-breakpoint
ALTER TABLE `scenes` ADD `transition_easing` text NOT NULL DEFAULT 'linear';--> statement-breakpoint
ALTER TABLE `scenes` ADD `transition_direction` text NOT NULL DEFAULT 'forward';--> statement-breakpoint
ALTER TABLE `scenes` ADD `voice_type` text NOT NULL DEFAULT 'narrator';--> statement-breakpoint
ALTER TABLE `scenes` ADD `voice_emotion` text NOT NULL DEFAULT 'neutral';--> statement-breakpoint
ALTER TABLE `scenes` ADD `voice_speed` real NOT NULL DEFAULT 1.0;--> statement-breakpoint
ALTER TABLE `scenes` ADD `voice_pitch` text NOT NULL DEFAULT 'auto';--> statement-breakpoint
ALTER TABLE `scenes` ADD `duration_seconds` integer;--> statement-breakpoint
ALTER TABLE `scenes` ADD `scene_pacing` text NOT NULL DEFAULT 'normal';--> statement-breakpoint
ALTER TABLE `scenes` ADD `scene_mood` text;--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `composition` text;--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `lighting` text;--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `camera` text;--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `mood_atmosphere` text;--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `style_references` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `theme_preference` text DEFAULT 'dark';--> statement-breakpoint
CREATE TABLE `scene_audio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`scene_id` integer NOT NULL,
	`audio_type` text NOT NULL,
	`description` text NOT NULL,
	`timing` text NOT NULL DEFAULT 'throughout',
	`duration_seconds` integer,
	`volume` real NOT NULL DEFAULT 0.7,
	`fade_in_ms` integer NOT NULL DEFAULT 0,
	`fade_out_ms` integer NOT NULL DEFAULT 0,
	`music_genre` text,
	`music_mood` text,
	`music_tempo_bpm` integer,
	`music_instruments` text,
	`music_volume` real DEFAULT 0.7,
	`sfx_list` text,
	`ambient_type` text,
	`ambient_volume` real DEFAULT 0.5,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scene_id`) REFERENCES `scenes`(`id`) ON UPDATE no action ON DELETE cascade
);--> statement-breakpoint
CREATE INDEX `idx_scene_audio_project_id` ON `scene_audio` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_scene_audio_scene_id` ON `scene_audio` (`scene_id`);--> statement-breakpoint
CREATE INDEX `idx_scene_audio_project_scene` ON `scene_audio` (`project_id`,`scene_id`);
