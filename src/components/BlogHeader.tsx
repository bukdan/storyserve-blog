import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import SearchBar from '@/components/SearchBar';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';

const BlogHeader = () => {
  const { user, signOut, role } = useAuth();
  const { theme, setTheme } = useTheme();
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('id, name, slug').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 gap-4">
          <Link to="/" className="font-heading text-2xl md:text-3xl font-bold text-foreground tracking-tight flex-shrink-0">
            TheMag<span className="text-accent">.</span>
          </Link>
          <div className="hidden md:block flex-1 max-w-sm">
            <SearchBar />
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-9 w-9">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            {user ? (
              <>
                {(role === 'admin' || role === 'author') && (
                  <Link to="/admin">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={signOut}>Keluar</Button>
              </>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm">Masuk</Button>
              </Link>
            )}
          </div>
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {/* Categories nav */}
        <nav className="hidden md:flex items-center gap-6 pb-3 text-sm font-medium">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Beranda</Link>
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="text-muted-foreground hover:text-foreground transition-colors capitalize">
              {cat.name}
            </Link>
          ))}
        </nav>
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 animate-fade-in">
            <div className="mb-3"><SearchBar /></div>
            <Link to="/" className="block py-2 text-muted-foreground" onClick={() => setMenuOpen(false)}>Beranda</Link>
            {categories.map(cat => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="block py-2 text-muted-foreground capitalize" onClick={() => setMenuOpen(false)}>
                {cat.name}
              </Link>
            ))}
            <button className="flex items-center gap-2 py-2 text-muted-foreground" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            </button>
            {user ? (
              <>
                {(role === 'admin' || role === 'author') && (
                  <Link to="/admin" className="block py-2 text-accent" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                )}
                <button className="block py-2 text-muted-foreground" onClick={() => { signOut(); setMenuOpen(false); }}>Keluar</button>
              </>
            ) : (
              <Link to="/login" className="block py-2 text-accent" onClick={() => setMenuOpen(false)}>Masuk</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default BlogHeader;
