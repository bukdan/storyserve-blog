'use client';

import Link from 'next/link';

const BlogFooter = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground mt-16">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-3">
              TheMag<span className="text-accent">.</span>
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Platform blog & majalah digital dengan konten berkualitas tinggi dari
              penulis-penulis terbaik.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Navigasi</h4>
            <div className="space-y-2 text-sm">
              <Link
                href="/"
                className="block text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Beranda
              </Link>
              <Link
                href="/login"
                className="block text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                Masuk
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold mb-3">Kontak</h4>
            <p className="text-sm text-primary-foreground/70">hello@themag.id</p>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} TheMag. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default BlogFooter;
