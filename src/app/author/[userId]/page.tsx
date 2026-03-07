'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import BlogLayout from '@/components/blog/BlogLayout';
import PostCard from '@/components/blog/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
  category: { name: string } | null;
}

interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export default function AuthorPage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      const [profileRes, postsRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/posts?authorId=${userId}`),
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }

      setLoading(false);
    };
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <BlogLayout>
        <div className="container py-20 text-center text-muted-foreground">
          Memuat...
        </div>
      </BlogLayout>
    );
  }

  if (!profile) {
    return (
      <BlogLayout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl">Penulis tidak ditemukan</h1>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <div className="container mx-auto py-8">
        {/* Author header */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border animate-fade-in">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatarUrl || undefined} />
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
          <p className="text-center text-muted-foreground py-10">
            Belum ada artikel dari penulis ini.
          </p>
        ) : (
          <div className="magazine-grid">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                coverImage={post.coverImage}
                categoryName={post.category?.name}
                authorName={profile.name}
                publishedAt={post.publishedAt}
              />
            ))}
          </div>
        )}
      </div>
    </BlogLayout>
  );
}
