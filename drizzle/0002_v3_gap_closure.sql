-- V3 Gap Closure: Add missing columns for voiceover_speaker, color_palette, technical
-- Migration 0002_v3_gap_closure

-- 1. Add voiceover_speaker to scenes table
ALTER TABLE `scenes` ADD COLUMN `voiceover_speaker` text NOT NULL DEFAULT 'narrator';

-- 2. Add color_palette and technical to image_prompts table
ALTER TABLE `image_prompts` ADD COLUMN `color_palette` text;
ALTER TABLE `image_prompts` ADD COLUMN `technical` text;
