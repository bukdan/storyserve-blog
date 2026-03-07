import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/tags/[slug] - Get tag by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const tag = await db.tag.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      ...tag,
      postCount: tag._count.posts,
    });
  } catch (error) {
    console.error('Get tag error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil tag' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[slug] - Delete tag
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

    const tag = await db.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      return NextResponse.json({ error: 'Tag tidak ditemukan' }, { status: 404 });
    }

    // Delete related post_tags first
    await db.postTag.deleteMany({
      where: { tagId: tag.id },
    });

    await db.tag.delete({
      where: { id: tag.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete tag error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus tag' },
      { status: 500 }
    );
  }
}
