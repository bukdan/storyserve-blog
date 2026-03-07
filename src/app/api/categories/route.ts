import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/categories - List categories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json(
      categories.map((cat) => ({
        ...cat,
        postCount: cat._count.posts,
      }))
    );
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil kategori' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create category
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
    const existingCategory = await db.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan' },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat kategori' },
      { status: 500 }
    );
  }
}
