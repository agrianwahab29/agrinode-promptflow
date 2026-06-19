# E2E Tests

These are minimal Playwright smoke placeholders. They are intentionally `test.skip`'d and DO NOT run in CI by default.

## Why skipped

E2E coverage here would require:

- A live Turso (libSQL) database reachable via `TURSO_DATABASE_URL`
- A running Next.js dev server with at least one configured AI provider key (OpenAI-compatible)
- A seeded user, valid `next-auth` session cookie, and `NEXTAUTH_SECRET`
- Test fixtures for `bcrypt`-hashed credentials and CSRF tokens

Without these, the smoke tests fail with connection errors rather than real assertion failures, which would block CI for non-environmental reasons.

## When to enable

To run these locally:

1. Copy `.env.example` to `.env.local` and fill in `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_SECRET`, and one provider key.
2. Run `pnpm db:push` to provision the schema.
3. Seed a test user (script TBD).
4. Remove the `test.skip` wrappers in `login.spec.ts`.
5. Run `pnpm test:e2e` (Playwright will auto-start `pnpm dev` via `playwright.config.ts`).

## Layout

- `login.spec.ts` — three placeholder smoke tests covering health, locale redirect, and login validation.
