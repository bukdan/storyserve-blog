import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: 'AUTHOR',
      },
    });

    // Create profile
    await db.profile.create({
      data: {
        userId: user.id,
        name: user.name,
      },
    });

    // Create user role
    await db.userRole.create({
      data: {
        userId: user.id,
        role: 'AUTHOR',
      },
    });

    // Create session
    await createSession(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mendaftar' },
      { status: 500 }
    );
  }
}
