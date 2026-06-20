import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import { resolve } from 'node:path';

// Load .env.local first, fallback to .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error('Missing TURSO_DATABASE_URL');
if (!authToken) throw new Error('Missing TURSO_AUTH_TOKEN');

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: { url, authToken },
  verbose: true,
  strict: true,
});
