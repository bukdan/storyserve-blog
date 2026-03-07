import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/comments - List comments (with optional postId filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    const where: any = {};
    if (postId) {
      where.postId = postId;
    }

    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil komentar' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, name, email, message } = body;

    if (!postId || !name || !message) {
      return NextResponse.json(
        { error: 'Post ID, nama, dan pesan wajib diisi' },
        { status: 400 }
      );
    }

    // Check if post exists
    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Artikel tidak ditemukan' },
        { status: 404 }
      );
    }

    const comment = await db.comment.create({
      data: {
        postId,
        name: name.trim(),
        email: email?.trim() || null,
        message: message.trim(),
      },
    });

    // Get all comments for this post
    const comments = await db.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ comment, comments });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengirim komentar' },
      { status: 500 }
    );
  }
}
