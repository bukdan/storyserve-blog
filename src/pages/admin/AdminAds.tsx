import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminAds = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [slotForm, setSlotForm] = useState({ name: '', position: '', size: '' });
  const [adForm, setAdForm] = useState({ title: '', image_url: '', link_url: '', slot_id: '', start_date: '', end_date: '' });

  const fetchData = async () => {
    const [slotsRes, adsRes] = await Promise.all([
      supabase.from('ad_slots').select('*').order('name'),
      supabase.from('ads').select('*, ad_slots(name, position)').order('created_at', { ascending: false }),
    ]);
    if (slotsRes.data) setSlots(slotsRes.data);
    if (adsRes.data) setAds(adsRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const addSlot = async () => {
    if (!slotForm.name || !slotForm.position || !slotForm.size) return;
    const { error } = await supabase.from('ad_slots').insert(slotForm);
    if (error) toast.error(error.message);
    else { toast.success('Slot ditambahkan'); setSlotForm({ name: '', position: '', size: '' }); fetchData(); }
  };

  const addAd = async () => {
    if (!adForm.title || !adForm.image_url || !adForm.link_url || !adForm.slot_id || !adForm.start_date || !adForm.end_date) {
      toast.error('Semua field wajib diisi');
      return;
    }
    const { error } = await supabase.from('ads').insert({
      ...adForm,
      start_date: new Date(adForm.start_date).toISOString(),
      end_date: new Date(adForm.end_date).toISOString(),
    });
    if (error) toast.error(error.message);
    else { toast.success('Iklan ditambahkan'); setAdForm({ title: '', image_url: '', link_url: '', slot_id: '', start_date: '', end_date: '' }); fetchData(); }
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('Hapus slot ini?')) return;
    await supabase.from('ad_slots').delete().eq('id', id);
    fetchData();
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Hapus iklan ini?')) return;
    await supabase.from('ads').delete().eq('id', id);
    fetchData();
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Manajemen Iklan</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Add Slot */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Tambah Slot Iklan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Nama slot" value={slotForm.name} onChange={e => setSlotForm(f => ({ ...f, name: e.target.value }))} maxLength={50} />
            <Input placeholder="Position (header, sidebar, article_inline, footer)" value={slotForm.position} onChange={e => setSlotForm(f => ({ ...f, position: e.target.value }))} maxLength={50} />
            <Input placeholder="Size (728x90, 300x250, dll)" value={slotForm.size} onChange={e => setSlotForm(f => ({ ...f, size: e.target.value }))} maxLength={20} />
            <Button onClick={addSlot}><Plus size={16} className="mr-2" /> Tambah Slot</Button>
          </CardContent>
        </Card>

        {/* Add Ad */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Tambah Iklan</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Judul iklan" value={adForm.title} onChange={e => setAdForm(f => ({ ...f, title: e.target.value }))} maxLength={100} />
            <Input placeholder="Image URL" value={adForm.image_url} onChange={e => setAdForm(f => ({ ...f, image_url: e.target.value }))} />
            <Input placeholder="Link URL" value={adForm.link_url} onChange={e => setAdForm(f => ({ ...f, link_url: e.target.value }))} />
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={adForm.slot_id}
              onChange={e => setAdForm(f => ({ ...f, slot_id: e.target.value }))}
            >
              <option value="">Pilih slot</option>
              {slots.map(s => <option key={s.id} value={s.id}>{s.name} ({s.position})</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Mulai</Label>
                <Input type="date" value={adForm.start_date} onChange={e => setAdForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Selesai</Label>
                <Input type="date" value={adForm.end_date} onChange={e => setAdForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <Button onClick={addAd}><Plus size={16} className="mr-2" /> Tambah Iklan</Button>
          </CardContent>
        </Card>
      </div>

      {/* Slots Table */}
      <h2 className="font-heading text-xl font-bold mb-4">Slot Iklan</h2>
      <div className="bg-card rounded-lg border border-border overflow-hidden mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map(slot => (
              <TableRow key={slot.id}>
                <TableCell className="font-medium">{slot.name}</TableCell>
                <TableCell>{slot.position}</TableCell>
                <TableCell>{slot.size}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteSlot(slot.id)}><Trash2 size={14} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Ads Table */}
      <h2 className="font-heading text-xl font-bold mb-4">Daftar Iklan</h2>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.map(ad => (
              <TableRow key={ad.id}>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{(ad.ad_slots as any)?.name || '-'}</TableCell>
                <TableCell>{ad.active ? '✅ Aktif' : '❌ Nonaktif'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteAd(ad.id)}><Trash2 size={14} /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminAds;
