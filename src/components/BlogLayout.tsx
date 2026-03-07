import { ReactNode } from 'react';
import BlogHeader from '@/components/BlogHeader';
import BlogFooter from '@/components/BlogFooter';

const BlogLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <BlogHeader />
      <main className="flex-1">{children}</main>
      <BlogFooter />
    </div>
  );
};

export default BlogLayout;
