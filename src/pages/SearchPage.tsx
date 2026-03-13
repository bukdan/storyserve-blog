import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BlogLayout from '@/components/BlogLayout';
import PostCard from '@/components/PostCard';
import useSEO from '@/hooks/useSEO';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Search, CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import SpaceBanner from '@/components/SpaceBanner';
import AdBanner from '@/components/AdBanner';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [posts, setPosts] = useState<any[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [tags, setTags] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useSEO({ title: query ? `Pencarian: ${query}` : 'Pencarian', description: 'Cari artikel di TheMag' });

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('id, name, slug'),
      supabase.from('tags').select('id, name, slug'),
    ]).then(([catRes, tagRes]) => {
      if (catRes.data) setCategories(catRes.data);
      if (tagRes.data) setTags(tagRes.data);
    });
  }, []);

  useEffect(() => {
    if (initialQ) doSearch(initialQ);
  }, []);

  const doSearch = async (q?: string) => {
    const searchQ = q ?? query;
    setLoading(true);
    setSearched(true);
    setSearchParams(searchQ ? { q: searchQ } : {});

    let postQuery = supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, published_at, author_id, category_id, categories(name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(50);

    if (searchQ.trim()) {
      postQuery = postQuery.or(`title.ilike.%${searchQ}%,excerpt.ilike.%${searchQ}%`);
    }
    if (selectedCategory) {
      postQuery = postQuery.eq('category_id', selectedCategory);
    }
    if (dateFrom) {
      postQuery = postQuery.gte('published_at', dateFrom.toISOString());
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      postQuery = postQuery.lte('published_at', endOfDay.toISOString());
    }

    let { data } = await postQuery;

    // If tag filter, we need to filter by post_tags join
    if (selectedTag && data) {
      const { data: taggedPostIds } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', selectedTag);
      const ids = new Set(taggedPostIds?.map(t => t.post_id) || []);
      data = data.filter(p => ids.has(p.id));
    }

    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', authorIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);
      setPosts(data.map(p => ({
        ...p,
        author_name: profileMap.get(p.author_id) || 'Unknown',
      })));
    } else {
      setPosts([]);
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setDateFrom(undefined);
    setDateTo(undefined);
    setQuery('');
    setPosts([]);
    setSearched(false);
    setSearchParams({});
  };

  const hasFilters = selectedCategory || selectedTag || dateFrom || dateTo;

  return (
    <BlogLayout>
      <SpaceBanner className="mx-auto max-w-5xl my-2" label="HEADER AD SPACE" />
      <AdBanner position="header" className="py-4 bg-secondary" />
      <div className="container mx-auto py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">Pencarian Artikel</h1>

        {/* Search bar */}
        <form onSubmit={e => { e.preventDefault(); doSearch(); }} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Cari judul atau ringkasan artikel..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Cari</Button>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary rounded-lg">
          {/* Category filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Kategori</span>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  className="cursor-pointer font-body text-xs capitalize"
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                >
                  {cat.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tag filter */}
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tag</span>
            <div className="flex flex-wrap gap-1.5">
              {tags.map(tag => (
                <Badge
                  key={tag.id}
                  variant={selectedTag === tag.id ? 'default' : 'outline'}
                  className="cursor-pointer font-body text-xs"
                  onClick={() => setSelectedTag(selectedTag === tag.id ? null : tag.id)}
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Date filters */}
          <div className="flex gap-3">
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Dari</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn('w-[140px] justify-start text-left font-normal text-xs', !dateFrom && 'text-muted-foreground')}>
                    <CalendarIcon size={14} className="mr-1" />
                    {dateFrom ? format(dateFrom, 'dd MMM yyyy', { locale: localeId }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sampai</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className={cn('w-[140px] justify-start text-left font-normal text-xs', !dateTo && 'text-muted-foreground')}>
                    <CalendarIcon size={14} className="mr-1" />
                    {dateTo ? format(dateTo, 'dd MMM yyyy', { locale: localeId }) : 'Pilih tanggal'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={dateTo} onSelect={setDateTo} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <Button size="sm" onClick={() => doSearch()}>Terapkan Filter</Button>
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
              <p className="text-sm text-muted-foreground mb-4">{posts.length} artikel ditemukan</p>
              <div className="magazine-grid">
                {posts.map((post, index) => (
                  <React.Fragment key={post.id}>
                    {index === 6 && (
                      <div className="col-span-12">
                        <SpaceBanner className="my-2" label="INLINE AD SPACE" />
                        <AdBanner position="article_inline" className="my-4" />
                      </div>
                    )}
                    <PostCard
                      title={post.title}
                      slug={post.slug}
                      excerpt={post.excerpt}
                      cover_image={post.cover_image}
                      category_name={post.categories?.name}
                      author_name={post.author_name}
                      author_id={post.author_id}
                      published_at={post.published_at}
                    />
                  </React.Fragment>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="font-heading text-xl text-muted-foreground">Tidak ada artikel ditemukan</p>
              <p className="text-sm text-muted-foreground mt-2">Coba ubah kata kunci atau filter pencarian.</p>
            </div>
          )
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Search size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-heading text-xl">Mulai pencarian</p>
            <p className="text-sm mt-2">Ketik kata kunci atau pilih filter untuk mencari artikel.</p>
          </div>
        )}
      </div>
      <SpaceBanner className="mx-auto max-w-5xl my-2" label="FOOTER AD SPACE" />
      <AdBanner position="footer" className="py-4 bg-secondary" />
    </BlogLayout>
  );
};

export default SearchPage;
