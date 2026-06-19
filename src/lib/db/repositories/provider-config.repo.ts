import 'server-only';
import { and, eq, desc } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { providerConfigs, type ProviderConfig } from '@/lib/db/schema';
import { maskApiKey } from '@/lib/crypto/aes';

export async function listProviderConfigs(userId: number): Promise<ProviderConfig[]> {
  return db.select().from(providerConfigs).where(eq(providerConfigs.userId, userId)).orderBy(desc(providerConfigs.createdAt));
}

export async function getProviderConfig(id: number, userId: number): Promise<ProviderConfig | null> {
  const [row] = await db.select().from(providerConfigs).where(and(eq(providerConfigs.id, id), eq(providerConfigs.userId, userId))).limit(1);
  return row ?? null;
}

export async function getActiveProviderConfig(userId: number): Promise<ProviderConfig | null> {
  const [row] = await db.select().from(providerConfigs).where(and(eq(providerConfigs.userId, userId), eq(providerConfigs.isActive, 1))).limit(1);
  return row ?? null;
}

export async function createProviderConfig(input: {
  userId: number; provider: string; name: string; baseUrl: string; model: string;
  apiKeyEncrypted: string | null; isActive: number;
}): Promise<ProviderConfig> {
  const [row] = await db.insert(providerConfigs).values(input).returning();
  if (!row) throw new Error('Failed to create provider config');
  return row;
}

export async function updateProviderConfig(id: number, userId: number, input: {
  provider?: string; name?: string; baseUrl?: string; model?: string;
  apiKeyEncrypted?: string | null; isActive?: number;
}): Promise<ProviderConfig | null> {
  const [row] = await db.update(providerConfigs)
    .set({ ...input, updatedAt: Math.floor(Date.now() / 1000) })
    .where(and(eq(providerConfigs.id, id), eq(providerConfigs.userId, userId)))
    .returning();
  return row ?? null;
}

export async function setActiveProvider(id: number, userId: number): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(providerConfigs).set({ isActive: 0, updatedAt: Math.floor(Date.now() / 1000) }).where(eq(providerConfigs.userId, userId));
    await tx.update(providerConfigs).set({ isActive: 1, updatedAt: Math.floor(Date.now() / 1000) }).where(and(eq(providerConfigs.id, id), eq(providerConfigs.userId, userId)));
  });
}

export async function deleteProviderConfig(id: number, userId: number): Promise<boolean> {
  const result = await db.delete(providerConfigs).where(and(eq(providerConfigs.id, id), eq(providerConfigs.userId, userId)));
  return (result.rowsAffected ?? 0) > 0;
}

export function toProviderConfigDTO(row: ProviderConfig): {
  id: number; userId: number; provider: string; name: string; baseUrl: string; model: string;
  apiKeyMasked: string; isActive: number; createdAt: string; updatedAt: string;
} {
  return {
    id: row.id,
    userId: row.userId,
    provider: row.provider,
    name: row.name,
    baseUrl: row.baseUrl,
    model: row.model,
    apiKeyMasked: row.apiKeyEncrypted ? maskApiKey(row.apiKeyEncrypted) : '',
    isActive: row.isActive,
    createdAt: new Date(row.createdAt * 1000).toISOString(),
    updatedAt: new Date(row.updatedAt * 1000).toISOString(),
  };
}

export async function findByName(userId: number, name: string): Promise<ProviderConfig | null> {
  const [row] = await db.select().from(providerConfigs).where(and(eq(providerConfigs.userId, userId), eq(providerConfigs.name, name))).limit(1);
  return row ?? null;
}