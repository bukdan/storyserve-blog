import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, MessageSquare, Eye, Megaphone } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ posts: 0, comments: 0, views: 0, ads: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [postsRes, commentsRes, viewsRes, adsRes] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('posts').select('views'),
        supabase.from('ads').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        posts: postsRes.count || 0,
        comments: commentsRes.count || 0,
        views: viewsRes.data?.reduce((sum, p) => sum + (p.views || 0), 0) || 0,
        ads: adsRes.count || 0,
      });
    };
    fetch();
  }, []);

  const cards = [
    { title: 'Total Artikel', value: stats.posts, icon: FileText, color: 'text-accent' },
    { title: 'Total Views', value: stats.views.toLocaleString(), icon: Eye, color: 'text-accent' },
    { title: 'Komentar', value: stats.comments, icon: MessageSquare, color: 'text-accent' },
    { title: 'Iklan Aktif', value: stats.ads, icon: Megaphone, color: 'text-accent' },
  ];

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-heading">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
