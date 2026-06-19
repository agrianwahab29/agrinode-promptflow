import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getProviderConfig } from '@/lib/db/repositories/provider-config.repo';
import { generateText, type LanguageModelV1 } from 'ai';
import { buildProvider } from '@/lib/ai/provider-registry';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const cfg = await getProviderConfig(id, userId);
  if (!cfg) return errorResponse('NOT_FOUND', 404);
  const start = Date.now();
  try {
    const model = buildProvider({
      provider: cfg.provider,
      baseUrl: cfg.baseUrl,
      model: cfg.model,
      apiKeyEncrypted: cfg.apiKeyEncrypted,
    }) as unknown as LanguageModelV1;
    const result = await generateText({ model, prompt: 'Reply with one word: OK', maxTokens: 8 });
    const latencyMs = Date.now() - start;
    return successResponse({ ok: true, provider: cfg.provider, model: cfg.model, latencyMs, sample: result.text.trim().slice(0, 60) });
  } catch (e) {
    return errorResponse('PROVIDER_ERROR', 502, 'Provider gagal', { message: e instanceof Error ? e.message : String(e) });
  }
}