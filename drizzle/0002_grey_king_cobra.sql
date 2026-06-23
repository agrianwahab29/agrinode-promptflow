CREATE TABLE `storyboard_segments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer NOT NULL,
	`segment_index` integer NOT NULL,
	`segment_time_start` integer NOT NULL,
	`segment_time_end` integer NOT NULL,
	`panel_count` integer NOT NULL,
	`visual_style_json` text NOT NULL,
	`character_sheet_json` text NOT NULL,
	`location_sheet_json` text NOT NULL,
	`panels_json` text NOT NULL,
	`markdown_prompt` text NOT NULL,
	`segment_transition_note` text,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_storyboard_segments_project_id` ON `storyboard_segments` (`project_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_storyboard_segments_project_segment` ON `storyboard_segments` (`project_id`,`segment_index`);--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `color_palette` text;--> statement-breakpoint
ALTER TABLE `image_prompts` ADD `technical` text;--> statement-breakpoint
ALTER TABLE `scenes` ADD `voiceover_speaker` text DEFAULT 'narrator' NOT NULL;