import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/tags - List tags
export async function GET() {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json(
      tags.map((tag) => ({
        ...tag,
        postCount: tag._count.posts,
      }))
    );
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil tag' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create tag
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, slug } = await request.json();

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Nama dan slug wajib diisi' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingTag = await db.tag.findUnique({
      where: { slug },
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan' },
        { status: 400 }
      );
    }

    const tag = await db.tag.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
      },
    });

    return NextResponse.json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat tag' },
      { status: 500 }
    );
  }
}
