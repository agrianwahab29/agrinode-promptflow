import 'server-only';
import { z } from 'zod';
import { jsonrepair } from 'jsonrepair';
import { PromptPackageSchema, type PromptPackage } from '@/lib/validation/schemas';
import { decryptFromString } from '@/lib/crypto/aes';
import { normalizePromptPackage } from './response-normalizer';
import type { ProviderConfigInput } from './provider-registry';

export interface GenerateOptions {
  provider: ProviderConfigInput;
  system: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxRetries?: number;
  onStreamChunk?: (chunk: string) => void;
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
}

/**
 * Categorize error for better debugging
 */
export function categorizeError(err: unknown, context?: string): { category: string; message: string; details?: Record<string, unknown> } {
  const msg = err instanceof Error ? err.message : String(err);
  const name = err instanceof Error ? err.name : 'UnknownError';

  if (name === 'AbortError' || msg.includes('timeout') || msg.includes('Timeout')) {
    return { category: 'TIMEOUT', message: 'LLM request timeout (600s limit)', details: { context } };
  }
  if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('fetch failed')) {
    return { category: 'NETWORK', message: 'Cannot connect to LLM provider', details: { context, error: msg } };
  }
  if (name === 'ZodError' || (err as { issues?: unknown })?.issues) {
    const zodErr = err as z.ZodError;
    const issueSummary = zodErr.issues?.slice(0, 5).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    return {
      category: 'VALIDATION',
      message: 'LLM response does not match expected schema',
      details: { issueCount: zodErr.issues?.length ?? 0, issues: issueSummary },
    };
  }
  if (msg.startsWith('Provider HTTP')) {
    return { category: 'HTTP', message: msg, details: { context } };
  }
  if (msg.includes('JSON') || msg.includes('parse')) {
    return { category: 'JSON_PARSE', message: 'Failed to parse LLM response as JSON', details: { context, error: msg } };
  }
  return { category: 'UNKNOWN', message: msg, details: { context, errorName: name } };
}

/**
 * Attempt to repair truncated JSON from LLM output.
 * Handles: unterminated strings, missing closing brackets/braces, trailing commas.
 */
function repairTruncatedJson(jsonStr: string): string {
  let s = jsonStr.trim();

  // Remove trailing incomplete key-value (e.g. `"key": ` with no value)
  s = s.replace(/,\s*"[^"]*"\s*:\s*$/, '');

  // Close any unterminated string: count unescaped quotes
  let inString = false;
  let escape = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') {
      // Look ahead to check if it's the last character (broken escape at end)
      if (i === s.length - 1) {
        s = s.slice(0, s.length - 1); // Remove trailing backslash
        break;
      }
      escape = true;
      continue;
    }
    if (c === '"') { inString = !inString; }
  }
  if (inString) {
    // Truncated inside a string — close it
    s += '"';
  }

  // Remove trailing comma before we close brackets
  s = s.replace(/,\s*$/, '');

  // Count open vs close brackets/braces and close missing ones
  const stack: string[] = [];
  inString = false;
  escape = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{') stack.push('}');
    else if (c === '[') stack.push(']');
    else if (c === '}' || c === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === c) {
        stack.pop();
      }
    }
  }

  // Close all unclosed brackets/braces in reverse order
  while (stack.length > 0) {
    // Remove trailing comma before closing
    s = s.replace(/,\s*$/, '');
    s += stack.pop();
  }

  return s;
}

/**
 * Sanitize JSON string before parsing to fix raw newlines, control chars, BOM, etc.
 */
function sanitizeJsonString(jsonStr: string): string {
  let s = jsonStr;
  // Remove BOM
  if (s.charCodeAt(0) === 0xFEFF) {
    s = s.slice(1);
  }
  
  // We do NOT slice by lastIndexOf('}') here because it would destroy truncated JSON tails!
  // extractJsonFromContent already handles finding the best candidate bounds.

  // Escape unescaped newlines/tabs inside strings
  // A simplistic approach: replace actual \n with \\n
  // We should do this only inside strings, but for now we'll do a global cleanup
  // Replace control chars 0x00-0x1F (except \r\n\t which might be structural)
  // Actually, raw newlines inside strings break JSON.parse.
  let inString = false;
  let escape = false;
  let result = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      result += c;
      escape = false;
      continue;
    }
    if (c === '\\') {
      result += c;
      escape = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      result += c;
      continue;
    }
    if (inString) {
      if (c === '\n') {
        result += '\\n';
      } else if (c === '\r') {
        // drop raw CR
      } else if (c === '\t') {
        result += '\\t';
      } else {
        const code = s.charCodeAt(i);
        if (code < 0x20) {
          result += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          result += c;
        }
      }
    } else {
      result += c;
    }
  }
  return result;
}

