import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminPosts = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, status, views, published_at, created_at, categories(name)')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (id: string) => {
    if (!confirm('Hapus artikel ini?')) return;
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) toast.error('Gagal menghapus');
    else { toast.success('Artikel dihapus'); fetchPosts(); }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Artikel</h1>
        <Link to="/admin/posts/new">
          <Button><Plus size={16} className="mr-2" /> Tulis Artikel</Button>
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
            {posts.map(post => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{post.categories?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </TableCell>
                <TableCell>{post.views}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(post.created_at), 'dd/MM/yy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Link to={`/admin/posts/${post.id}`}>
                      <Button variant="ghost" size="icon"><Edit size={14} /></Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => deletePost(post.id)}>
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
};

export default AdminPosts;
