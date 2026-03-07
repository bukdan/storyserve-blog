'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import BlogLayout from '@/components/blog/BlogLayout';
import PostCard from '@/components/blog/PostCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  authorId: string;
  category: { name: string } | null;
  author: { id: string; name: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doSearch = useCallback(
    async (q?: string) => {
      const searchQ = q ?? query;
      setLoading(true);
      setSearched(true);

      const params = new URLSearchParams();
      if (searchQ.trim()) params.set('search', searchQ.trim());
      if (selectedCategory) params.set('categoryId', selectedCategory);

      router.push(`/search?${params.toString()}`);

      const res = await fetch(`/api/posts?${params.toString()}`);
      const data = await res.json();
      setPosts(data.posts || []);
      setLoading(false);
    },
    [query, selectedCategory, router]
  );

  useEffect(() => {
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/tags').then((r) => r.json()),
    ]).then(([catData, tagData]) => {
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(tagData)) setTags(tagData);
    });
  }, []);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, [initialQ, doSearch]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setQuery('');
    setPosts([]);
    setSearched(false);
    router.push('/search');
  };

  const hasFilters = selectedCategory || selectedTag;

  return (
    <BlogLayout>
      <div className="container mx-auto py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Pencarian Artikel</h1>

        {/* Search bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            doSearch();
          }}
          className="flex gap-2 mb-6"
        >
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={18}
            />
            <Input
              placeholder="Cari judul atau ringkasan artikel..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Cari</Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary rounded-lg">
          {/* Category filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Kategori
            </span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer font-body text-xs capitalize"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === cat.id ? null : cat.id
                    )
                  }
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-2 ml-auto">
            <Button size="sm" onClick={() => doSearch()}>
              Terapkan Filter
            </Button>
            {hasFilters && (
              <Button size="sm" variant="ghost" onClick={clearFilters}>
                <X size={14} className="mr-1" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Mencari...</div>
        ) : searched ? (
          posts.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {posts.length} artikel ditemukan
              </p>
              <div className="magazine-grid">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt}
                    coverImage={post.coverImage}
                    categoryName={post.category?.name}
                    authorName={post.author?.name}
                    authorId={post.authorId}
                    publishedAt={post.publishedAt}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="font-heading text-xl text-muted-foreground">
                Tidak ada artikel ditemukan
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Coba ubah kata kunci atau filter pencarian.
              </p>
            </div>
          )
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-heading text-xl">Mulai pencarian</p>
            <p className="text-sm mt-2">
              Ketik kata kunci atau pilih filter untuk mencari artikel.
            </p>
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
