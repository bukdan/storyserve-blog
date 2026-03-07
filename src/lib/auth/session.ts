import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { User } from '@prisma/client';

const SESSION_COOKIE = 'blog_session';
const SALT_ROUNDS = 10;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'ADMIN' | 'AUTHOR';
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Create session
export async function createSession(userId: string): Promise<void> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Store session in cookie (simple approach for SQLite)
  const sessionData = JSON.stringify({ userId, sessionId, expiresAt: expiresAt.toISOString() });
  const encoded = Buffer.from(sessionData).toString('base64');

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });
}

// Get current user from session
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    if (!sessionCookie?.value) return null;

    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    const { userId, expiresAt } = sessionData;

    // Check if session expired
    if (new Date(expiresAt) < new Date()) {
      cookieStore.delete(SESSION_COOKIE);
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role as 'ADMIN' | 'AUTHOR',
    };
  } catch {
    return null;
  }
}

// Clear session
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN';
}

// Check if user is author or admin
export async function isAuthor(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'ADMIN' || user?.role === 'AUTHOR';
}
