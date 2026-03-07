'use client';

import { useEffect, useState } from 'react';
import PostCard from './PostCard';

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

interface RelatedPostsProps {
  postId: string;
  categoryId: string | null;
}

const RelatedPosts = ({ postId, categoryId }: RelatedPostsProps) => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      let url = `/api/posts?limit=3&exclude=${postId}`;
      if (categoryId) {
        url += `&categoryId=${categoryId}`;
      }
      const res = await fetch(url);
      const data = await res.json();

      if (data.posts && data.posts.length > 0) {
        setPosts(data.posts.filter((p: Post) => p.id !== postId).slice(0, 3));
      }
    };
    fetchRelated();
  }, [postId, categoryId]);

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h3 className="font-heading text-2xl font-bold mb-6">Artikel Terkait</h3>
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
    </section>
  );
};

export default RelatedPosts;
