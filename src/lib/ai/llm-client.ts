import 'server-only';
import { generateObject, type LanguageModelV1 } from 'ai';
import { PromptPackageSchema, type PromptPackage } from '@/lib/validation/schemas';
import { buildProvider, type ProviderConfigInput } from './provider-registry';

export interface GenerateOptions {
  provider: ProviderConfigInput;
  system: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  maxRetries?: number;
}

export async function generatePromptPackage(opts: GenerateOptions): Promise<PromptPackage> {
  const model = buildProvider(opts.provider) as unknown as LanguageModelV1;
  const maxRetries = opts.maxRetries ?? 3;
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateObject({
        model,
        schema: PromptPackageSchema,
        system: opts.system,
        messages: opts.messages,
      });
      return result.object;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoff = Math.min(2000 * 2 ** (attempt - 1), 8000);
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }
  throw lastError ?? new Error('Generation failed');
}
