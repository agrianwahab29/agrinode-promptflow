import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { UpdateProviderConfigInputSchema } from '@/lib/validation/schemas';
import { errorResponse, successResponse, noContentResponse } from '@/lib/api/error';
import { deleteProviderConfig, getProviderConfig, setActiveProvider, toProviderConfigDTO, updateProviderConfig } from '@/lib/db/repositories/provider-config.repo';
import { encryptToString } from '@/lib/crypto/aes';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const existing = await getProviderConfig(id, userId);
  if (!existing) return errorResponse('NOT_FOUND', 404);
  const raw = await req.json().catch(() => null);
  const parsed = UpdateProviderConfigInputSchema.safeParse(raw);
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });

  if (parsed.data.isActive === 1) {
    await setActiveProvider(id, userId);
  }

  const input: Parameters<typeof updateProviderConfig>[2] = {};
  if (parsed.data.name !== undefined) input.name = parsed.data.name;
  if (parsed.data.baseUrl !== undefined) input.baseUrl = parsed.data.baseUrl;
  if (parsed.data.model !== undefined) input.model = parsed.data.model;
  if (parsed.data.apiKey) input.apiKeyEncrypted = encryptToString(parsed.data.apiKey);
  if (parsed.data.isActive !== undefined) input.isActive = parsed.data.isActive;

  const updated = await updateProviderConfig(id, userId, input);
  if (!updated) return errorResponse('NOT_FOUND', 404);
  return successResponse(toProviderConfigDTO(updated));
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const ok = await deleteProviderConfig(id, userId);
  if (!ok) return errorResponse('NOT_FOUND', 404);
  return noContentResponse();
}