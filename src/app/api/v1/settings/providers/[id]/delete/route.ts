import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { deleteProviderConfig } from '@/lib/db/repositories/provider-config.repo';

export const runtime = 'nodejs';

export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const ok = await deleteProviderConfig(id, userId);
  if (!ok) return errorResponse('NOT_FOUND', 404);
  return NextResponse.redirect(new URL('/id/settings', _req.nextUrl.origin));
}
