import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { listProviderConfigs, toProviderConfigDTO } from '@/lib/db/repositories/provider-config.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; details?: unknown; error?: string }> = {};

  // 1. Auth
  let userId: number | null = null;
  try {
    const session = await auth();
    if (session?.user) {
      userId = (session.user as { id: number }).id;
      checks.auth = { status: 'ok', details: { userId } };
    } else {
      checks.auth = { status: 'fail', error: 'No session' };
      return NextResponse.json({ checks }, { status: 401 });
    }
  } catch (authErr) {
    checks.auth = { status: 'fail', error: authErr instanceof Error ? authErr.message : String(authErr) };
    return NextResponse.json({ checks }, { status: 500 });
  }

  // 2. DB
  try {
    const dbStart = Date.now();
    await db.run(sql`SELECT 1`);
    checks.db = { status: 'ok', details: { latencyMs: Date.now() - dbStart } };
  } catch (dbErr) {
    checks.db = { status: 'fail', error: dbErr instanceof Error ? dbErr.message : String(dbErr) };
    return NextResponse.json({ checks }, { status: 503 });
  }

  // 3. Provider configs
  try {
    const configs = await listProviderConfigs(userId);
    checks.providers = {
      status: configs.length > 0 ? 'ok' : 'warn',
      details: {
        count: configs.length,
        configs: configs.map((c) => {
          const dto = toProviderConfigDTO(c);
          return {
            id: dto.id,
            name: dto.name,
            provider: dto.provider,
            baseUrl: dto.baseUrl,
            model: dto.model,
            isActive: dto.isActive,
            apiKeyPresent: !!c.apiKeyEncrypted,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
          };
        }),
      },
    };
  } catch (provErr) {
    checks.providers = { status: 'fail', error: provErr instanceof Error ? provErr.message : String(provErr) };
  }

  // 4. Env vars
  checks.env = {
    status: 'ok',
    details: {
      TURSO_DATABASE_URL: !!process.env.TURSO_DATABASE_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NODE_ENV: process.env.NODE_ENV ?? 'unknown',
      VERCEL: process.env.VERCEL ?? '0',
      VERCEL_ENV: process.env.VERCEL_ENV ?? 'not-vercel',
    },
  };

  // 5. Timestamp
  checks.timestamp = { status: 'ok', details: { now: new Date().toISOString() } };

  return NextResponse.json({ checks });
}