/**
 * Extract the best JSON candidate from LLM output.
 * Strategy: strip thinking blocks, find all JSON candidates, pick the largest valid one.
 */
function extractJsonFromContent(content: string): string {
  let cleaned = content;

  // 1. Strip <think>...</think> blocks (greedy — handles nested content)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  // Fallback: if <think> exists without closing tag, strip from <think> to end of thinking
  // by looking for the start of actual JSON after <think>
  if (/<think>/i.test(cleaned)) {
    // Find the last occurrence of </think> or strip everything before the first {
    const thinkStart = cleaned.search(/<think>/i);
    const jsonStart = cleaned.indexOf('{', thinkStart);
    // Check if there's a </think> between thinkStart and jsonStart
    const thinkEnd = cleaned.indexOf('</think>', thinkStart);
    if (thinkEnd > 0 && thinkEnd < jsonStart) {
      // Normal case: strip the think block
      cleaned = cleaned.slice(0, thinkStart) + cleaned.slice(thinkEnd + 8);
    } else if (thinkEnd < 0) {
      // No closing tag — the model just started thinking and never closed
      // Strip everything from <think> to just before what looks like real JSON
      // Find real JSON by looking for a large { block
      const realJsonIdx = findLargestJsonStart(cleaned);
      if (realJsonIdx >= 0) {
        cleaned = cleaned.slice(realJsonIdx);
      }
    }
  }

  // Strip antml tags
  cleaned = cleaned.replace(/<[^>]*>[\s\S]*?<\/antml:[^>]*>/g, '');
  cleaned = cleaned.replace(/<[^>]*\/>/g, '');
  cleaned = cleaned.trim();

  // 2. Find ALL JSON code blocks and raw JSON objects
  const candidates: string[] = [];

  // From code blocks
  const codeBlockMatches = [...cleaned.matchAll(/```(?:json)?\s*([\s\S]*?)```/g)];
  for (const m of codeBlockMatches) {
    if (m[1]?.trim()) candidates.push(m[1].trim());
  }

  // Raw JSON extraction — find all top-level { } blocks using depth tracking
  const rawCandidates = extractAllJsonObjects(cleaned);
  candidates.push(...rawCandidates);

  // If no candidates found, try the entire cleaned string
  if (candidates.length === 0) {
    candidates.push(cleaned);
  }

  // 3. Pick the LARGEST candidate (most likely the full response)
  candidates.sort((a, b) => b.length - a.length);

  console.log('[llm] JSON candidates found: %d, sizes: %s',
    candidates.length,
    candidates.slice(0, 5).map(c => c.length).join(', ')
  );

  return candidates[0] ?? cleaned;
}

/**
 * Find the start index of the largest JSON object in a string.
 */
function findLargestJsonStart(s: string): number {
  let bestStart = -1;
  let bestLen = 0;
  let i = 0;
  while (i < s.length) {
    if (s[i] === '{') {
      const end = findMatchingBrace(s, i);
      const len = end >= 0 ? (end - i + 1) : (s.length - i);
      if (len > bestLen) {
        bestLen = len;
        bestStart = i;
      }
      if (end >= 0) i = end + 1; else break;
    } else {
      i++;
    }
  }
  return bestStart;
}

/**
 * Extract all top-level JSON objects from a string.
 */
function extractAllJsonObjects(s: string): string[] {
  const results: string[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '{') {
      const end = findMatchingBrace(s, i);
      if (end >= 0) {
        results.push(s.slice(i, end + 1));
        i = end + 1;
      } else {
        // Unclosed — take everything from here to end (will be repaired later)
        results.push(s.slice(i));
        break;
      }
    } else {
      i++;
    }
  }
  return results;
}

/**
 * Find the matching closing brace for an opening brace at position `start`.
 * Returns -1 if not found (truncated JSON).
 */
function findMatchingBrace(s: string, start: number): number {
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) { escape = false; continue; }
    if (c === '\\') { escape = true; continue; }
    if (c === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;
    if (c === '{' || c === '[') depth++;
    else if (c === '}' || c === ']') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1; // unclosed
}

