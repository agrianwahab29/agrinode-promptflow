CREATE TABLE `asset_references` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`tipe` text NOT NULL,
	`filename` text NOT NULL,
	`blob_url` text NOT NULL,
	`label` text,
	`mime_type` text,
	`size_bytes` integer,
	`ai_classification` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_asset_refs_project_id` ON `asset_references` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_asset_refs_project_tipe` ON `asset_references` (`project_id`,`tipe`);--> statement-breakpoint
CREATE TABLE `characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`nama` text NOT NULL,
	`gayarambut` text NOT NULL,
	`wajah_asal` text NOT NULL,
	`pakaian_atas` text NOT NULL,
	`pakaian_bawah` text NOT NULL,
	`alas_kaki` text NOT NULL,
	`deskripsi_latar` text NOT NULL,
	`aksi` text NOT NULL,
	`peran` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_characters_project_id` ON `characters` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_characters_project_nama` ON `characters` (`project_id`,`nama`);--> statement-breakpoint
CREATE TABLE `generation_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`duration_ms` integer,
	`status` text NOT NULL,
	`error_message` text,
	`logs_json` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_gen_logs_project_id` ON `generation_logs` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_gen_logs_project_created` ON `generation_logs` (`project_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `image_prompts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`scene_id` integer,
	`tipe` text NOT NULL,
	`target` text NOT NULL,
	`prompt_text` text NOT NULL,
	`reference_filename` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scene_id`) REFERENCES `scenes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_image_prompts_project_id` ON `image_prompts` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_image_prompts_scene_id` ON `image_prompts` (`scene_id`);--> statement-breakpoint
CREATE INDEX `idx_image_prompts_project_tipe` ON `image_prompts` (`project_id`,`tipe`);--> statement-breakpoint
CREATE INDEX `idx_image_prompts_project_scene` ON `image_prompts` (`project_id`,`scene_id`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`duration_type` text NOT NULL,
	`duration_target_seconds` integer NOT NULL,
	`style_type` text NOT NULL,
	`aspect_ratio` text NOT NULL,
	`result_json` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`story_description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_projects_user_id` ON `projects` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_projects_user_created` ON `projects` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `provider_configs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`provider` text NOT NULL,
	`name` text NOT NULL,
	`base_url` text NOT NULL,
	`model` text NOT NULL,
	`api_key_encrypted` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_provider_configs_user_name` ON `provider_configs` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `scenes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`order_no` integer NOT NULL,
	`description` text NOT NULL,
	`voiceover_script` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_scenes_project_id` ON `scenes` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_scenes_project_order` ON `scenes` (`project_id`,`order_no`);--> statement-breakpoint
CREATE TABLE `supporting_characters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`scene_id` integer,
	`nama` text NOT NULL,
	`tipe` text NOT NULL,
	`aksi` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`scene_id`) REFERENCES `scenes`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_supporting_chars_project_id` ON `supporting_characters` (`project_id`);--> statement-breakpoint
CREATE INDEX `idx_supporting_chars_scene_id` ON `supporting_characters` (`scene_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`password_hash` text NOT NULL,
	`image` text,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);