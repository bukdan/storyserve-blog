'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PostCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  categoryName?: string | null;
  authorName?: string;
  authorId?: string;
  publishedAt?: string | null;
  featured?: boolean;
}

const PostCard = ({
  title,
  slug,
  excerpt,
  coverImage,
  categoryName,
  authorName,
  authorId,
  publishedAt,
  featured,
}: PostCardProps) => {
  const dateStr = publishedAt
    ? format(new Date(publishedAt), 'dd MMM yyyy', { locale: id })
    : '';

  const renderAuthor = () => {
    if (!authorName) return null;
    if (authorId) {
      return (
        <Link
          href={`/author/${authorId}`}
          className="hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {authorName}
        </Link>
      );
    }
    return <span>{authorName}</span>;
  };

  if (featured) {
    return (
      <Link
        href={`/post/${slug}`}
        className="group block col-span-12 md:col-span-8 relative overflow-hidden rounded-lg animate-fade-in"
      >
        <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
          {coverImage ? (
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <span className="text-muted-foreground font-heading text-2xl">
                TheMag.
              </span>
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-foreground/90 to-transparent">
          {categoryName && (
            <Badge className="mb-2 bg-accent text-accent-foreground border-0 font-body text-xs uppercase tracking-wider">
              {categoryName}
            </Badge>
          )}
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-card leading-tight mb-2">
            {title}
          </h2>
          {excerpt && (
            <p className="text-card/80 text-sm line-clamp-2 font-body">{excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-card/60">
            {renderAuthor()}
            {dateStr && (
              <>
                <span>·</span>
                <span>{dateStr}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/post/${slug}`}
      className="group block col-span-12 sm:col-span-6 md:col-span-4 animate-fade-in"
    >
      <div className="aspect-[4/3] w-full overflow-hidden rounded-lg mb-3">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-muted-foreground font-heading">TheMag.</span>
          </div>
        )}
      </div>
      {categoryName && (
        <Badge
          variant="secondary"
          className="mb-2 font-body text-xs uppercase tracking-wider"
        >
          {categoryName}
        </Badge>
      )}
      <h3 className="font-heading text-lg font-semibold leading-snug group-hover:text-accent transition-colors line-clamp-2 mb-1">
        {title}
      </h3>
      {excerpt && (
        <p className="text-sm text-muted-foreground line-clamp-2 font-body">
          {excerpt}
        </p>
      )}
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        {renderAuthor()}
        {dateStr && (
          <>
            <span>·</span>
            <span>{dateStr}</span>
          </>
        )}
      </div>
    </Link>
  );
};

export default PostCard;
