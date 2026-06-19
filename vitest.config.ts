import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { writeFileSync, mkdirSync } from 'node:fs';

// Create server-only no-op stub for vitest
const stubDir = path.resolve(__dirname, 'tests/stubs');
try { mkdirSync(stubDir, { recursive: true }); } catch {}
writeFileSync(path.join(stubDir, 'server-only.ts'), 'export {};\n');

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'e2e'],
    server: {
      deps: {
        inline: ['next-auth', '@auth/core', 'next/server', 'next/headers'],
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/app/api/**'],
      exclude: ['**/*.test.ts', 'src/components/ui/**'],
      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'server-only': path.resolve(stubDir, 'server-only.ts'),
    },
  },
});
