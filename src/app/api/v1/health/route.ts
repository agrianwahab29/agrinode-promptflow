import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db/client';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await db.run(sql`SELECT 1`);
    return NextResponse.json({ data: { status: 'ok', db: 'ok', time: new Date().toISOString() } });
  } catch {
    return NextResponse.json({ data: { status: 'degraded', db: 'fail', time: new Date().toISOString() } }, { status: 503 });
  }
}