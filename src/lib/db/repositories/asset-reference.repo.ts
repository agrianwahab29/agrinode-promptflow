import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { assetReferences, type AssetReference } from '@/lib/db/schema';

export async function listAssetReferencesByProject(projectId: number): Promise<AssetReference[]> {
  return db.select().from(assetReferences).where(eq(assetReferences.projectId, projectId));
}

export async function getAssetReferenceByFilename(projectId: number, filename: string): Promise<AssetReference | null> {
  const [row] = await db.select().from(assetReferences)
    .where(and(eq(assetReferences.projectId, projectId), eq(assetReferences.filename, filename)))
    .limit(1);
  return row ?? null;
}

export async function createAssetReference(input: {
  projectId: number; tipe: string; filename: string; blobUrl: string;
  label: string | null; mimeType: string | null; sizeBytes: number | null;
}): Promise<AssetReference> {
  const [row] = await db.insert(assetReferences).values(input).returning();
  if (!row) throw new Error('Failed to create asset reference');
  return row;
}

export async function deleteAssetReference(projectId: number, filename: string): Promise<boolean> {
  const result = await db.delete(assetReferences).where(and(eq(assetReferences.projectId, projectId), eq(assetReferences.filename, filename)));
  return (result.rowsAffected ?? 0) > 0;
}