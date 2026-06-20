import 'server-only';
import { z } from 'zod';
import { decryptFromString } from '@/lib/crypto/aes';
import { ClassificationResultSchema, type ClassificationResult } from '@/lib/validation/schemas';

const SIX_ROLE_VALUES = ['tokoh', 'background', 'prop', 'accessory', 'environment', 'other'] as const;

const SYSTEM_PROMPT = `Kamu adalah image classifier untuk pipeline animasi AI. Tugas: klasifikasikan gambar ke salah satu dari 6 role: ${SIX_ROLE_VALUES.join(', ')}.

ATURAN:
- tokoh: karakter utama/manusia/orang (orang nyata atau fiksi, biasanya wajah/badan dominan).
- background: latar/setting tempat (pemandangan, ruangan, gedung).
- prop: objek/benda yang digunakan karakter (senjata, alat, mainan, makanan).
- accessory: aksesoris karakter (kacamata, topi, perhiasan, tas).
- environment: elemen lingkungan non-latar (tanaman, langit, awan, batu).
- other: jika tidak masuk kategori di atas.

OUTPUT FORMAT: Hanya JSON valid, tanpa markdown wrapper, dengan field:
{ "role": "<salah satu dari 6>", "label": "<nama singkat, max 50 char>", "confidence": <0.0-1.0>, "description": "<penjelasan singkat, max 200 char>" }`;

export interface ClassifyOptions {
  imageBase64: string;
  mimeType: string;
  filename: string;
  maxRetries?: number;
}

export interface ClassifyResult extends ClassificationResult {
  raw: string;
}

export async function classifyImage(opts: ClassifyOptions): Promise<ClassifyResult> {
  const provider = (process.env.VISION_LLM_PROVIDER ?? 'openai') as 'openai' | 'google';
  const model = process.env.VISION_LLM_MODEL ?? 'gpt-4o';
  const baseUrl = process.env.VISION_LLM_BASE_URL ?? (provider === 'openai' ? 'https://api.openai.com' : 'https://generativelanguage.googleapis.com');
  const encryptedKey = process.env.VISION_LLM_API_KEY;
  if (!encryptedKey) throw new Error('Missing VISION_LLM_API_KEY');

  let apiKey = '';
  try {
    apiKey = decryptFromString(encryptedKey);
  } catch {
    // V2-A10: allow plain key (for dev) if not encrypted
    apiKey = encryptedKey;
  }

  const maxRetries = opts.maxRetries ?? 2;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = provider === 'openai'
        ? `${baseUrl.replace(/\/+$/, '')}/v1/chat/completions`
        : `${baseUrl.replace(/\/+$/, '')}/v1beta/models/${model}:generateContent`;

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

      const body = provider === 'openai'
        ? {
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: [
                { type: 'text', text: `Klasifikasikan file: ${opts.filename}` },
                { type: 'image_url', image_url: { url: `data:${opts.mimeType};base64,${opts.imageBase64}` } },
              ] },
            ],
            max_tokens: 500,
            temperature: 0.2,
          }
        : {
            contents: [{
              role: 'user',
              parts: [
                { text: `Klasifikasikan file: ${opts.filename}\n\n${SYSTEM_PROMPT}` },
                { inline_data: { mime_type: opts.mimeType, data: opts.imageBase64 } },
              ],
            }],
          };

      const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(30_000) });
      const text = await res.text();
      if (!res.ok) throw new Error(`Vision HTTP ${res.status}: ${text.slice(0, 200)}`);

      let content = '';
      try {
        const json = JSON.parse(text) as Record<string, unknown>;
        const choices = json.choices as Array<{ message?: { content?: string } }> | undefined;
        if (choices && choices[0]?.message?.content) {
          content = choices[0].message.content;
        } else {
          // Google Gemini response format
          const candidates = json.candidates as Array<{ content?: { parts?: Array<{ text?: string }> } }> | undefined;
          const firstParts = candidates && candidates[0]?.content?.parts;
          content = firstParts && firstParts[0]?.text ? firstParts[0].text : '';
        }
      } catch {
        throw new Error(`Vision response bukan JSON: ${text.slice(0, 200)}`);
      }

      if (!content) throw new Error('Vision response kosong');

      // Strip markdown wrapper
      let cleaned = content.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace >= 0 && lastBrace > firstBrace) cleaned = cleaned.slice(firstBrace, lastBrace + 1);

      const parsed = JSON.parse(cleaned) as unknown;
      const validated = ClassificationResultSchema.parse(parsed);
      return { ...validated, raw: content };
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoff = Math.min(2000 * 2 ** (attempt - 1), 8000);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastError ?? new Error('Classification failed');
}

// batch wrapper: process up to `max` in parallel
export async function classifyBatch(
  items: ClassifyOptions[],
  max: number = 5,
): Promise<Array<{ filename: string; ok: true; result: ClassifyResult } | { filename: string; ok: false; error: string }>> {
  const slice = items.slice(0, max);
  return Promise.all(slice.map(async (it) => {
    try {
      const r = await classifyImage(it);
      return { filename: it.filename, ok: true, result: r };
    } catch (e) {
      return { filename: it.filename, ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }));
}

// schema for the public classify endpoint response
export const ClassifyRequestSchema = z.object({
  assetReferenceId: z.number().int().positive(),
});
