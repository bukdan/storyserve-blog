'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import BlogLayout from '@/components/blog/BlogLayout';
import PostCard from '@/components/blog/PostCard';
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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const fetchPosts = useCallback(
    async (catId: string, pageNum: number, append = false) => {
      if (pageNum === 0) setLoading(true);
      else setLoadingMore(true);

      const res = await fetch(
        `/api/posts?page=${pageNum}&limit=${PAGE_SIZE}&categoryId=${catId}`
      );
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
    },
    []
  );

  useEffect(() => {
    const init = async () => {
      if (!slug) return;
      setPage(0);
      
      // Get category info
      const catRes = await fetch(`/api/categories/${slug}`);
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoryName(catData.name);
        setCategoryId(catData.id);
        fetchPosts(catData.id, 0);
      } else {
        setLoading(false);
      }
    };
    init();
  }, [slug, fetchPosts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(categoryId, nextPage, true);
  };

  return (
    <BlogLayout>
      <div className="container mx-auto py-8">
        <h1 className="font-heading text-3xl font-bold mb-2 capitalize">
          {categoryName}
        </h1>
        <p className="text-muted-foreground mb-8 border-b border-border pb-6">
          {posts.length} artikel dalam kategori ini
        </p>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat...</div>
        ) : (
          <>
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
            {hasMore && posts.length > 0 && (
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
    </BlogLayout>
  );
}
