import 'server-only';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { decryptFromString } from '@/lib/crypto/aes';

export interface ProviderConfigInput {
  provider: string;
  baseUrl: string;
  model: string;
  apiKeyEncrypted: string | null;
}

const PROVIDER_PRESETS: Record<string, string> = {
  ollama: 'https://ollama.com/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  '9router': 'http://localhost:20128/v1',
};

export function getDefaultBaseUrl(provider: string): string {
  return PROVIDER_PRESETS[provider] ?? '';
}

// ReturnType workaround for AI SDK v4/v6 type incompatibility
type BuiltProviderModel = ReturnType<ReturnType<typeof createOpenAICompatible>>;

export function buildProvider(cfg: ProviderConfigInput): BuiltProviderModel {
  let apiKey = '';
  if (cfg.apiKeyEncrypted) {
    try {
      apiKey = decryptFromString(cfg.apiKeyEncrypted);
    } catch {
      apiKey = '';
    }
  }
  const headers: Record<string, string> = {};
  if (cfg.provider === 'openrouter') {
    const referer = process.env.NEXT_PUBLIC_APP_URL ?? 'https://promptflow.app';
    headers['HTTP-Referer'] = referer;
    headers['X-OpenRouter-Title'] = 'PromptFlow';
  }
  const provider = createOpenAICompatible({
    name: cfg.provider,
    apiKey,
    baseURL: cfg.baseUrl,
    headers,
  });
  return provider(cfg.model);
}

export { PROVIDER_PRESETS };
