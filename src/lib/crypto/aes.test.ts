import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt, maskApiKey, encryptToString, decryptFromString } from './aes';

describe('aes crypto', () => {
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64');
  });

  it('round-trip encrypt/decrypt', () => {
    const plain = 'sk-or-v1-abc12345xyz';
    const enc = encrypt(plain);
    expect(enc.iv).toMatch(/^[0-9a-f]+$/);
    expect(enc.ciphertext).toMatch(/^[0-9a-f]+$/);
    expect(enc.tag).toMatch(/^[0-9a-f]+$/);
    expect(enc.ciphertext).not.toContain(plain);
    expect(decrypt(enc)).toBe(plain);
  });

  it('different IV per call', () => {
    const a = encrypt('hello');
    const b = encrypt('hello');
    expect(a.ciphertext).not.toBe(b.ciphertext);
    expect(a.iv).not.toBe(b.iv);
  });

  it('string serialization round-trip', () => {
    const plain = 'sk-test-1234';
    const serialized = encryptToString(plain);
    expect(decryptFromString(serialized)).toBe(plain);
  });

  it('maskApiKey: long key shows last 4', () => {
    expect(maskApiKey('sk-or-v1-abcde12345')).toBe('****2345');
  });

  it('maskApiKey: short key fully masked', () => {
    expect(maskApiKey('ab')).toBe('****');
    expect(maskApiKey('')).toBe('');
  });
});
