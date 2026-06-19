import 'server-only';
import { NextResponse } from 'next/server';
import type { NextResponse as NextResponseType } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { ErrorCodeEnum } from '@/lib/validation/schemas';

type ErrorCode = z.infer<typeof ErrorCodeEnum>;

export function errorResponse(
  code: ErrorCode,
  status: number,
  message?: string,
  details?: Record<string, unknown>,
): NextResponseType {
  return NextResponse.json(
    { error: { code, message: message ?? defaultMessage(code), details }, traceId: randomUUID() },
    { status },
  );
}

export function defaultMessage(code: string): string {
  switch (code) {
    case 'VALIDATION_ERROR': return 'Input tidak valid';
    case 'UNAUTHORIZED': return 'Sesi tidak valid';
    case 'FORBIDDEN': return 'Akses ditolak';
    case 'NOT_FOUND': return 'Resource tidak ditemukan';
    case 'CONFLICT': return 'Konflik data';
    case 'RATE_LIMITED': return 'Terlalu banyak request';
    case 'PROVIDER_ERROR': return 'Provider LLM gagal';
    case 'TIMEOUT': return 'Request timeout';
    case 'INTERNAL': return 'Kesalahan internal server';
    case 'BAD_GATEWAY': return 'Service eksternal gagal';
    case 'SERVICE_UNAVAILABLE': return 'Layanan tidak tersedia';
    default: return 'Error';
  }
}

export function successResponse<T>(data: T, status = 200, meta?: { pagination?: { page: number; limit: number; total: number; totalPages: number } }): NextResponseType {
  return NextResponse.json(meta ? { data, pagination: meta.pagination } : { data }, { status });
}

export function noContentResponse(): NextResponseType {
  return new NextResponse(null, { status: 204 });
}
