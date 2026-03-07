'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Tag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export default function AdminTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchTags = async () => {
    const res = await fetch('/api/tags');
    const data = await res.json();
    if (Array.isArray(data)) setTags(data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoading(true);

    const res = await fetch('/api/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        slug: generateSlug(newName),
      }),
    });

    if (res.ok) {
      toast.success('Tag ditambahkan');
      setNewName('');
      fetchTags();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Gagal menambahkan');
    }
    setLoading(false);
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Hapus tag ini?')) return;
    const res = await fetch(`/api/tags/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Tag dihapus');
      fetchTags();
    } else {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Tags</h1>
      </div>

      {/* Add new tag */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Nama tag baru"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="max-w-xs"
        />
        <Button onClick={handleAdd} disabled={loading}>
          <Plus size={16} className="mr-2" /> Tambah
        </Button>
      </div>

      {/* Tags list */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Jumlah Artikel</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">#{tag.name}</TableCell>
                <TableCell>
                  <code className="text-xs bg-secondary px-2 py-1 rounded">
                    {tag.slug}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tag._count?.posts || 0}</Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(tag.slug)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {tags.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                  Belum ada tag.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
