import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get all relevant data
    const [impressions, clicks, ads, slots, posts, comments] = await Promise.all([
      db.adImpression.findMany({
        where: { createdAt: { gte: since } },
        select: { adId: true, createdAt: true },
      }),
      db.adClick.findMany({
        where: { createdAt: { gte: since } },
        select: { adId: true, createdAt: true },
      }),
      db.ad.findMany({
        select: { id: true, title: true, slotId: true },
      }),
      db.adSlot.findMany({
        select: { id: true, name: true, position: true },
      }),
      db.post.findMany({
        select: { views: true },
      }),
      db.comment.count(),
    ]);

    // Calculate totals
    const totalImpressions = impressions.length;
    const totalClicks = clicks.length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);

    // Per ad stats
    const adStatsMap = new Map<string, { title: string; impressions: number; clicks: number }>();
    ads.forEach((ad) => adStatsMap.set(ad.id, { title: ad.title, impressions: 0, clicks: 0 }));
    impressions.forEach((i) => {
      const stat = adStatsMap.get(i.adId);
      if (stat) stat.impressions++;
    });
    clicks.forEach((c) => {
      const stat = adStatsMap.get(c.adId);
      if (stat) stat.clicks++;
    });

    // Per slot stats
    const slotStatsMap = new Map<string, { name: string; impressions: number; clicks: number }>();
    slots.forEach((s) => slotStatsMap.set(s.id, { name: `${s.name} (${s.position})`, impressions: 0, clicks: 0 }));
    const adToSlotMap = new Map<string, string>();
    ads.forEach((ad) => adToSlotMap.set(ad.id, ad.slotId));
    impressions.forEach((i) => {
      const slotId = adToSlotMap.get(i.adId);
      if (slotId) {
        const stat = slotStatsMap.get(slotId);
        if (stat) stat.impressions++;
      }
    });
    clicks.forEach((c) => {
      const slotId = adToSlotMap.get(c.adId);
      if (slotId) {
        const stat = slotStatsMap.get(slotId);
        if (stat) stat.clicks++;
      }
    });

    // Daily stats
    const dailyMap = new Map<string, { date: string; impressions: number; clicks: number }>();
    for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, impressions: 0, clicks: 0 });
    }
    impressions.forEach((i) => {
      const key = i.createdAt.toISOString().slice(0, 10);
      const day = dailyMap.get(key);
      if (day) day.impressions++;
    });
    clicks.forEach((c) => {
      const key = c.createdAt.toISOString().slice(0, 10);
      const day = dailyMap.get(key);
      if (day) day.clicks++;
    });

    return NextResponse.json({
      totals: {
        impressions: totalImpressions,
        clicks: totalClicks,
        views: totalViews,
        comments,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      },
      adStats: Array.from(adStatsMap.values()).map((a) => ({
        ...a,
        ctr: a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(1) : '0',
      })),
      slotStats: Array.from(slotStatsMap.values()).map((s) => ({
        ...s,
        ctr: s.impressions > 0 ? ((s.clicks / s.impressions) * 100).toFixed(1) : '0',
      })),
      dailyStats: Array.from(dailyMap.values()),
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil analytics' },
      { status: 500 }
    );
  }
}
