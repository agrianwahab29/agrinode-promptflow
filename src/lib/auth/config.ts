import 'server-only';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById } from '@/lib/db/repositories/user.repo';
import { authConfig } from '@/lib/auth/edge';

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) throw new Error('Missing NEXTAUTH_SECRET');

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? '').trim().toLowerCase();
        const password = String(creds?.password ?? '');
        console.log('[auth] authorize called, email:', email);
        if (!email || !password) {
          console.log('[auth] missing email/password');
          return null;
        }
        const user = await findUserByEmail(email);
        console.log('[auth] user found:', user ? user.id : 'NOT FOUND');
        if (!user) return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        console.log('[auth] bcrypt.compare result:', ok);
        if (!ok) return null;
        return { id: String(user.id), email: user.email, name: user.name ?? user.email };
      },
    }),
  ],
});

// Augment Session to include user.id (number)
// Note: JWT augmentation not strictly required; we cast at usage sites.
declare module 'next-auth' {
  interface Session {
    user: {
      id?: number;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

export async function getSessionUser(): Promise<{ id: number; email: string; name?: string | null } | null> {
  const session = await auth();
  if (!session?.user) return null;
  const u = session.user as { id?: number; email?: string; name?: string | null };
  if (!u.id || !u.email) return null;
  // Re-fetch fresh record by id
  const fresh = await findUserById(u.id);
  if (!fresh) return null;
  return { id: fresh.id, email: fresh.email, name: fresh.name };
}
