'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BlogLayout from '@/components/blog/BlogLayout';
import AdBanner from '@/components/blog/AdBanner';
import SpaceBanner from '@/components/blog/SpaceBanner';
import RelatedPosts from '@/components/blog/RelatedPosts';
import PostSidebar from '@/components/blog/PostSidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  views: number;
  publishedAt: string | null;
  authorId: string;
  categoryId: string | null;
  category: { name: string; slug: string } | null;
  author: { id: string; name: string; avatarUrl: string | null } | null;
  tags: { id: string; name: string; slug: string }[];
}

interface Comment {
  id: string;
  name: string;
  email: string | null;
  message: string;
  createdAt: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const res = await fetch(`/api/posts/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
        setComments(data.comments || []);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !commentForm.name.trim() || !commentForm.message.trim()) return;

    setSubmitting(true);
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: post.id,
        name: commentForm.name.trim(),
        email: commentForm.email.trim() || null,
        message: commentForm.message.trim(),
      }),
    });

    if (res.ok) {
      toast.success('Komentar berhasil ditambahkan!');
      setCommentForm({ name: '', email: '', message: '' });
      const data = await res.json();
      setComments(data.comments);
    } else {
      toast.error('Gagal mengirim komentar.');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <BlogLayout>
        <div className="container py-20 text-center text-muted-foreground">
          Memuat artikel...
        </div>
      </BlogLayout>
    );
  }

  if (!post) {
    return (
      <BlogLayout>
        <div className="container py-20 text-center">
          <h1 className="font-heading text-3xl">Artikel tidak ditemukan</h1>
        </div>
      </BlogLayout>
    );
  }

  return (
    <BlogLayout>
      <SpaceBanner className="mx-auto max-w-4xl my-2" label="HEADER AD SPACE" />
      <AdBanner position="header" className="py-4 bg-secondary" />

      <article className="container mx-auto py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          {post.category?.name && (
            <Badge className="mb-3 bg-accent text-accent-foreground border-0 font-body text-xs uppercase tracking-wider">
              {post.category.name}
            </Badge>
          )}
          <h1 className="font-heading text-3xl md:text-5xl font-bold leading-tight mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-muted-foreground font-body mb-4">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground border-b border-border pb-6">
            {post.author && (
              <Link
                href={`/author/${post.author.id}`}
                className="font-medium text-foreground hover:text-accent transition-colors"
              >
                {post.author.name}
              </Link>
            )}
            <span>·</span>
            {post.publishedAt && (
              <span>
                {format(new Date(post.publishedAt), 'dd MMMM yyyy', {
                  locale: localeId,
                })}
              </span>
            )}
            <span>·</span>
            <span>{post.views} views</span>
          </div>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8 rounded-lg overflow-hidden animate-fade-in">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <div
              className="post-content"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="outline" className="font-body text-xs">
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Related Posts */}
            <RelatedPosts
              postId={post.id}
              categoryId={post.categoryId}
              authorId={post.authorId}
            />

            {/* Inline Ad */}
            <SpaceBanner className="my-6" label="INLINE AD SPACE" />
            <AdBanner position="article_inline" className="my-10" />

            {/* Comments */}
            <section className="mt-10 pt-8 border-t border-border">
              <h3 className="font-heading text-xl font-bold mb-6">
                Komentar ({comments.length})
              </h3>

              <form
                onSubmit={handleCommentSubmit}
                className="mb-8 space-y-4 p-6 bg-secondary rounded-lg"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nama *"
                    value={commentForm.name}
                    onChange={(e) =>
                      setCommentForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    maxLength={100}
                  />
                  <Input
                    placeholder="Email (opsional)"
                    type="email"
                    value={commentForm.email}
                    onChange={(e) =>
                      setCommentForm((f) => ({ ...f, email: e.target.value }))
                    }
                    maxLength={255}
                  />
                </div>
                <Textarea
                  placeholder="Tulis komentar... *"
                  value={commentForm.message}
                  onChange={(e) =>
                    setCommentForm((f) => ({ ...f, message: e.target.value }))
                  }
                  required
                  maxLength={1000}
                  rows={4}
                />
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Mengirim...' : 'Kirim Komentar'}
                </Button>
              </form>

              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="border-b border-border pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{comment.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(
                          new Date(comment.createdAt),
                          'dd MMM yyyy HH:mm',
                          { locale: localeId }
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90">{comment.message}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4">
            <div className="sticky top-20">
              <PostSidebar
                postUrl={
                  typeof window !== 'undefined' ? window.location.href : ''
                }
                postTitle={post.title}
              />
            </div>
          </aside>
        </div>
      </article>

      <SpaceBanner className="mx-auto max-w-4xl my-2" label="FOOTER AD SPACE" />
      <AdBanner position="footer" className="py-4 bg-secondary" />
    </BlogLayout>
  );
}
