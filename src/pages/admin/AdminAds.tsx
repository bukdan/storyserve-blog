import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Pencil, Eye, Image } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const emptyAdForm = { title: '', image_url: '', link_url: '', slot_id: '', start_date: '', end_date: '' };
const emptySlotForm = { name: '', position: '', size: '' };

const AdminAds = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [slotForm, setSlotForm] = useState(emptySlotForm);
  const [adForm, setAdForm] = useState(emptyAdForm);
  const [editingAd, setEditingAd] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<any | null>(null);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [showSlotDialog, setShowSlotDialog] = useState(false);

  const fetchData = async () => {
    const [slotsRes, adsRes] = await Promise.all([
      supabase.from('ad_slots').select('*').order('name'),
      supabase.from('ads').select('*, ad_slots(name, position)').order('created_at', { ascending: false }),
    ]);
    if (slotsRes.data) setSlots(slotsRes.data);
    if (adsRes.data) setAds(adsRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  // Slot CRUD
  const saveSlot = async () => {
    if (!slotForm.name || !slotForm.position || !slotForm.size) {
      toast.error('Semua field slot wajib diisi');
      return;
    }
    if (editingSlot) {
      const { error } = await supabase.from('ad_slots').update(slotForm).eq('id', editingSlot);
      if (error) toast.error(error.message);
      else toast.success('Slot diperbarui');
    } else {
      const { error } = await supabase.from('ad_slots').insert(slotForm);
      if (error) toast.error(error.message);
      else toast.success('Slot ditambahkan');
    }
    setSlotForm(emptySlotForm);
    setEditingSlot(null);
    setShowSlotDialog(false);
    fetchData();
  };

  const editSlot = (slot: any) => {
    setSlotForm({ name: slot.name, position: slot.position, size: slot.size });
    setEditingSlot(slot.id);
    setShowSlotDialog(true);
  };

  const toggleSlotActive = async (id: string, current: boolean) => {
    await supabase.from('ad_slots').update({ active: !current }).eq('id', id);
    fetchData();
  };

  const deleteSlot = async (id: string) => {
    if (!confirm('Hapus slot ini? Semua iklan terkait juga akan terhapus.')) return;
    await supabase.from('ads').delete().eq('slot_id', id);
    await supabase.from('ad_slots').delete().eq('id', id);
    toast.success('Slot dihapus');
    fetchData();
  };

  // Ad CRUD
  const saveAd = async () => {
    if (!adForm.title || !adForm.image_url || !adForm.link_url || !adForm.slot_id || !adForm.start_date || !adForm.end_date) {
      toast.error('Semua field iklan wajib diisi');
      return;
    }
    const payload = {
      title: adForm.title,
      image_url: adForm.image_url,
      link_url: adForm.link_url,
      slot_id: adForm.slot_id,
      start_date: new Date(adForm.start_date).toISOString(),
      end_date: new Date(adForm.end_date).toISOString(),
    };
    if (editingAd) {
      const { error } = await supabase.from('ads').update(payload).eq('id', editingAd);
      if (error) toast.error(error.message);
      else toast.success('Iklan diperbarui');
    } else {
      const { error } = await supabase.from('ads').insert(payload);
      if (error) toast.error(error.message);
      else toast.success('Iklan ditambahkan');
    }
    setAdForm(emptyAdForm);
    setEditingAd(null);
    setShowAdDialog(false);
    fetchData();
  };

  const editAd = (ad: any) => {
    setAdForm({
      title: ad.title,
      image_url: ad.image_url,
      link_url: ad.link_url,
      slot_id: ad.slot_id,
      start_date: ad.start_date ? format(new Date(ad.start_date), 'yyyy-MM-dd') : '',
      end_date: ad.end_date ? format(new Date(ad.end_date), 'yyyy-MM-dd') : '',
    });
    setEditingAd(ad.id);
    setShowAdDialog(true);
  };

  const toggleAdActive = async (id: string, current: boolean) => {
    await supabase.from('ads').update({ active: !current }).eq('id', id);
    fetchData();
  };

  const deleteAd = async (id: string) => {
    if (!confirm('Hapus iklan ini?')) return;
    await supabase.from('ads').delete().eq('id', id);
    toast.success('Iklan dihapus');
    fetchData();
  };

  const openNewAd = () => {
    setAdForm(emptyAdForm);
    setEditingAd(null);
    setShowAdDialog(true);
  };

  const openNewSlot = () => {
    setSlotForm(emptySlotForm);
    setEditingSlot(null);
    setShowSlotDialog(true);
  };

  const isAdActive = (ad: any) => {
    if (!ad.active) return false;
    const now = new Date();
    return new Date(ad.start_date) <= now && new Date(ad.end_date) >= now;
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Manajemen Iklan</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openNewSlot}><Plus size={16} className="mr-2" /> Slot Baru</Button>
          <Button onClick={openNewAd}><Plus size={16} className="mr-2" /> Iklan Baru</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{slots.length}</p>
            <p className="text-xs text-muted-foreground">Total Slot</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold">{ads.length}</p>
            <p className="text-xs text-muted-foreground">Total Iklan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-green-600">{ads.filter(isAdActive).length}</p>
            <p className="text-xs text-muted-foreground">Iklan Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-2xl font-bold text-muted-foreground">{ads.filter(a => !isAdActive(a)).length}</p>
            <p className="text-xs text-muted-foreground">Iklan Nonaktif</p>
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
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Belum ada slot iklan</TableCell></TableRow>
            ) : slots.map(slot => (
              <TableRow key={slot.id}>
                <TableCell className="font-medium">{slot.name}</TableCell>
                <TableCell><Badge variant="secondary" className="font-mono text-xs">{slot.position}</Badge></TableCell>
                <TableCell className="text-sm text-muted-foreground">{slot.size}</TableCell>
                <TableCell>
                  <Switch checked={slot.active} onCheckedChange={() => toggleSlotActive(slot.id, slot.active)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => editSlot(slot)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteSlot(slot.id)}><Trash2 size={14} /></Button>
                  </div>
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
              <TableHead>Preview</TableHead>
              <TableHead>Judul</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Periode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[140px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ads.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Belum ada iklan</TableCell></TableRow>
            ) : ads.map(ad => (
              <TableRow key={ad.id}>
                <TableCell>
                  <img src={ad.image_url} alt={ad.title} className="w-20 h-10 object-cover rounded border border-border" />
                </TableCell>
                <TableCell className="font-medium">{ad.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{(ad.ad_slots as any)?.name || '-'}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {ad.start_date ? format(new Date(ad.start_date), 'dd/MM/yy') : '-'}
                  {' → '}
                  {ad.end_date ? format(new Date(ad.end_date), 'dd/MM/yy') : '-'}
                </TableCell>
                <TableCell>
                  <Switch checked={ad.active} onCheckedChange={() => toggleAdActive(ad.id, ad.active)} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setPreviewAd(ad)}><Eye size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => editAd(ad)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteAd(ad.id)}><Trash2 size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Ad Form Dialog */}
      <Dialog open={showAdDialog} onOpenChange={setShowAdDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Iklan' : 'Tambah Iklan Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Judul</Label>
              <Input placeholder="Judul iklan" value={adForm.title} onChange={e => setAdForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Image URL</Label>
              <Input placeholder="https://..." value={adForm.image_url} onChange={e => setAdForm(f => ({ ...f, image_url: e.target.value }))} />
              {adForm.image_url && (
                <img src={adForm.image_url} alt="Preview" className="mt-2 w-full h-16 object-cover rounded border border-border" />
              )}
            </div>
            <div>
              <Label className="text-xs">Link URL</Label>
              <Input placeholder="https://..." value={adForm.link_url} onChange={e => setAdForm(f => ({ ...f, link_url: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Slot Iklan</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={adForm.slot_id}
                onChange={e => setAdForm(f => ({ ...f, slot_id: e.target.value }))}
              >
                <option value="">Pilih slot</option>
                {slots.map(s => <option key={s.id} value={s.id}>{s.name} ({s.position} - {s.size})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tanggal Mulai</Label>
                <Input type="date" value={adForm.start_date} onChange={e => setAdForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              <div>
                <Label className="text-xs">Tanggal Selesai</Label>
                <Input type="date" value={adForm.end_date} onChange={e => setAdForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
            </div>
            <Button onClick={saveAd} className="w-full">{editingAd ? 'Simpan Perubahan' : 'Tambah Iklan'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Slot Form Dialog */}
      <Dialog open={showSlotDialog} onOpenChange={setShowSlotDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSlot ? 'Edit Slot' : 'Tambah Slot Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nama Slot</Label>
              <Input placeholder="Header Banner" value={slotForm.name} onChange={e => setSlotForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label className="text-xs">Position</Label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={slotForm.position}
                onChange={e => setSlotForm(f => ({ ...f, position: e.target.value }))}
              >
                <option value="">Pilih position</option>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
                <option value="sidebar">Sidebar</option>
                <option value="article_inline">Article Inline</option>
              </select>
            </div>
            <div>
              <Label className="text-xs">Ukuran</Label>
              <Input placeholder="728x90, 300x250, dll" value={slotForm.size} onChange={e => setSlotForm(f => ({ ...f, size: e.target.value }))} />
            </div>
            <Button onClick={saveSlot} className="w-full">{editingSlot ? 'Simpan Perubahan' : 'Tambah Slot'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewAd} onOpenChange={() => setPreviewAd(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Preview: {previewAd?.title}</DialogTitle>
          </DialogHeader>
          {previewAd && (
            <div className="space-y-3">
              <img src={previewAd.image_url} alt={previewAd.title} className="w-full rounded-lg border border-border" />
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Link:</span> <a href={previewAd.link_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{previewAd.link_url}</a></p>
                <p><span className="font-medium">Slot:</span> {(previewAd.ad_slots as any)?.name} ({(previewAd.ad_slots as any)?.position})</p>
                <p><span className="font-medium">Periode:</span> {format(new Date(previewAd.start_date), 'dd/MM/yyyy')} → {format(new Date(previewAd.end_date), 'dd/MM/yyyy')}</p>
                <p><span className="font-medium">Status:</span> {previewAd.active ? '✅ Aktif' : '❌ Nonaktif'}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAds;
