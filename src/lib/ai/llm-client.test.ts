import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generatePromptPackage, categorizeError } from './llm-client';

const mockProvider = {
  provider: 'custom' as const,
  name: 'Test',
  baseUrl: 'http://localhost:11434',
  model: 'test-model',
  apiKeyEncrypted: '',
};

const mockSystem = 'system';
const mockMessages = [{ role: 'user' as const, content: 'user message' }];

// A valid, minimal prompt package matching PromptPackageSchema
const validResponse = {
  title: "Test",
  duration_target: { type: "shorts", seconds: 60 },
  style: { type: "3D", aspect_ratio: "16:9" },
  character_profiles: [],
  scenes: [
    {
      order: 1,
      description: "Scene 1",
      voiceover_script: "Hello",
      voiceover_speaker: "narrator",
      transition_type: "fade_in",
      transition_duration_ms: 1000,
      transition_easing: "linear",
      transition_direction: "forward",
      voice_type: "narrator",
      voice_emotion: "neutral",
      voice_speed: 1.0,
      voice_pitch: "auto",
      duration_seconds: 5,
      scene_pacing: "normal",
      scene_mood: "cheerful",
      image_prompts: { characters: [], backgrounds: [] },
      audio_specs: []
    }
  ],
  image_prompts: { characters: [], backgrounds: [] },
  supporting_characters: [],
  moral_message: "Test"
};

const validResponseJson = JSON.stringify(validResponse);

describe('llm-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('categorizeError works correctly', () => {
    expect(categorizeError(new Error('timeout')).category).toBe('TIMEOUT');
    expect(categorizeError(new Error('fetch failed')).category).toBe('NETWORK');
    expect(categorizeError(new Error('JSON.parse')).category).toBe('JSON_PARSE');
  });

  it('handles valid JSON correctly on first attempt', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => JSON.stringify({ choices: [{ message: { content: validResponseJson } }] })
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generatePromptPackage({
      provider: mockProvider,
      system: mockSystem,
      messages: mockMessages,
      maxRetries: 1
    });

    expect(result.title).toBe('Test');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('repairs sfx array vs string (Validation handled by normalizer, but tests JSON string sanitize: raw newline)', async () => {
    const rawNewlineStr = validResponseJson.replace('"Hello"', '"Hello\nWorld"');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => JSON.stringify({ choices: [{ message: { content: rawNewlineStr } }] })
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generatePromptPackage({
      provider: mockProvider,
      system: mockSystem,
      messages: mockMessages,
      maxRetries: 1
    });

    expect(result.scenes[0]?.voiceover_script).toBe('Hello\nWorld');
  });

  it('repairs truncated JSON (unterminated string and missing brackets)', async () => {
    // Deliberately cut the JSON off inside the moral_message string ("Test"}) -> ("T")
    const truncatedStr = validResponseJson.slice(0, validResponseJson.length - 4);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => JSON.stringify({ choices: [{ message: { content: truncatedStr } }] })
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generatePromptPackage({
      provider: mockProvider,
      system: mockSystem,
      messages: mockMessages,
      maxRetries: 1
    });
    
    // As long as it parses successfully and isn't throwing JSON error
    expect(result.title).toBe('Test');
  });

  it('handles control characters and trailing data', async () => {
    const dirtyJson = validResponseJson + '   \n  \u0000 \u001F  Trailing garbage here...';
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers(),
      text: async () => JSON.stringify({ choices: [{ message: { content: dirtyJson } }] })
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generatePromptPackage({
      provider: mockProvider,
      system: mockSystem,
      messages: mockMessages,
      maxRetries: 1
    });

    expect(result.title).toBe('Test');
  });

  it('retries with corrective prompt on VALIDATION error', async () => {
    // Missing required fields
    const invalidJson = JSON.stringify({ title: "Test" });
    
    let attempt = 0;
    const fetchMock = vi.fn().mockImplementation(async (url, init) => {
      attempt++;
      if (attempt === 1) {
        return {
          ok: true,
          headers: new Headers(),
          text: async () => JSON.stringify({ choices: [{ message: { content: invalidJson } }] })
        };
      } else {
        // Assert that the request body in attempt 2 has the corrective message
        const body = JSON.parse(init.body);
        expect(body.messages[body.messages.length - 1].content).toContain('error validasi pada JSON');
        
        return {
          ok: true,
          headers: new Headers(),
          text: async () => JSON.stringify({ choices: [{ message: { content: validResponseJson } }] })
        };
      }
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await generatePromptPackage({
      provider: mockProvider,
      system: mockSystem,
      messages: mockMessages,
      maxRetries: 2
    });

    expect(result.title).toBe('Test');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
