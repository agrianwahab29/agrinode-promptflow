import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { getStoryboardSegmentByIndex } from '@/lib/db/repositories/storyboard-segment.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string; segmentIndex: string }> }) {
  const { id, segmentIndex } = await params;
  const projectId = Number(id);
  const segmentIdx = Number(segmentIndex);
  if (!Number.isFinite(projectId) || !Number.isFinite(segmentIdx)) {
    return errorResponse('VALIDATION_ERROR', 400, 'Invalid ids');
  }

  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const project = await getProjectById(projectId, userId);
  if (!project) return errorResponse('NOT_FOUND', 404, 'Project not found');

  const segment = await getStoryboardSegmentByIndex(projectId, segmentIdx);
  if (!segment) return errorResponse('NOT_FOUND', 404, 'Segment not found');

  return Response.json({ segment });
}
