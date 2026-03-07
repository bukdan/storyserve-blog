import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth/session';

// GET /api/ads/[id] - Get ad by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ad = await db.ad.findUnique({
      where: { id },
      include: {
        slot: {
          select: { id: true, name: true, position: true },
        },
      },
    });

    if (!ad) {
      return NextResponse.json({ error: 'Iklan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Get ad error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil iklan' },
      { status: 500 }
    );
  }
}

// PATCH /api/ads/[id] - Update ad
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const ad = await db.ad.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(ad);
  } catch (error) {
    console.error('Update ad error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengupdate iklan' },
      { status: 500 }
    );
  }
}

// DELETE /api/ads/[id] - Delete ad
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await db.ad.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete ad error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus iklan' },
      { status: 500 }
    );
  }
}
