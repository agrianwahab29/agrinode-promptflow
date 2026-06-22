import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse } from '@/lib/api/error';
import { softDeleteProject } from '@/lib/db/repositories/project.repo';

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  let body: { ids?: number[] };
  try {
    body = await req.json();
  } catch {
    return errorResponse('VALIDATION_ERROR', 400, 'Request body tidak valid');
  }

  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return errorResponse('VALIDATION_ERROR', 400, 'ids harus array number non-kosong');
  }
  if (ids.length > 100) {
    return errorResponse('VALIDATION_ERROR', 400, 'Maksimal 100 proyek sekaligus');
  }

  let deletedCount = 0;
  const errors: string[] = [];

  for (const id of ids) {
    if (typeof id !== 'number' || !Number.isFinite(id)) {
      errors.push(`ID ${id} tidak valid`);
      continue;
    }
    try {
      const ok = await softDeleteProject(id, userId);
      if (ok) deletedCount++;
      else errors.push(`ID ${id} tidak ditemukan atau bukan milik user`);
    } catch (err) {
      errors.push(`ID ${id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return NextResponse.json({
    deleted: deletedCount,
    requested: ids.length,
    errors: errors.length > 0 ? errors : undefined,
  });
}
