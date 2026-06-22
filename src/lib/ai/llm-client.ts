import 'server-only';
import { z } from 'zod';
import { PromptPackageSchema, type PromptPackage } from '@/lib/validation/schemas';
import { decryptFromString } from '@/lib/crypto/aes';
import type { ProviderConfigInput } from './provider-registry';

export interface GenerateOptions {
  provider: ProviderConfigInput;
  system: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxRetries?: number;
  onStreamChunk?: (chunk: string) => void;
}

/**
 * Categorize error for better debugging
 */
function categorizeError(err: unknown, context?: string): { category: string; message: string; details?: Record<string, unknown> } {
  const msg = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : 'UnknownError';

  // Network/Timeout errors
  if (name === 'AbortError' || msg.includes('timeout') || msg.includes('Timeout')) {
    return { category: 'TIMEOUT', message: 'LLM request timeout (600s limit)', details: { context } };
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('fetch failed')) {
    return { category: 'NETWORK', message: 'Cannot connect to LLM provider', details: { context, error: msg } };
  }

  // Zod validation errors
  if (name === 'ZodError' || (err as { issues?: unknown })?.issues) {
    const zodErr = err as z.ZodError;
    const issueSummary = zodErr.issues?.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return {
      category: 'VALIDATION',
      message: 'LLM response does not match expected schema',
      details: { issueCount: zodErr.issues?.length ?? 0, issues: issueSummary },
    };
  }

  // HTTP errors
  if (msg.startsWith('Provider HTTP')) {
    return { category: 'HTTP', message: msg, details: { context } };
  }

  // JSON parse errors
  if (msg.includes('JSON') || msg.includes('parse')) {
    return { category: 'JSON_PARSE', message: 'Failed to parse LLM response as JSON', details: { context, error: msg } };
  }

  return { category: 'UNKNOWN', message: msg, details: { context, errorName: name } };
}

