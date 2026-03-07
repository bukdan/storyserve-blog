import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const SearchBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, title, slug, excerpt, categories(name)')
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
        .order('published_at', { ascending: false })
        .limit(6);
      setResults(data || []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Cari artikel..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => query.length >= 2 && setOpen(true)}
          className="pl-9 pr-8"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X size={14} />
          </button>
        )}
      </form>
      {open && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Mencari...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">Tidak ditemukan</div>
          ) : (
            results.map(post => (
              <Link
                key={post.id}
                to={`/post/${post.slug}`}
                onClick={() => { setOpen(false); setQuery(''); }}
                className="block px-4 py-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
              >
                <div className="flex items-center gap-2 mb-1">
                  {post.categories?.name && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{post.categories.name}</Badge>
                  )}
                </div>
                <p className="font-medium text-sm line-clamp-1">{post.title}</p>
                {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.excerpt}</p>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
