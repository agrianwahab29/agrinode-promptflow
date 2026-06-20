import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth/config';
import { errorResponse, successResponse, noContentResponse } from '@/lib/api/error';
import { getProjectById } from '@/lib/db/repositories/project.repo';
import { createAssetReference, deleteAssetReference, getAssetReferenceByFilename } from '@/lib/db/repositories/asset-reference.repo';
import { uploadReference, deleteReference } from '@/lib/storage/blob';
import { AssetRoleEnum } from '@/lib/validation/schemas';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = /^image\/(png|jpe?g|gif|webp|svg\+xml)$/;
const VALID_ROLES = AssetRoleEnum.options; // V2: 6-tipe

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const form = await req.formData().catch(() => null);
  if (!form) return errorResponse('VALIDATION_ERROR', 400, 'multipart/form-data wajib');

  // V2: projectId is optional (upload at generate page before project exists)
  const url = new URL(req.url);
  const projectIdRaw = url.searchParams.get('projectId') ?? form.get('projectId');
  let projectId: number | null = null;
  if (projectIdRaw !== null && projectIdRaw !== '') {
    projectId = Number(projectIdRaw);
    if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'projectId tidak valid');
    const proj = await getProjectById(projectId, userId);
    if (!proj) return errorResponse('NOT_FOUND', 404, 'Project tidak ditemukan');
  }

  const file = form.get('file');
  const tipe = form.get('tipe');
  const label = form.get('label');
  if (!(file instanceof File)) return errorResponse('VALIDATION_ERROR', 400, 'field `file` wajib');

  // V2: validate against 6-tipe enum
  if (typeof tipe !== 'string' || !VALID_ROLES.includes(tipe as typeof VALID_ROLES[number])) {
    return errorResponse('VALIDATION_ERROR', 400, `tipe harus salah satu dari: ${VALID_ROLES.join(', ')}`);
  }
  if (!ALLOWED_MIME.test(file.type)) return errorResponse('VALIDATION_ERROR', 400, 'mime harus image/*', { mime: file.type });
  if (file.size > MAX_SIZE) return errorResponse('VALIDATION_ERROR', 400, `Ukuran file > ${MAX_SIZE / 1024 / 1024}MB`, { size: file.size });

  const upload = await uploadReference(file, file.name);
  const ref = await createAssetReference({
    projectId: projectId ?? 0, // V2: 0 = orphaned, will be attached to project at generate time
    tipe,
    filename: upload.filename,
    blobUrl: upload.url,
    label: typeof label === 'string' ? label : null,
    mimeType: file.type,
    sizeBytes: file.size,
  });
  return successResponse({
    id: ref.id,
    filename: ref.filename,
    url: ref.blobUrl,
    tipe: ref.tipe,
    label: ref.label,
    projectId: ref.projectId,
    mimeType: ref.mimeType,
    sizeBytes: ref.sizeBytes,
  }, 201);
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return errorResponse('UNAUTHORIZED', 401);
  const userId = (session.user as { id: number }).id;

  const url = new URL(req.url);
  const projectId = Number(url.searchParams.get('projectId'));
  const filename = url.searchParams.get('name');
  if (!Number.isFinite(projectId)) return errorResponse('VALIDATION_ERROR', 400, 'projectId query param wajib');
  if (!filename) return errorResponse('VALIDATION_ERROR', 400, 'name query param wajib');

  const proj = await getProjectById(projectId, userId);
  if (!proj) return errorResponse('NOT_FOUND', 404);

  const ref = await getAssetReferenceByFilename(projectId, filename);
  if (!ref) return errorResponse('NOT_FOUND', 404);

  await deleteReference(ref.blobUrl, ref.filename);
  await deleteAssetReference(projectId, filename);
  return noContentResponse();
}
