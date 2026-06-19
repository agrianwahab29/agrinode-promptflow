import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { CreateProviderConfigInputSchema } from '@/lib/validation/schemas';
import { errorResponse, successResponse } from '@/lib/api/error';
import { createProviderConfig, findByName, listProviderConfigs, toProviderConfigDTO } from '@/lib/db/repositories/provider-config.repo';
import { encryptToString } from '@/lib/crypto/aes';

export const runtime = 'nodejs';

export async function GET() {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const rows = await listProviderConfigs(userId);
  return successResponse(rows.map(toProviderConfigDTO));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const raw = await req.json().catch(() => null);
  const parsed = CreateProviderConfigInputSchema.safeParse(raw);
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  const existing = await findByName(userId, parsed.data.name);
  if (existing) return errorResponse('CONFLICT', 409, 'Nama provider sudah dipakai', { field: 'name' });
  const enc = encryptToString(parsed.data.apiKey);
  const created = await createProviderConfig({
    userId,
    provider: parsed.data.provider,
    name: parsed.data.name,
    baseUrl: parsed.data.baseUrl,
    model: parsed.data.model,
    apiKeyEncrypted: enc,
    isActive: parsed.data.isActive ?? 0,
  });
  return successResponse(toProviderConfigDTO(created), 201);
}