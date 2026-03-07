import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/ads/slots - List all ad slots
export async function GET() {
  try {
    const slots = await db.adSlot.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Get ad slots error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil slot iklan' },
      { status: 500 }
    );
  }
}

// POST /api/ads/slots - Create ad slot
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, position, size } = body;

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
  } catch (error) {
    console.error('Create ad slot error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat slot iklan' },
      { status: 500 }
    );
  }
}
