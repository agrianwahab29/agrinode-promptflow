import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { listImagePromptsByProject } from '@/lib/db/repositories/image-prompt.repo';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const proj = await getProjectById(id, userId);
  if (!proj) return errorResponse('NOT_FOUND', 404);
  const data = await listImagePromptsByProject(id);
  return successResponse(data);
}