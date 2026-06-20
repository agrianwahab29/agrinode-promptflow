import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getAssetReferenceById, updateAssetClassification } from '@/lib/db/repositories/asset-reference.repo';
import { classifyImage } from '@/lib/ai/image-classifier';

export const runtime = 'nodejs';
export const maxDuration = 60;

// V2: rate limit 30 req/min — handled via in-memory check (consistent with middleware pattern)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const e = rateLimitMap.get(key);
  if (!e || e.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  e.count += 1;
  return e.count <= limit;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  if (!checkRateLimit(`cls:${userId}`, 30, 60_000)) {
    return errorResponse('RATE_LIMITED', 429, 'Terlalu banyak request classify');
  }

  const body = (await req.json().catch(() => null)) as { assetReferenceId?: number } | null;
  if (!body || typeof body.assetReferenceId !== 'number') {
    return errorResponse('VALIDATION_ERROR', 400, 'assetReferenceId wajib');
  }

  const ref = await getAssetReferenceById(body.assetReferenceId);
  if (!ref) return errorResponse('NOT_FOUND', 404, 'Asset reference tidak ditemukan');
  if (ref.projectId !== 0) {
    // verify ownership through project
    const { getProjectById } = await import('@/lib/db/repositories/project.repo');
    const proj = await getProjectById(ref.projectId, userId);
    if (!proj) return errorResponse('FORBIDDEN', 403, 'Bukan milik user');
  }

  // Fetch the image from blob URL
  let imageBase64 = '';
  const mimeType = ref.mimeType ?? 'image/png';
  try {
    const res = await fetch(ref.blobUrl);
    if (!res.ok) throw new Error(`Fetch image gagal: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    imageBase64 = buf.toString('base64');
  } catch (e) {
    return errorResponse('BAD_GATEWAY', 502, e instanceof Error ? e.message : 'Gagal fetch image');
  }

  try {
    const result = await classifyImage({ imageBase64, mimeType, filename: ref.filename });
    const updated = await updateAssetClassification(ref.id, {
      tipe: result.role,
      label: result.label,
      aiClassification: JSON.stringify({ role: result.role, label: result.label, confidence: result.confidence, description: result.description ?? '' }),
    });
    return successResponse({
      id: ref.id,
      filename: ref.filename,
      role: result.role,
      label: result.label,
      confidence: result.confidence,
      description: result.description ?? null,
      updated: !!updated,
    });
  } catch (e) {
    return errorResponse('PROVIDER_ERROR', 502, e instanceof Error ? e.message : 'Vision LLM gagal');
  }
}
