import 'server-only';
import { cache } from 'react';
import { db } from './client';
import { users, providerConfigs } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Cached DB helpers — deduplicates calls within the same render.
 * React.cache() ensures same-request dedup.
 */

export const getCachedUserById = cache(async (userId: number) => {
  const [row] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return row ?? null;
});

export const getCachedUserByEmail = cache(async (email: string) => {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
});

export const getCachedActiveProvider = cache(async (userId: number) => {
  const [row] = await db.select().from(providerConfigs)
    .where(eq(providerConfigs.userId, userId))
    .limit(1);
  return row ?? null;
});
