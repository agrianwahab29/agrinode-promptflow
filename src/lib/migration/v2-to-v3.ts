/**
 * V2 → V3 Migration Helpers
 *
 * migrateV2ToV3: backfill V3 defaults for existing V2 scenes
 * rollbackV2ToV3: revert V3 fields to null
 *
 * Both support dryRun and onProgress callback.
 */

import { eq, isNull, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '@/lib/db/schema';

// --- Types ---
export interface MigrationOptions {
  dryRun?: boolean;
  onProgress?: (processed: number, total: number) => void;
}

export interface MigrationResult {
  processed: number;
  reverted: number;
  errors: string[];
}

// --- DB connection (lazy) ---
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (_db) return _db;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');

  const client = createClient({ url, authToken });
  _db = drizzle(client, { schema });
  return _db;
}

// --- V3 defaults for scenes ---
const SCENE_V3_DEFAULTS = {
  transitionType: 'cut',
  transitionDurationMs: 0,
  transitionEasing: 'linear',
  transitionDirection: 'forward',
  voiceType: 'narrator',
  voiceEmotion: 'neutral',
  voiceSpeed: 1.0,
  voicePitch: 'auto',
  scenePacing: 'normal',
} as const;

/**
 * Migrate V2 scenes to V3 by backfilling defaults.
 * Scenes that already have V3 fields set are skipped.
 */
export async function migrateV2ToV3(options: MigrationOptions = {}): Promise<MigrationResult> {
  const { dryRun = false, onProgress } = options;
  const db = getDb();
  const result: MigrationResult = { processed: 0, reverted: 0, errors: [] };

  try {
    // Find all scenes where any V3 field is null (not yet migrated)
    const scenes = await db.query.scenes.findMany({
      where: isNull(schema.scenes.transitionType),
    });

    const total = scenes.length;
    if (total === 0) return result;

    for (const scene of scenes) {
      try {
        if (!dryRun) {
          await db
            .update(schema.scenes)
            .set(SCENE_V3_DEFAULTS)
            .where(eq(schema.scenes.id, scene.id));
        }
        result.processed++;
        onProgress?.(result.processed, total);
      } catch (err) {
        result.errors.push(`Scene ${scene.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Query failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}

/**
 * Rollback V3 scene fields to null.
 * Only affects scenes that have V3 defaults set.
 */
export async function rollbackV2ToV3(options: MigrationOptions = {}): Promise<MigrationResult> {
  const { dryRun = false, onProgress } = options;
  const db = getDb();
  const result: MigrationResult = { processed: 0, reverted: 0, errors: [] };

  try {
    const scenes = await db.query.scenes.findMany({
      where: sql`${schema.scenes.transitionType} IS NOT NULL`,
    });

    const total = scenes.length;
    if (total === 0) return result;

    for (const scene of scenes) {
      try {
        if (!dryRun) {
          await db
            .update(schema.scenes)
            .set({
              transitionType: sql`NULL`,
              transitionDurationMs: sql`NULL`,
              transitionEasing: sql`NULL`,
              transitionDirection: sql`NULL`,
              voiceType: sql`NULL`,
              voiceEmotion: sql`NULL`,
              voiceSpeed: sql`NULL`,
              voicePitch: sql`NULL`,
              durationSeconds: null,
              scenePacing: sql`NULL`,
              sceneMood: null,
            })
            .where(eq(schema.scenes.id, scene.id));
        }
        result.reverted++;
        onProgress?.(result.reverted, total);
      } catch (err) {
        result.errors.push(`Scene ${scene.id}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  } catch (err) {
    result.errors.push(`Query failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  return result;
}
