import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { UpdateProjectInputSchema } from '@/lib/validation/schemas';
import { errorResponse, successResponse, noContentResponse } from '@/lib/api/error';
import { getProjectById, softDeleteProject, toProjectDTO, updateProjectMeta } from '@/lib/db/repositories/project.repo';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const row = await getProjectById(id, userId);
  if (!row) return errorResponse('NOT_FOUND', 404);
  return successResponse(toProjectDTO(row));
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const raw = await req.json().catch(() => null);
  const parsed = UpdateProjectInputSchema.safeParse(raw);
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  const updated = await updateProjectMeta(id, userId, parsed.data);
  if (!updated) return errorResponse('NOT_FOUND', 404);
  return successResponse(toProjectDTO(updated));
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const id = Number((await ctx.params).id);
  if (!Number.isFinite(id)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const ok = await softDeleteProject(id, userId);
  if (!ok) return errorResponse('NOT_FOUND', 404);
  return noContentResponse();
}