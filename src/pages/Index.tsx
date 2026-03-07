import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import BlogLayout from '@/components/BlogLayout';
import PostCard from '@/components/PostCard';
import AdBanner from '@/components/AdBanner';
import { Button } from '@/components/ui/button';

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

const PAGE_SIZE = 12;

const Index = () => {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPosts = async (pageNum: number, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data } = await supabase
      .from('posts')
      .select('id, title, slug, excerpt, cover_image, published_at, author_id, categories(name)')
      .eq('status', 'published')
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

  useEffect(() => { fetchPosts(0); }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage, true);
  };

  const featured = posts[0];
  const sidebar = posts.slice(1, 5);
  const rest = posts.slice(5);

  return (
    <BlogLayout>
      <AdBanner position="header" className="py-4 bg-secondary" />

      <div className="container mx-auto py-8">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Memuat artikel...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-3xl font-bold mb-3">Selamat Datang di TheMag</h2>
            <p className="text-muted-foreground">Belum ada artikel. Login sebagai admin untuk mulai menulis.</p>
          </div>
        ) : (
          <>
            {/* Featured + Sidebar */}
            <div className="magazine-grid mb-10">
              {featured && (
                <PostCard
                  title={featured.title}
                  slug={featured.slug}
                  excerpt={featured.excerpt}
                  cover_image={featured.cover_image}
                  category_name={featured.categories?.name}
                  author_name={featured.author_name}
                  author_id={featured.author_id}
                  published_at={featured.published_at}
                  featured
                />
              )}
              <div className="col-span-12 md:col-span-4 space-y-4">
                {sidebar.map(post => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    cover_image={post.cover_image}
                    category_name={post.categories?.name}
                    author_name={post.author_name}
                    author_id={post.author_id}
                    published_at={post.published_at}
                  />
                ))}
              </div>
            </div>

            <AdBanner position="article_inline" className="my-8" />

            {rest.length > 0 && (
              <>
                <h2 className="font-heading text-2xl font-bold mb-6 border-b border-border pb-3">Artikel Terbaru</h2>
                <div className="magazine-grid">
                  {rest.map(post => (
                    <PostCard
                      key={post.id}
                      title={post.title}
                      slug={post.slug}
                      excerpt={post.excerpt}
                      cover_image={post.cover_image}
                      category_name={post.categories?.name}
                      author_name={post.author_name}
                      author_id={post.author_id}
                      published_at={post.published_at}
                    />
                  ))}
                </div>
              </>
            )}

            {hasMore && (
              <div className="text-center mt-10">
                <Button variant="outline" onClick={loadMore} disabled={loadingMore} className="px-8">
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AdBanner position="footer" className="py-4 bg-secondary" />
    </BlogLayout>
  );
};

export default Index;
