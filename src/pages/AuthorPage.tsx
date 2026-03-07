import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BlogLayout from '@/components/BlogLayout';
import PostCard from '@/components/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const AuthorPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<{ name: string; avatar_url: string | null } | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      
      const [profileRes, postsRes] = await Promise.all([
        supabase.from('profiles').select('name, avatar_url').eq('user_id', userId).single(),
        supabase.from('posts')
          .select('id, title, slug, excerpt, cover_image, published_at, categories(name)')
          .eq('author_id', userId)
          .eq('status', 'published')
          .order('published_at', { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (postsRes.data) setPosts(postsRes.data);
      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) return <BlogLayout><div className="container py-20 text-center text-muted-foreground">Memuat...</div></BlogLayout>;
  if (!profile) return <BlogLayout><div className="container py-20 text-center"><h1 className="font-heading text-3xl">Penulis tidak ditemukan</h1></div></BlogLayout>;

  return (
    <BlogLayout>
      <div className="container mx-auto py-8">
        {/* Author header */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border animate-fade-in">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-xl font-heading bg-primary text-primary-foreground">
              {profile.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-heading text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{posts.length} artikel dipublikasikan</p>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Belum ada artikel dari penulis ini.</p>
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
                author_name={profile.name}
                published_at={post.published_at}
              />
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
};

export default AuthorPage;
