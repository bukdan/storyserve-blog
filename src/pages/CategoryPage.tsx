import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BlogLayout from '@/components/BlogLayout';
import PostCard from '@/components/PostCard';

interface PostWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string | null;
  author_name: string;
  categories: { name: string } | null;
}

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      const { data: cat } = await supabase.from('categories').select('id, name').eq('slug', slug).single();
      if (cat) {
        setCategoryName(cat.name);
        const { data } = await supabase
          .from('posts')
          .select('id, title, slug, excerpt, cover_image, published_at, author_id, categories(name)')
          .eq('status', 'published')
          .eq('category_id', cat.id)
          .order('published_at', { ascending: false });

        if (data && data.length > 0) {
          const authorIds = [...new Set(data.map(p => p.author_id))];
          const { data: profiles } = await supabase.from('profiles').select('user_id, name').in('user_id', authorIds);
          const profileMap = new Map(profiles?.map(p => [p.user_id, p.name]) || []);
          
          setPosts(data.map(p => ({
            id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt,
            cover_image: p.cover_image, published_at: p.published_at,
            author_name: profileMap.get(p.author_id) || 'Unknown',
            categories: p.categories,
          })));
        } else {
          setPosts([]);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  return (
    <BlogLayout>
      <div className="container mx-auto py-8">
        <h1 className="font-heading text-3xl font-bold mb-2 capitalize">{categoryName}</h1>
        <p className="text-muted-foreground mb-8 border-b border-border pb-6">
          {posts.length} artikel dalam kategori ini
        </p>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Memuat...</div>
        ) : (
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
                published_at={post.published_at}
              />
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
};

export default CategoryPage;
