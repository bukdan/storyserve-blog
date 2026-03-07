import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/users/[id] - Get user profile
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      postCount: user._count.posts,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}
