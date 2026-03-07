import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '12');
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    const authorId = searchParams.get('authorId');
    const search = searchParams.get('search');
    const admin = searchParams.get('admin') === 'true';
    const excludeId = searchParams.get('exclude');

    const skip = page * limit;

    const where: any = {};

    // If not admin view, only show published posts
    if (!admin) {
      where.status = 'PUBLISHED';
    } else if (status) {
      where.status = status.toUpperCase();
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (excludeId) {
      where.NOT = { id: excludeId };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          author: {
            select: { id: true, name: true },
          },
          tags: {
            include: {
              tag: {
                select: { id: true, name: true, slug: true },
              },
            },
          },
        },
        orderBy: admin ? { createdAt: 'desc' } : { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      db.post.count({ where }),
    ]);

    // Transform posts for response
    const transformedPosts = posts.map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      status: post.status,
      views: post.views,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      categoryId: post.categoryId,
      authorId: post.authorId,
      category: post.category,
      author: post.author,
      tags: post.tags.map((pt) => pt.tag),
    }));

    return NextResponse.json({
      posts: transformedPosts,
      total,
      hasMore: skip + posts.length < total,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil artikel' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create post
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, coverImage, categoryId, status, tagIds } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Judul dan slug wajib diisi' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingPost = await db.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan' },
        { status: 400 }
      );
    }

    const post = await db.post.create({
      data: {
        title,
        slug,
        content: content || '',
        excerpt,
        coverImage,
        categoryId,
        authorId: user.id,
        status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
        ...(tagIds && tagIds.length > 0
          ? {
              tags: {
                create: tagIds.map((tagId: string) => ({
                  tagId,
                })),
              },
            }
          : {}),
      },
      include: {
        category: true,
        author: {
          select: { id: true, name: true },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat artikel' },
      { status: 500 }
    );
  }
}
