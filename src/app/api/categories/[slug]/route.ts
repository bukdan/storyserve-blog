import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/categories/[slug] - Get category by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const category = await db.category.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...category,
      postCount: category._count.posts,
    });
  } catch (error) {
    console.error('Get category error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil kategori' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[slug] - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;

    const category = await db.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    await db.category.delete({
      where: { id: category.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus kategori' },
      { status: 500 }
    );
  }
}
