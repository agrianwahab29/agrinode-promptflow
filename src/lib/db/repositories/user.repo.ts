import 'server-only';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { users, type User } from '@/lib/db/schema';

export async function findUserById(id: number): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return row ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return row ?? null;
}

export async function createUser(input: {
  email: string; name: string | null; passwordHash: string;
}): Promise<User> {
  const [row] = await db.insert(users).values(input).returning();
  if (!row) throw new Error('Failed to create user');
  return row;
}

export async function updateUserPassword(id: number, passwordHash: string): Promise<void> {
  await db.update(users).set({ passwordHash, updatedAt: Math.floor(Date.now() / 1000) }).where(eq(users.id, id));
}