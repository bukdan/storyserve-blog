import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState('');

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const addCategory = async () => {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await supabase.from('categories').insert({ name: name.trim(), slug });
    if (error) toast.error(error.message);
    else { toast.success('Kategori ditambahkan'); setName(''); fetchCategories(); }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Hapus kategori ini?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Kategori dihapus'); fetchCategories(); }
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Kategori</h1>
      <div className="flex items-center gap-3 mb-6">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nama kategori" className="max-w-xs" maxLength={50}
          onKeyDown={e => e.key === 'Enter' && addCategory()} />
        <Button onClick={addCategory}><Plus size={16} className="mr-2" /> Tambah</Button>
      </div>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(cat => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{cat.slug}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
