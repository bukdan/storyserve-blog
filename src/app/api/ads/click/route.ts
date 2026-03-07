import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/ads/click - Track ad click
export async function POST(request: NextRequest) {
  try {
    const { adId } = await request.json();

    if (!adId) {
      return NextResponse.json({ error: 'Ad ID wajib diisi' }, { status: 400 });
    }

    await db.adClick.create({
      data: { adId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track ad click error:', error);
    return NextResponse.json({ success: true }); // Don't fail on tracking error
  }
}
