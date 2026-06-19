import 'server-only';
import { PromptPackageSchema, type PromptPackage } from '@/lib/validation/schemas';

export function parsePromptPackage(raw: unknown): PromptPackage {
  return PromptPackageSchema.parse(raw);
}

export function safeParsePromptPackage(raw: unknown): { ok: true; data: PromptPackage } | { ok: false; error: string } {
  const r = PromptPackageSchema.safeParse(raw);
  if (r.success) return { ok: true, data: r.data };
  return { ok: false, error: r.error.message };
}

export function tryExtractJson(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to find JSON object in text
    const m = trimmed.match(/\{[\s\S]*\}/);
    if (m) {
      try { return JSON.parse(m[0]!); } catch { return null; }
    }
    return null;
  }
}
