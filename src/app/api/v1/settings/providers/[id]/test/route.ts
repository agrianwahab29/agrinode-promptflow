import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getProviderConfig } from '@/lib/db/repositories/provider-config.repo';
import { decryptFromString } from '@/lib/crypto/aes';

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

  // Decrypt API key
  let apiKey = '';
  if (cfg.apiKeyEncrypted) {
    try { apiKey = decryptFromString(cfg.apiKeyEncrypted); } catch { apiKey = ''; }
  }

  console.log('[provider-test] Mulai test id=%d provider=%s model=%s baseUrl=%s', id, cfg.provider, cfg.model, cfg.baseUrl);

  // Headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  // Request body — minimal chat completion
  const body = JSON.stringify({
    model: cfg.model,
    messages: [{ role: 'user', content: 'Reply with one word: OK' }],
    max_tokens: 8,
    stream: false,
  });

  const start = Date.now();
  try {
    const res = await fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(25_000),
    });

    const latencyMs = Date.now() - start;
    const responseText = await res.text();

    if (!res.ok) {
      console.error('[provider-test] HTTP %d id=%d latency=%dms body=%s', res.status, id, latencyMs, responseText.slice(0, 500));
      return errorResponse('PROVIDER_ERROR', 502, `Provider response ${res.status}`, {
        status: res.status,
        body: responseText.slice(0, 500),
      });
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      console.error('[provider-test] INVALID JSON id=%d body=%s', id, responseText.slice(0, 500));
      return errorResponse('PROVIDER_ERROR', 502, 'Response bukan JSON valid', { body: responseText.slice(0, 500) });
    }

    const choices = parsed?.choices as Array<{ message?: { content?: string } }> | undefined;
    const sample = choices?.[0]?.message?.content?.trim().slice(0, 60) ?? '(no content)';
    console.log('[provider-test] SUKSES id=%d latency=%dms sample="%s"', id, latencyMs, sample);
    return successResponse({ ok: true, provider: cfg.provider, model: cfg.model, latencyMs, sample });
  } catch (e) {
    const latencyMs = Date.now() - start;
    const errMsg = e instanceof Error ? e.message : String(e);
    const errStack = e instanceof Error ? e.stack : '';
    console.error('[provider-test] GAGAL id=%d latency=%dms\n  message: %s\n  stack: %s', id, latencyMs, errMsg, errStack ?? '');
    return errorResponse('PROVIDER_ERROR', 502, 'Provider gagal', { message: errMsg, detail: errStack?.split('\n').slice(0, 3).join('\n') });
  }
}
