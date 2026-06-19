import { describe, it, expect } from 'vitest';

process.env.NEXTAUTH_SECRET = 'test-secret-min-32-chars-long-1234';
process.env.TURSO_DATABASE_URL = 'libsql://test';
process.env.TURSO_AUTH_TOKEN = 'test-token';
process.env.ENCRYPTION_KEY = Buffer.alloc(32, 1).toString('base64');

describe('auth module loads', () => {
  it('exports auth, handlers, signIn, signOut', async () => {
    const mod = await import('./config');
    expect(typeof mod.auth).toBe('function');
    expect(mod.handlers).toBeDefined();
    expect(typeof mod.signIn).toBe('function');
    expect(typeof mod.signOut).toBe('function');
  });
});
