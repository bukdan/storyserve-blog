import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/posts/[slug] - Get post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await db.post.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    // Increment views for published posts
    if (post.status === 'PUBLISHED') {
      await db.post.update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      });
    }

    return NextResponse.json({
      post: {
        ...post,
        tags: post.tags.map((pt) => pt.tag),
      },
      comments: post.comments,
    });
  } catch (error) {
    console.error('Get post error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil artikel' },
      { status: 500 }
    );
  }
}

// PUT /api/posts/[slug] - Update post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, newSlug, content, excerpt, coverImage, categoryId, status, tagIds } = body;

    const existingPost = await db.post.findUnique({
      where: { slug },
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    // Check if new slug already exists (if changing slug)
    if (newSlug && newSlug !== slug) {
      const slugExists = await db.post.findUnique({
        where: { slug: newSlug },
      });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan' },
          { status: 400 }
        );
      }
    }

    // Update post
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (newSlug !== undefined) updateData.slug = newSlug;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (status !== undefined) {
      updateData.status = status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
      if (status === 'PUBLISHED' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await db.post.update({
      where: { id: existingPost.id },
      data: updateData,
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Delete existing tags
      await db.postTag.deleteMany({
        where: { postId: post.id },
      });

      // Create new tags
      if (tagIds.length > 0) {
        await db.postTag.createMany({
          data: tagIds.map((tagId: string) => ({
            postId: post.id,
            tagId,
          })),
        });
      }
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate artikel' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[slug] - Delete post
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

    const post = await db.post.findUnique({
      where: { slug },
    });

    if (!post) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    // Delete post (cascade will handle related records)
    await db.post.delete({
      where: { id: post.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus artikel' },
      { status: 500 }
    );
  }
}
