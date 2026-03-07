import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminTags = () => {
  const [tags, setTags] = useState<any[]>([]);
  const [name, setName] = useState('');

  const fetchTags = async () => {
    const { data } = await supabase.from('tags').select('*').order('name');
    if (data) setTags(data);
  };

  useEffect(() => { fetchTags(); }, []);

  const addTag = async () => {
    if (!name.trim()) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const { error } = await supabase.from('tags').insert({ name: name.trim(), slug });
    if (error) toast.error(error.message);
    else { toast.success('Tag ditambahkan'); setName(''); fetchTags(); }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Hapus tag ini?')) return;
    const { error } = await supabase.from('tags').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Tag dihapus'); fetchTags(); }
  };

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Tags</h1>
      <div className="flex items-center gap-3 mb-6">
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nama tag" className="max-w-xs" maxLength={50}
          onKeyDown={e => e.key === 'Enter' && addTag()} />
        <Button onClick={addTag}><Plus size={16} className="mr-2" /> Tambah</Button>
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
            {tags.map(tag => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{tag.slug}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => deleteTag(tag.id)}>
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

export default AdminTags;
