import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse } from '@/lib/api/error';
import { getDashboardStats } from '@/lib/db/repositories/dashboard.repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const stats = await getDashboardStats(userId);
  return successResponse(stats);
}
