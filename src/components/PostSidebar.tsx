import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AdBanner from '@/components/AdBanner';
import { Badge } from '@/components/ui/badge';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostSidebarProps {
  postUrl: string;
  postTitle: string;
}

const PostSidebar = ({ postUrl, postTitle }: PostSidebarProps) => {
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);

  useEffect(() => {
    // Fetch categories, popular, trending in parallel
    Promise.all([
      supabase.from('categories').select('id, name, slug'),
      supabase.from('posts')
        .select('id, title, slug, cover_image, views')
        .eq('status', 'published')
        .order('views', { ascending: false })
        .limit(5),
      supabase.from('posts')
        .select('id, title, slug, cover_image, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(5),
    ]).then(([catRes, popRes, trendRes]) => {
      if (catRes.data) setCategories(catRes.data);
      if (popRes.data) setPopular(popRes.data);
      if (trendRes.data) setTrending(trendRes.data);
    });
  }, []);

  const encodedUrl = encodeURIComponent(postUrl);
  const encodedTitle = encodeURIComponent(postTitle);

  const shareLinks = [
    { name: 'WhatsApp', color: 'bg-green-600 hover:bg-green-700', url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: 'Twitter', color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}` },
    { name: 'Facebook', color: 'bg-blue-600 hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
  ];

  return (
    <aside className="space-y-6">
      {/* Share buttons */}
      <div className="p-4 bg-secondary rounded-lg">
        <h4 className="font-heading text-sm font-bold mb-3 flex items-center gap-2">
          <Share2 size={14} /> Bagikan Artikel
        </h4>
        <div className="flex flex-col gap-2">
          {shareLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${link.color} text-white text-xs font-medium py-2 px-3 rounded-md text-center transition-colors`}
            >
              {link.name}
            </a>
          ))}
        </div>
      </div>

      {/* Ad banner */}
      <AdBanner position="sidebar" />

      {/* Categories */}
      <div className="p-4 bg-secondary rounded-lg">
        <h4 className="font-heading text-sm font-bold mb-3">Kategori</h4>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`}>
              <Badge variant="outline" className="font-body text-xs capitalize cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                {cat.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular posts */}
      <div className="p-4 bg-secondary rounded-lg">
        <h4 className="font-heading text-sm font-bold mb-3">🔥 Berita Populer</h4>
        <div className="space-y-3">
          {popular.map((p, i) => (
            <Link key={p.id} to={`/post/${p.slug}`} className="flex gap-3 group">
              <span className="font-heading text-2xl font-bold text-muted-foreground/40 leading-none">{i + 1}</span>
              <div className="flex-1 min-w-0">
                {p.cover_image && (
                  <img src={p.cover_image} alt="" className="w-full h-16 object-cover rounded mb-1.5" />
                )}
                <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {p.title}
                </p>
                <span className="text-[10px] text-muted-foreground">{p.views} views</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Trending / Latest posts */}
      <div className="p-4 bg-secondary rounded-lg">
        <h4 className="font-heading text-sm font-bold mb-3">📈 Berita Terbaru</h4>
        <div className="space-y-3">
          {trending.map(p => (
            <Link key={p.id} to={`/post/${p.slug}`} className="flex gap-3 group">
              {p.cover_image && (
                <img src={p.cover_image} alt="" className="w-14 h-14 object-cover rounded flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {p.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default PostSidebar;