export async function generatePromptPackage(opts: GenerateOptions): Promise<PromptPackage> {
  const maxRetries = opts.maxRetries ?? 1; // 2→1: avoid Vercel 60s timeout
  let lastError: unknown = null;
  const totalStart = Date.now();

  // Decrypt API key
  let apiKey = '';
  if (opts.provider.apiKeyEncrypted) {
    try {
      apiKey = decryptFromString(opts.provider.apiKeyEncrypted);
      console.log('[llm] API key decrypted successfully (length=%d)', apiKey.length);
    } catch (decryptErr) {
      console.error('[llm] API key decryption FAILED:', decryptErr instanceof Error ? decryptErr.message : String(decryptErr));
      apiKey = '';
    }
  } else {
    console.warn('[llm] No API key provided (apiKeyEncrypted is empty)');
  }

  const baseUrl = opts.provider.baseUrl.replace(/\/+$/, '');
  const endpoint = `${baseUrl}/chat/completions`;

  // Headers
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  // Build messages array from system + messages
  const chatMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: opts.system },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // Log request details
  const requestBody = {
    model: opts.provider.model,
    messages: chatMessages,
    max_tokens: 16384, // 32768→16384: faster response, sufficient for shorts/tutorials
    temperature: 0.7,
    stream: true, // We want streaming for realtime feedback
  };
  const requestJson = JSON.stringify(requestBody);
  console.log('[llm] Request: endpoint=%s model=%s payloadSize=%d messages=%d systemLength=%d',
    endpoint,
    opts.provider.model,
    requestJson.length,
    chatMessages.length,
    opts.system.length
  );

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const attemptStart = Date.now();
    console.log('[llm] Attempt %d/%d starting...', attempt, maxRetries);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: requestJson,
        signal: AbortSignal.timeout(600_000), // 600s timeout for streaming
      });

      const attemptDuration = Date.now() - attemptStart;
      console.log('[llm] Response headers received: status=%d duration=%dms',
        res.status, attemptDuration
      );

      if (!res.ok) {
        const responseText = await res.text();
        console.error('[llm] HTTP error %d: %s', res.status, responseText.slice(0, 500));
        throw new Error(`Provider HTTP ${res.status}: ${responseText.slice(0, 500)}`);
      }

      let content = '';
      const contentType = res.headers.get('content-type') || '';
      
      if (contentType.includes('event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? ''; // keep the last incomplete line
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data: ')) {
              const dataStr = trimmed.slice(6).trim();
              if (dataStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(dataStr);
                const deltaContent = parsed.choices?.[0]?.delta?.content || '';
                if (deltaContent) {
                  content += deltaContent;
                  opts.onStreamChunk?.(deltaContent);
                }
              } catch (e) {
                // ignore parse error for partial data
              }
            }
          }
        }
      } else {
        // Fallback if provider ignores stream: true
        const responseText = await res.text();
        let parsed: Record<string, unknown>;
        try {
          parsed = JSON.parse(responseText);
        } catch (parseErr) {
          throw new Error(`Provider response bukan JSON valid: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
        }
        const choices = parsed?.choices as Array<{ message?: { content?: string } }> | undefined;
        content = choices?.[0]?.message?.content || '';
        if (content) {
          opts.onStreamChunk?.(content);
        }
      }

      if (!content) {
        throw new Error('Provider response kosong / format tidak dikenal');
      }
      console.log('[llm] Content received: length=%d', content.length);

      // Multi-strategy JSON extraction:
      // 1. Strip  antml tags / thinking blocks (model reasoning mode)
      let cleaned = content;
      cleaned = cleaned.replace(/<antml:[^>]*>[\s\S]*?<\/antml:[^>]*>/g, '');
      cleaned = cleaned.replace(/<antml:thinking>[\s\S]*?<\/antml:thinking>/g, '');
      cleaned = cleaned.replace(/<antml:[^>]*\/>/g, '');
      cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/g, '');
      cleaned = cleaned.trim();

      // 2. Cari JSON code block
      let jsonStr = cleaned;
      const jsonMatches = [...jsonStr.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
      if (jsonMatches.length > 0) {
        jsonStr = jsonMatches[jsonMatches.length - 1][1].trim();
        console.log('[llm] Extracted JSON from code block: length=%d', jsonStr.length);
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
            console.log('[llm] Extracted raw JSON: length=%d', jsonStr.length);
          }
        }
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error('[llm] JSON parse gagal:');
        console.error('[llm]   cleaned preview: %s', cleaned.slice(0, 500).replace(/\n/g, '\\n'));
        console.error('[llm]   jsonStr preview: %s', jsonStr.slice(0, 500).replace(/\n/g, '\\n'));
        throw new Error(`Response bukan JSON valid: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      }

      // Validate with Zod - catch and format errors
      try {
        const validated = PromptPackageSchema.parse(parsedJson);
        const totalDuration = Date.now() - totalStart;
        console.log('[llm] Validation SUCCESS: scenes=%d chars=%d img_prompts=%d totalDuration=%dms',
          validated.scenes.length,
          validated.character_profiles.length,
          validated.image_prompts.characters.length + validated.image_prompts.backgrounds.length,
          totalDuration
        );
        return validated;
      } catch (validationErr) {
        const categorized = categorizeError(validationErr, 'Zod validation');
        console.error('[llm] VALIDATION ERROR [%s]: %s', categorized.category, categorized.message);
        if (categorized.details) {
          console.error('[llm] Validation details: %j', categorized.details);
        }
        throw validationErr;
      }
    } catch (err) {
      lastError = err;
      const attemptDuration = Date.now() - attemptStart;
      const categorized = categorizeError(err, `Attempt ${attempt}`);

      console.error('[llm] Attempt %d FAILED after %dms:', attempt, attemptDuration);
      console.error('[llm]   Category: %s', categorized.category);
      console.error('[llm]   Message: %s', categorized.message);
      if (categorized.details) {
        console.error('[llm]   Details: %j', categorized.details);
      }

      if (attempt < maxRetries) {
        const backoff = Math.min(2000 * 2 ** (attempt - 1), 8000);
        console.log('[llm] Retrying in %dms (attempt %d/%d)...', backoff, attempt + 1, maxRetries);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  const totalDuration = Date.now() - totalStart;
  const finalCategorized = categorizeError(lastError, 'All attempts failed');
  console.error('[llm] ALL %d ATTEMPTS FAILED after %dms', maxRetries, totalDuration);
  console.error('[llm]   Final category: %s', finalCategorized.category);
  console.error('[llm]   Final error: %s', finalCategorized.message);

  // Enhance error message with category
  const enhancedMessage = `[${finalCategorized.category}] ${finalCategorized.message}`;
  throw new Error(enhancedMessage);
}
