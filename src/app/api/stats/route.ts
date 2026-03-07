import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/stats - Get dashboard stats
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [postsCount, commentsCount, adsCount, viewsData] = await Promise.all([
      db.post.count(),
      db.comment.count(),
      db.ad.count({ where: { active: true } }),
      db.post.findMany({
        select: { views: true },
      }),
    ]);

    const totalViews = viewsData.reduce((sum, p) => sum + (p.views || 0), 0);

    return NextResponse.json({
      posts: postsCount,
      comments: commentsCount,
      views: totalViews,
      ads: adsCount,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil statistik' },
      { status: 500 }
    );
  }
}
