import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/id/login', error: '/id/login' },
  providers: [], // empty in Edge; full providers in server config
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

// Edge-safe auth — no server-only, no Node.js deps.
// Used by middleware.ts for session validation on Edge runtime.
const edgeAuth = NextAuth(authConfig);
export const auth = edgeAuth.auth;
