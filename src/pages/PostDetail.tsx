import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import BlogLayout from '@/components/BlogLayout';
import AdBanner from '@/components/AdBanner';
import RelatedPosts from '@/components/RelatedPosts';
import useSEO from '@/hooks/useSEO';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

const PostDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [tags, setTags] = useState<{ name: string; slug: string }[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from('posts')
        .select('*, categories(name, slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (data) {
        // Fetch author profile
        const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('user_id', data.author_id).single();
        setPost({ ...data, profiles: profile });
        // Increment views
        supabase.from('posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then(() => {});

        // Fetch tags
        const { data: tagData } = await supabase
          .from('post_tags')
          .select('tags(name, slug)')
          .eq('post_id', data.id);
        if (tagData) setTags(tagData.map((t: any) => t.tags));

        // Fetch comments
        const { data: commentData } = await supabase
          .from('comments')
          .select('*')
          .eq('post_id', data.id)
          .order('created_at', { ascending: false });
        if (commentData) setComments(commentData);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentForm.name.trim() || !commentForm.message.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('comments').insert({
      post_id: post.id,
      name: commentForm.name.trim(),
      email: commentForm.email.trim() || null,
      message: commentForm.message.trim(),
    });
    if (!error) {
      toast.success('Komentar berhasil ditambahkan!');
      setCommentForm({ name: '', email: '', message: '' });
      // Refresh comments
      const { data } = await supabase.from('comments').select('*').eq('post_id', post.id).order('created_at', { ascending: false });
      if (data) setComments(data);
    } else {
      toast.error('Gagal mengirim komentar.');
    }
    setSubmitting(false);
  };

  useSEO({
    title: post?.title,
    description: post?.excerpt || undefined,
    image: post?.cover_image || undefined,
    type: 'article',
  });

  if (loading) return <BlogLayout><div className="container py-20 text-center text-muted-foreground">Memuat artikel...</div></BlogLayout>;
  if (!post) return <BlogLayout><div className="container py-20 text-center"><h1 className="font-heading text-3xl">Artikel tidak ditemukan</h1></div></BlogLayout>;

  return (
    <BlogLayout>
      <AdBanner position="header" className="py-4 bg-secondary" />
      
      <article className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          {post.categories?.name && (
            <Badge className="mb-3 bg-accent text-accent-foreground border-0 font-body text-xs uppercase tracking-wider">
              {post.categories.name}
            </Badge>
          )}
          <h1 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">{post.title}</h1>
          {post.excerpt && <p className="text-lg text-muted-foreground font-body mb-4">{post.excerpt}</p>}
          <div className="flex items-center gap-3 text-sm text-muted-foreground border-b border-border pb-6">
            <Link to={`/author/${post.author_id}`} className="font-medium text-foreground hover:text-accent transition-colors">{post.profiles?.name}</Link>
            <span>·</span>
            {post.published_at && <span>{format(new Date(post.published_at), 'dd MMMM yyyy', { locale: localeId })}</span>}
            <span>·</span>
            <span>{post.views} views</span>
          </div>
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div className="mb-8 rounded-lg overflow-hidden animate-fade-in">
            <img src={post.cover_image} alt={post.title} className="w-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                {tags.map(tag => (
                  <Badge key={tag.slug} variant="outline" className="font-body text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Related Posts */}
            <RelatedPosts postId={post.id} categoryId={post.category_id} authorId={post.author_id} />

            {/* Inline Ad */}
            <AdBanner position="article_inline" className="my-10" />

            {/* Comments */}
            <section className="mt-10 pt-8 border-t border-border">
              <h3 className="font-heading text-xl font-bold mb-6">Komentar ({comments.length})</h3>
              
              <form onSubmit={handleCommentSubmit} className="mb-8 space-y-4 p-6 bg-secondary rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nama *"
                    value={commentForm.name}
                    onChange={e => setCommentForm(f => ({ ...f, name: e.target.value }))}
                    required
                    maxLength={100}
                  />
                  <Input
                    placeholder="Email (opsional)"
                    type="email"
                    value={commentForm.email}
                    onChange={e => setCommentForm(f => ({ ...f, email: e.target.value }))}
                    maxLength={255}
                  />
                </div>
                <Textarea
                  placeholder="Tulis komentar... *"
                  value={commentForm.message}
                  onChange={e => setCommentForm(f => ({ ...f, message: e.target.value }))}
                  required
                  maxLength={1000}
                  rows={4}
                />
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                </Button>
              </form>

              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="border-b border-border pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{comment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: localeId })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.message}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-6">
            <AdBanner position="sidebar" />
          </aside>
        </div>
      </article>

      <AdBanner position="footer" className="py-4 bg-secondary" />
    </BlogLayout>
  );
};

export default PostDetail;
