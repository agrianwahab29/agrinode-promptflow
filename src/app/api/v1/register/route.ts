import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { findUserByEmail, createUser } from '@/lib/db/repositories/user.repo';
import { errorResponse, successResponse } from '@/lib/api/error';

export const runtime = 'nodejs';

const RegisterInputSchema = z.object({
  email: z.string().email().max(200).transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: NextRequest) {
  const raw = await req.json().catch(() => null);
  const parsed = RegisterInputSchema.safeParse(raw);
  if (!parsed.success) {
    return errorResponse('VALIDATION_ERROR', 400, 'Input tidak valid', { issues: parsed.error.issues });
  }
  const existing = await findUserByEmail(parsed.data.email);
  if (existing) {
    return errorResponse('CONFLICT', 409, 'Email sudah terdaftar', { field: 'email' });
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await createUser({
    email: parsed.data.email,
    name: parsed.data.name ?? null,
    passwordHash,
  });
  return successResponse({
    id: user.id,
    email: user.email,
    name: user.name,
  }, 201);
}