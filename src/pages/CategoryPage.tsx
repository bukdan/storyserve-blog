import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BlogLayout from '@/components/BlogLayout';
import PostCard from '@/components/PostCard';
import useSEO from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import SpaceBanner from '@/components/SpaceBanner';
import AdBanner from '@/components/AdBanner';

const PAGE_SIZE = 12;

interface PostWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  author_name: string;
  author_id: string;
  categories: { name: string } | null;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [catId, setCatId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPosts = async (categoryId: string, pageNum: number, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, published_at, author_id, categories(name)')
      .eq('status', 'published')
      .eq('category_id', categoryId)
      .order('published_at', { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', authorIds);
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);

      const mapped = data.map(p => ({
        id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt,
        cover_image: p.cover_image, published_at: p.published_at,
        author_name: profileMap.get(p.author_id) || 'Unknown',
        author_id: p.author_id,
        categories: p.categories,
      }));

      setPosts(prev => append ? [...prev, ...mapped] : mapped);
      setHasMore(data.length === PAGE_SIZE);
    } else {
      if (!append) setPosts([]);
      setHasMore(false);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    const init = async () => {
      if (!slug) return;
      setPage(0);
      const { data: cat } = await supabase.from('categories').select('id, name').eq('slug', slug).single();
      if (cat) {
        setCategoryName(cat.name);
        setCatId(cat.id);
        fetchPosts(cat.id, 0);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [slug]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(catId, nextPage, true);
  };

  useSEO({
    title: categoryName ? `Kategori: ${categoryName}` : undefined,
    description: categoryName ? `Baca artikel terbaru dalam kategori ${categoryName} di TheMag.` : undefined,
  });

  return (
    <BlogLayout>
      <SpaceBanner className="mx-auto max-w-5xl my-2" label="HEADER AD SPACE" />
      <AdBanner position="header" className="py-4 bg-secondary" />
      <div className="container mx-auto py-8">
        <h1 className="font-heading text-3xl font-bold mb-2 capitalize">{categoryName}</h1>
        <p className="text-muted-foreground mb-8 border-b border-border pb-6">
          {posts.length} artikel dalam kategori ini
        </p>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat...</div>
        ) : (
          <>
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
            {hasMore && posts.length > 0 && (
              <div className="text-center mt-10">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="px-8">
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
      <SpaceBanner className="mx-auto max-w-5xl my-2" label="FOOTER AD SPACE" />
      <AdBanner position="footer" className="py-4 bg-secondary" />
    </BlogLayout>
  );
};

export default CategoryPage;
