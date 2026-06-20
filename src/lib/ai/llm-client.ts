import 'server-only';
import { PromptPackageSchema, type PromptPackage } from '@/lib/validation/schemas';
import { decryptFromString } from '@/lib/crypto/aes';
import type { ProviderConfigInput } from './provider-registry';

export interface GenerateOptions {
  provider: ProviderConfigInput;
  system: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxRetries?: number;
}

export async function generatePromptPackage(opts: GenerateOptions): Promise<PromptPackage> {
  const maxRetries = opts.maxRetries ?? 2;
  let lastError: unknown = null;

  // Decrypt API key
  let apiKey = '';
  if (opts.provider.apiKeyEncrypted) {
    try { apiKey = decryptFromString(opts.provider.apiKeyEncrypted); } catch { apiKey = ''; }
  }

  const baseUrl = opts.provider.baseUrl.replace(/\/+$/, '');

  // Headers
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  // Build messages array from system + messages
  const chatMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: opts.system },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('[llm] Attempt %d/%d model=%s max_tokens=%d baseUrl=%s', attempt, maxRetries, opts.provider.model, 32768, baseUrl);
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: opts.provider.model,
          messages: chatMessages,
          max_tokens: 32768,
          temperature: 0.7,
          stream: false,
        }),
        signal: AbortSignal.timeout(240_000),
      });

      console.log('[llm] Response status=%d content-length=%s', res.status, res.headers.get('content-length'));
      const responseText = await res.text();

      if (!res.ok) {
        console.error('[llm] HTTP error %d body=%s', res.status, responseText.slice(0, 500));
        throw new Error(`Provider HTTP ${res.status}: ${responseText.slice(0, 500)}`);
      }

      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        console.error('[llm] Invalid JSON body=%s', responseText.slice(0, 500));
        throw new Error(`Provider response bukan JSON valid: ${responseText.slice(0, 500)}`);
      }

      const choices = parsed?.choices as Array<{ message?: { content?: string } }> | undefined;
      const content = choices?.[0]?.message?.content;
      if (!content) {
        console.error('[llm] Empty content, keys=%s', Object.keys(parsed ?? {}));
        throw new Error('Provider response kosong / format tidak dikenal');
      }
      console.log('[llm] Content length=%d preview=%s', content.length, content.slice(0, 200).replace(/\n/g, '\\n'));

      // Multi-strategy JSON extraction:
      // 1. Strip  antml tags / thinking blocks (model reasoning mode)
      let cleaned = content;
      cleaned = cleaned.replace(/<antml:[^>]*>[\s\S]*?<\/antml:[^>]*>/g, '');
      cleaned = cleaned.replace(/<antml:thinking>[\s\S]*?<\/antml:thinking>/g, '');
      cleaned = cleaned.replace(/<antml:[^>]*\/>/g, '');
      cleaned = cleaned.trim();

      // 2. Cari JSON code block
      let jsonStr = cleaned;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch?.[1]) {
        jsonStr = jsonMatch[1].trim();
      } else {
        // 3. Cari raw JSON object/array (first { atau [ sampai akhir)
        const firstBrace = cleaned.search(/[\[{]/);
        if (firstBrace >= 0) {
          // Cari closing brace/bracket yang match
          let depth = 0;
          let inString = false;
          let escape = false;
          let endIdx = -1;
          for (let i = firstBrace; i < cleaned.length; i++) {
            const c = cleaned[i];
            if (escape) { escape = false; continue; }
            if (c === '\\') { escape = true; continue; }
            if (c === '"' && !escape) { inString = !inString; continue; }
            if (inString) continue;
            if (c === '{' || c === '[') depth++;
            else if (c === '}' || c === ']') {
              depth--;
              if (depth === 0) { endIdx = i; break; }
            }
          }
          if (endIdx > 0) {
            jsonStr = cleaned.slice(firstBrace, endIdx + 1);
          }
        }
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonStr);
      } catch (e) {
        console.error('[llm] JSON parse gagal. cleaned=%s', cleaned.slice(0, 500).replace(/\n/g, '\\n'));
        console.error('[llm] jsonStr=%s', jsonStr.slice(0, 500).replace(/\n/g, '\\n'));
        throw new Error(`Response bukan JSON valid: ${e instanceof Error ? e.message : String(e)}`);
      }
      const validated = PromptPackageSchema.parse(parsedJson);
      console.log('[llm] Validasi sukses: %d scenes, %d chars, %d img_prompts', validated.scenes.length, validated.character_profiles.length, validated.image_prompts.characters.length + validated.image_prompts.backgrounds.length);
      return validated;
    } catch (err) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[llm] Attempt %d GAGAL: %s', attempt, errMsg);
      if (attempt < maxRetries) {
        const backoff = Math.min(2000 * 2 ** (attempt - 1), 8000);
        console.log('[llm] Retry dalam %dms...', backoff);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  console.error('[llm] SEMUA %d attempt gagal. Last error: %s', maxRetries, lastError instanceof Error ? lastError.message : String(lastError));
  throw lastError ?? new Error('Generation failed');
}
