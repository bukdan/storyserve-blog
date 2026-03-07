import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PostCard from '@/components/PostCard';

interface RelatedPostsProps {
  postId: string;
  categoryId: string | null;
  authorId: string;
}

const RelatedPosts = ({ postId, categoryId, authorId }: RelatedPostsProps) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    const fetch = async () => {
      let query = supabase
        .from('posts')
        .select('id, title, slug, excerpt, cover_image, published_at, author_id, categories(name)')
        .eq('status', 'published')
        .neq('id', postId)
        .order('published_at', { ascending: false })
        .limit(3);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setPosts(data);
        // Fetch author names
        const authorIds = [...new Set(data.map(p => p.author_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, name')
          .in('user_id', authorIds);
        const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.name]));
        setPosts(data.map(p => ({ ...p, author_name: profileMap[p.author_id] || '' })));
      } else if (categoryId) {
        // Fallback: fetch any recent posts
        const { data: fallback } = await supabase
          .from('posts')
          .select('id, title, slug, excerpt, cover_image, published_at, author_id, categories(name)')
          .eq('status', 'published')
          .neq('id', postId)
          .order('published_at', { ascending: false })
          .limit(3);
        if (fallback && fallback.length > 0) {
          const authorIds = [...new Set(fallback.map(p => p.author_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, name')
            .in('user_id', authorIds);
          const profileMap = Object.fromEntries((profiles || []).map(p => [p.user_id, p.name]));
          setPosts(fallback.map(p => ({ ...p, author_name: profileMap[p.author_id] || '' })));
        }
      }
    };
    fetch();
  }, [postId, categoryId]);

  if (posts.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h3 className="font-heading text-2xl font-bold mb-6">Artikel Terkait</h3>
      <div className="magazine-grid">
        {posts.map(post => (
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
    </section>
  );
};

export default RelatedPosts;
