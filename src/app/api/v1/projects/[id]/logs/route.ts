import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { listGenerationLogs } from '@/lib/db/repositories/generation-log.repo';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const proj = await getProjectById(id, userId);
  if (!proj) return errorResponse('NOT_FOUND', 404);
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '20')));
  const { data, total, totalPages } = await listGenerationLogs({ projectId: id, page, limit });
  return successResponse(data, 200, { pagination: { page, limit, total, totalPages } });
}