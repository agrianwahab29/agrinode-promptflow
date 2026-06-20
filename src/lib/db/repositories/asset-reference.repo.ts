import 'server-only';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { assetReferences, type AssetReference } from '@/lib/db/schema';

export async function listAssetReferencesByProject(projectId: number): Promise<AssetReference[]> {
  return db.select().from(assetReferences).where(eq(assetReferences.projectId, projectId));
}

export async function getAssetReferenceById(id: number): Promise<AssetReference | null> {
  const [row] = await db.select().from(assetReferences).where(eq(assetReferences.id, id)).limit(1);
  return row ?? null;
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

// V2: update classification result from Vision LLM
export async function updateAssetClassification(
  id: number,
  data: { tipe: string; label: string | null; aiClassification: string },
): Promise<AssetReference | null> {
  const [row] = await db.update(assetReferences)
    .set({ tipe: data.tipe, label: data.label, aiClassification: data.aiClassification })
    .where(eq(assetReferences.id, id))
    .returning();
  return row ?? null;
}

// V2: attach orphaned refs (projectId=0) to a real project
export async function attachOrphanedRefs(refIds: number[], projectId: number): Promise<void> {
  if (refIds.length === 0) return;
  for (const id of refIds) {
    await db.update(assetReferences)
      .set({ projectId })
      .where(and(eq(assetReferences.id, id), eq(assetReferences.projectId, 0)));
  }
}

export async function deleteAssetReference(projectId: number, filename: string): Promise<boolean> {
  const result = await db.delete(assetReferences).where(and(eq(assetReferences.projectId, projectId), eq(assetReferences.filename, filename)));
  return (result.rowsAffected ?? 0) > 0;
}