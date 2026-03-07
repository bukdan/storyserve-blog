import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/ads - List ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get('position');
    const admin = searchParams.get('admin') === 'true';

    // For public requests, only show active ads
    if (!admin && position) {
      const now = new Date();
      const ad = await db.ad.findFirst({
        where: {
          active: true,
          slot: {
            position,
          },
          startDate: { lte: now },
          endDate: { gte: now },
        },
        include: {
          slot: {
            select: { id: true, name: true, position: true },
          },
        },
      });

      if (ad) {
        // Track impression
        await db.adImpression.create({
          data: { adId: ad.id },
        });
      }

      return NextResponse.json({ ad });
    }

    // Admin: get all ads and slots
    const [ads, slots] = await Promise.all([
      db.ad.findMany({
        include: {
          slot: {
            select: { id: true, name: true, position: true },
          },
          _count: {
            select: { clicks: true, impressions: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.adSlot.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      ads: ads.map((ad) => ({
        ...ad,
        clickCount: ad._count.clicks,
        impressionCount: ad._count.impressions,
      })),
      slots,
    });
  } catch (error) {
    console.error('Get ads error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil iklan' },
      { status: 500 }
    );
  }
}

// POST /api/ads - Create ad or slot
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'slot') {
      const { name, position, size } = data;

      if (!name || !position || !size) {
        return NextResponse.json(
          { error: 'Nama, position, dan size wajib diisi' },
          { status: 400 }
        );
      }

      const slot = await db.adSlot.create({
        data: {
          name: name.trim(),
          position: position.trim(),
          size: size.trim(),
        },
      });

      return NextResponse.json(slot);
    } else {
      // Create ad
      const { title, imageUrl, linkUrl, slotId, startDate, endDate } = data;

      if (!title || !imageUrl || !linkUrl || !slotId || !startDate || !endDate) {
        return NextResponse.json(
          { error: 'Semua field wajib diisi' },
          { status: 400 }
        );
      }

      const ad = await db.ad.create({
        data: {
          title: title.trim(),
          imageUrl,
          linkUrl,
          slotId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        include: {
          slot: true,
        },
      });

      return NextResponse.json(ad);
    }
  } catch (error) {
    console.error('Create ad error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat iklan' },
      { status: 500 }
    );
  }
}
