'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  startDate: string;
  endDate: string;
  active: boolean;
  slot: { name: string; position: string } | null;
}

interface AdSlot {
  id: string;
  name: string;
  position: string;
}

export default function AdminAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    slotId: '',
    startDate: '',
    endDate: '',
  });

  const fetchData = async () => {
    const [adsRes, slotsRes] = await Promise.all([
      fetch('/api/ads?admin=true'),
      fetch('/api/ads/slots'),
    ]);
    if (adsRes.ok) {
      const adsData = await adsRes.json();
      setAds(adsData.ads || []);
    }
    if (slotsRes.ok) {
      const slotsData = await slotsRes.json();
      setSlots(slotsData.slots || []);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      }),
    });

    if (res.ok) {
      toast.success('Iklan ditambahkan');
      setShowForm(false);
      setForm({
        title: '',
        imageUrl: '',
        linkUrl: '',
        slotId: '',
        startDate: '',
        endDate: '',
      });
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Gagal menambahkan');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus iklan ini?')) return;
    const res = await fetch(`/api/ads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Iklan dihapus');
      fetchData();
    } else {
      toast.error('Gagal menghapus');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    const res = await fetch(`/api/ads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) {
      toast.success(active ? 'Iklan dinonaktifkan' : 'Iklan diaktifkan');
      fetchData();
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Iklan</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" /> Tambah Iklan
        </Button>
      </div>

      {/* Add ad form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card p-6 rounded-lg border border-border mb-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Judul Iklan</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Slot</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                value={form.slotId}
                onChange={(e) => setForm({ ...form, slotId: e.target.value })}
                required
              >
                <option value="">Pilih slot</option>
                {slots.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.name} ({slot.position})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>URL Gambar</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                required
              />
            </div>
            <div>
              <Label>URL Link</Label>
              <Input
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>
            <div>
              <Label>Tanggal Mulai</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Tanggal Selesai</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Simpan</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Batal
            </Button>
          </div>
        </form>
      )}

      {/* Ads list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map((ad) => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{ad.slot?.position || '-'}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(ad.startDate), 'dd/MM/yy')} -{' '}
                  {format(new Date(ad.endDate), 'dd/MM/yy')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={ad.active ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => handleToggleActive(ad.id, ad.active)}
                  >
                    {ad.active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Belum ada iklan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
