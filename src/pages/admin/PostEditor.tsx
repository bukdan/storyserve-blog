import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const PostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', slug: '', content: '', excerpt: '', cover_image: '', category_id: '', status: 'draft',
  });

  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => { if (data) setCategories(data); });

    if (!isNew && id) {
      supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setForm({
          title: data.title,
          slug: data.slug,
          content: data.content,
          excerpt: data.excerpt || '',
          cover_image: data.cover_image || '',
          category_id: data.category_id || '',
          status: data.status,
        });
      });
    }
  }, [id]);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: isNew ? generateSlug(title) : f.slug }));
  };

  const handleSave = async (status?: string) => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Judul dan slug wajib diisi');
      return;
    }
    if (!user) return;
    setSaving(true);

    const postData = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content,
      excerpt: form.excerpt.trim() || null,
      cover_image: form.cover_image.trim() || null,
      category_id: form.category_id || null,
      status: status || form.status,
      ...(status === 'published' ? { published_at: new Date().toISOString() } : {}),
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from('posts').insert({ ...postData, author_id: user.id }));
    } else {
      ({ error } = await supabase.from('posts').update(postData).eq('id', id));
    }

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(status === 'published' ? 'Artikel dipublish!' : 'Artikel disimpan!');
      navigate('/admin/posts');
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className="font-heading text-2xl font-bold mb-6">{isNew ? 'Tulis Artikel Baru' : 'Edit Artikel'}</h1>
        
        <div className="space-y-5">
          <div>
            <Label>Judul</Label>
            <Input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Judul artikel" maxLength={200} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="url-slug" maxLength={200} />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Ringkasan singkat" maxLength={300} />
          </div>
          <div>
            <Label>Cover Image URL</Label>
            <Input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="https://..." />
          </div>
          <div>
            <Label>Kategori</Label>
            <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Konten (HTML)</Label>
            <Textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="<p>Tulis konten artikel di sini...</p>"
              rows={16}
              className="font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button onClick={() => handleSave('draft')} variant="secondary" disabled={saving}>Simpan Draft</Button>
            <Button onClick={() => handleSave('published')} disabled={saving}>Publish</Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PostEditor;
