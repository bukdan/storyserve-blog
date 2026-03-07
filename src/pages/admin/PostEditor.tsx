import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import RichTextEditor from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

const PostEditor = () => {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('post-covers')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Gagal mengupload gambar: ' + uploadError.message);
    } else {
      const { data: { publicUrl } } = supabase.storage.from('post-covers').getPublicUrl(filePath);
      setForm(f => ({ ...f, cover_image: publicUrl }));
      toast.success('Gambar berhasil diupload');
    }
    setUploading(false);
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
      <div className="max-w-4xl">
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
          
          {/* Cover Image Upload */}
          <div>
            <Label>Cover Image</Label>
            <div className="mt-1">
              {form.cover_image ? (
                <div className="relative inline-block">
                  <img src={form.cover_image} alt="Cover" className="w-full max-w-md h-48 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, cover_image: '' }))}
                    className="absolute top-2 right-2 p-1 rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={16} className="mr-2" />
                    {uploading ? 'Mengupload...' : 'Upload Gambar'}
                  </Button>
                  <span className="text-xs text-muted-foreground">atau</span>
                  <Input
                    placeholder="Paste URL gambar"
                    className="flex-1"
                    onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))}
                  />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
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
            <Label>Konten</Label>
            <RichTextEditor content={form.content} onChange={content => setForm(f => ({ ...f, content }))} />
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
