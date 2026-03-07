import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold font-heading">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">
          Oops! Halaman tidak ditemukan
        </p>
        <Link
          href="/"
          className="text-accent underline hover:text-accent/90 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
