'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    coverImage: '',
    categoryId: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      });
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: generateSlug(title) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);

    // Use base64 for local images
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, coverImage: reader.result as string }));
      toast.success('Gambar berhasil diupload');
      setUploading(false);
    };
    reader.onerror = () => {
      toast.error('Gagal mengupload gambar');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (status?: string) => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error('Judul dan slug wajib diisi');
      return;
    }
    setSaving(true);

    const postData = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      content: form.content,
      excerpt: form.excerpt.trim() || null,
      coverImage: form.coverImage.trim() || null,
      categoryId: form.categoryId || null,
      status: status || form.status,
    };

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData),
    });

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || 'Gagal menyimpan');
    } else {
      toast.success(status === 'PUBLISHED' ? 'Artikel dipublish!' : 'Artikel disimpan!');
      router.push('/admin/posts');
    }
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h1 className="font-heading text-2xl font-bold mb-6">Tulis Artikel Baru</h1>

        <div className="space-y-5">
          <div>
            <Label>Judul</Label>
            <Input
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Judul artikel"
              maxLength={200}
            />
          </div>
          <div>
            <Label>Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="url-slug"
              maxLength={200}
            />
          </div>
          <div>
            <Label>Excerpt</Label>
            <Input
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Ringkasan singkat"
              maxLength={300}
            />
          </div>

          {/* Cover Image Upload */}
          <div>
            <Label>Cover Image</Label>
            <div className="mt-1">
              {form.coverImage ? (
                <div className="relative inline-block">
                  <img
                    src={form.coverImage}
                    alt="Cover"
                    className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, coverImage: '' }))}
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
                    onChange={(e) =>
                      setForm((f) => ({ ...f, coverImage: e.target.value }))
                    }
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
            <Select
              value={form.categoryId}
              onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Konten</Label>
            <RichTextEditor
              content={form.content}
              onChange={(content) => setForm((f) => ({ ...f, content }))}
            />
          </div>
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={() => handleSave('DRAFT')}
              variant="secondary"
              disabled={saving}
            >
              Simpan Draft
            </Button>
            <Button onClick={() => handleSave('PUBLISHED')} disabled={saving}>
              Publish
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
