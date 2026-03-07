'use client';

import { useEffect, useState, useCallback } from 'react';
import BlogLayout from '@/components/blog/BlogLayout';
import PostCard from '@/components/blog/PostCard';
import AdBanner from '@/components/blog/AdBanner';
import SpaceBanner from '@/components/blog/SpaceBanner';
import { Button } from '@/components/ui/button';

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

const PAGE_SIZE = 12;

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPosts = useCallback(async (pageNum: number, append = false) => {
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);

    const res = await fetch(`/api/posts?page=${pageNum}&limit=${PAGE_SIZE}`);
    const data = await res.json();

    if (data.posts && data.posts.length > 0) {
      setPosts((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setHasMore(data.hasMore);
    } else {
      if (!append) setPosts([]);
      setHasMore(false);
    }
    setLoading(false);
    setLoadingMore(false);
  }, []);

  useEffect(() => {
    fetchPosts(0);
  }, [fetchPosts]);

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
      <SpaceBanner className="mx-auto max-w-5xl my-2" label="HEADER AD SPACE" />
      <AdBanner position="header" className="py-4 bg-secondary" />

      <div className="container mx-auto py-8">
        {loading ? (
          <div className="text-center py-20 text-muted-foreground">
            Memuat artikel...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="font-heading text-3xl font-bold mb-3">
              Selamat Datang di TheMag
            </h2>
            <p className="text-muted-foreground">
              Belum ada artikel. Login sebagai admin untuk mulai menulis.
            </p>
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
                  coverImage={featured.coverImage}
                  categoryName={featured.category?.name}
                  authorName={featured.author?.name}
                  authorId={featured.authorId}
                  publishedAt={featured.publishedAt}
                  featured
                />
              )}
              <div className="col-span-12 md:col-span-4 space-y-4">
                {sidebar.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    slug={post.slug}
                    coverImage={post.coverImage}
                    categoryName={post.category?.name}
                    authorName={post.author?.name}
                    authorId={post.authorId}
                    publishedAt={post.publishedAt}
                  />
                ))}
              </div>
            </div>

            <SpaceBanner className="my-4" label="INLINE AD SPACE" />
            <AdBanner position="article_inline" className="my-8" />

            {rest.length > 0 && (
              <>
                <h2 className="font-heading text-2xl font-bold mb-6 border-b border-border pb-3">
                  Artikel Terbaru
                </h2>
                <div className="magazine-grid">
                  {rest.map((post) => (
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
            )}

            {hasMore && (
              <div className="text-center mt-10">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8"
                >
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
}
