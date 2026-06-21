import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { ThemePreferenceSchema } from '@/lib/validation/schemas';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { projects } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;
  const projectId = Number((await ctx.params).id);
  if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'ID tidak valid');
  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404);
  const raw = await req.json().catch(() => null);
  const parsed = ThemePreferenceSchema.safeParse(raw);
  if (!parsed.success)
    return errorResponse('VALIDATION_ERROR', 400, 'Theme tidak valid', { issues: parsed.error.issues });
  await db.update(projects).set({ themePreference: parsed.data }).where(eq(projects.id, projectId));
  return successResponse({ themePreference: parsed.data });
}