export async function generatePromptPackage(opts: GenerateOptions): Promise<PromptPackage> {
  const maxRetries = opts.maxRetries ?? 3;
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

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const chatMessages: Array<{ role: string; content: string }> = [
    { role: 'system', content: opts.system },
    ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  let currentMessages = chatMessages;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const attemptStart = Date.now();
    console.log('[llm] Attempt %d/%d starting...', attempt, maxRetries);

    const requestBody = {
      model: opts.provider.model,
      messages: currentMessages,
      max_tokens: attempt === 1 ? 32768 : (attempt === 2 ? 32768 : 65536),
      temperature: attempt === 1 ? 0.7 : (attempt === 2 ? 0.5 : 0.3 + Math.random() * 0.1),
      stream: attempt === 1 || attempt === 2 ? true : false,
    };
    const requestJson = JSON.stringify(requestBody);
    console.log('[llm] Request: endpoint=%s model=%s payloadSize=%d messages=%d systemLength=%d',
      endpoint, opts.provider.model, requestJson.length, currentMessages.length, opts.system.length
    );
    if (attempt > 1) {
      opts.onLog?.('warn', `Attempt ${attempt}/${maxRetries} starting...`);
    }

    let content = '';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: requestJson,
        signal: AbortSignal.timeout(600_000),
      });

      const attemptDuration = Date.now() - attemptStart;
      console.log('[llm] Response headers received: status=%d duration=%dms', res.status, attemptDuration);

      if (!res.ok) {
        const responseText = await res.text();
        console.error('[llm] HTTP error %d: %s', res.status, responseText.slice(0, 500));
        throw new Error(`Provider HTTP ${res.status}: ${responseText.slice(0, 500)}`);
      }

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
          buffer = lines.pop() ?? '';
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
              } catch {
                // ignore partial SSE data parse errors
              }
            }
          }
        }
      } else {
        // Fallback: non-streaming response
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

      // === Multi-strategy JSON extraction ===
      const jsonStr = extractJsonFromContent(content);
      console.log('[llm] Best JSON candidate: length=%d', jsonStr.length);

      // Try parsing — with auto-repair fallback
      let parsedJson: unknown;
      let sanitizedStr = jsonStr;
      try {
        sanitizedStr = sanitizeJsonString(jsonStr);
        parsedJson = JSON.parse(sanitizedStr);
        console.log('[llm] JSON parse OK (first try after sanitize)');
      } catch (firstParseErr) {
        console.warn('[llm] JSON parse failed, attempting auto-repair...');
        console.warn('[llm]   Error: %s', firstParseErr instanceof Error ? firstParseErr.message : String(firstParseErr));
        try {
          const repaired = repairTruncatedJson(sanitizedStr);
          console.log('[llm] Repaired JSON length: %d (original: %d)', repaired.length, sanitizedStr.length);
          parsedJson = JSON.parse(repaired);
          console.log('[llm] JSON parse OK after repair');
        } catch {
          // Last resort: jsonrepair library (robust terhadap truncated/missing comma/quote)
          console.warn('[llm] Custom repair failed, trying jsonrepair library...');
          try {
            const libRepaired = jsonrepair(sanitizedStr);
            parsedJson = JSON.parse(libRepaired);
            console.log('[llm] JSON parse OK after jsonrepair (length=%d)', libRepaired.length);
          } catch (libRepairErr) {
            console.error('[llm] jsonrepair also failed:');
            console.error('[llm]   jsonStr preview (first 500): %s', sanitizedStr.slice(0, 500).replace(/\n/g, '\\n'));
            console.error('[llm]   jsonStr preview (last 200): %s', sanitizedStr.slice(-200).replace(/\n/g, '\\n'));
            throw new Error(`Response bukan JSON valid: ${libRepairErr instanceof Error ? libRepairErr.message : String(libRepairErr)}`);
          }
        }
      }

      // Normalize raw LLM output sebelum Zod (null→default, enum unknown→fallback, sfx array→string)
      parsedJson = normalizePromptPackage(parsedJson);

      // Validate with Zod
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
        if (categorized.category === 'VALIDATION' && err instanceof Error) {
          const zErr = err as Error & { issues?: unknown[] };
          const issues = zErr.issues ? JSON.stringify(zErr.issues) : err.message;
          const correctiveMessage = `Terdapat error validasi pada JSON sebelumnya. Perbaiki field berikut sesuai schema:\n${issues}\n\nPastikan output valid JSON.`;
          currentMessages = [
            ...currentMessages,
            { role: 'assistant', content: content || '...' },
            { role: 'user', content: correctiveMessage }
          ];
          opts.onLog?.('warn', `[VALIDATION] Attempt ${attempt} failed. Retrying with corrective prompt...`);
        } else {
          opts.onLog?.('error', `[${categorized.category}] Attempt ${attempt} failed: ${categorized.message}`);
        }

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

  const enhancedMessage = `[${finalCategorized.category}] ${finalCategorized.message}`;
  throw new Error(enhancedMessage);
}
