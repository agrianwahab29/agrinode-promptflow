import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { auth } from './config';

export const requireSession = cache(async (): Promise<{ id: number; email: string; name?: string | null }> => {
  const session = await auth();
  if (!session?.user) redirect('/id/login');
  const u = session.user as { id?: number; email?: string; name?: string | null };
  if (!u.id || !u.email) redirect('/id/login');
  return { id: u.id!, email: u.email!, name: u.name ?? null };
});

export const getOptionalSession = cache(async (): Promise<{ id: number; email: string; name?: string | null } | null> => {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as { id?: number; email?: string; name?: string | null };
  if (!u.id || !u.email) return null;
  return { id: u.id!, email: u.email!, name: u.name ?? null };
});
