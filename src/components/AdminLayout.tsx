import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, FolderOpen, Tag, Megaphone, LayoutGrid, LogOut, Home, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/admin', icon: LayoutGrid, label: 'Dashboard' },
  { to: '/admin/posts', icon: FileText, label: 'Artikel' },
  { to: '/admin/categories', icon: FolderOpen, label: 'Kategori' },
  { to: '/admin/tags', icon: Tag, label: 'Tags' },
  { to: '/admin/ads', icon: Megaphone, label: 'Iklan' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading, signOut, profile, role } = useAuth();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="font-heading text-xl font-bold">
            TheMag<span className="text-sidebar-primary">.</span>
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">{profile?.name || 'Admin'}</p>
          <span className="text-xs bg-sidebar-accent text-sidebar-accent-foreground px-2 py-0.5 rounded mt-1 inline-block capitalize">
            {role || 'author'}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
            <Home size={18} /> Lihat Blog
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors w-full"
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <h1 className="font-heading text-lg font-bold">TheMag<span className="text-accent">.</span></h1>
          <div className="flex items-center gap-2">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className={`p-2 rounded ${active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}>
                  <item.icon size={18} />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
