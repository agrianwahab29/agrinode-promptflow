import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { CreateProjectInputSchema } from '@/lib/validation/schemas';
import { errorResponse, successResponse } from '@/lib/api/error';
import { createProject, listActiveProjects, toProjectDTO } from '@/lib/db/repositories/project.repo';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const page = Math.max(1, Number(req.nextUrl.searchParams.get('page') ?? '1'));
  const limit = Math.min(100, Math.max(1, Number(req.nextUrl.searchParams.get('limit') ?? '20')));
  const { data, total, totalPages } = await listActiveProjects({ userId, page, limit });
  return successResponse(data.map(toProjectDTO), 200, { pagination: { page, limit, total, totalPages } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const raw = await req.json().catch(() => null);
  const parsed = CreateProjectInputSchema.safeParse(raw);
  if (!parsed.success) return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  // Shorts > 180 -> 422 business rule
  if (parsed.data.durationType === 'shorts' && parsed.data.durationTargetSeconds > 180) {
    return errorResponse('VALIDATION_ERROR', 422, 'Shorts maksimal 180 detik', { field: 'durationTargetSeconds', max: 180 });
  }
  const created = await createProject({ userId, ...parsed.data });
  return successResponse(toProjectDTO(created), 201);
}