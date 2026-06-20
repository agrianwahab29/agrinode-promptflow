import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe auth config — no NextAuth() instantiation here.
 * Middleware uses `getToken` from `next-auth/jwt` (jose-based, Edge-compatible).
 * Server-side config (src/lib/auth/config.ts) extends this with providers.
 */
export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/id/login', error: '/id/login' },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.userId = Number(user.id);
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.userId === 'number') {
        (session.user as { id?: number }).id = token.userId;
      }
      return session;
    },
  },
};