'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  publishedAt: string | null;
  createdAt: string;
  category: { name: string } | null;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts?admin=true');
    const data = await res.json();
    if (data.posts) setPosts(data.posts);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (slug: string) => {
    if (!confirm('Hapus artikel ini?')) return;
    const res = await fetch(`/api/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('Artikel dihapus');
      fetchPosts();
    } else {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Artikel</h1>
        <Link href="/admin/posts/new">
          <Button>
            <Plus size={16} className="mr-2" /> Tulis Artikel
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {post.category?.name || '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(post.createdAt), 'dd/MM/yy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/posts/${post.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit size={14} />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deletePost(post.slug)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {posts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Belum ada artikel. Mulai menulis sekarang!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
