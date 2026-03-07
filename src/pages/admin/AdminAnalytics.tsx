import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Eye, MousePointerClick, TrendingUp } from 'lucide-react';

const AdminAnalytics = () => {
  const [period, setPeriod] = useState('7');
  const [adStats, setAdStats] = useState<any[]>([]);
  const [slotStats, setSlotStats] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [totals, setTotals] = useState({ impressions: 0, clicks: 0, ctr: 0 });

  useEffect(() => {
    const fetchAnalytics = async () => {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(period));
      const sinceStr = since.toISOString();

      // Fetch all impressions and clicks
      const [impressionsRes, clicksRes, adsRes, slotsRes] = await Promise.all([
        supabase.from('ad_impressions').select('ad_id, created_at').gte('created_at', sinceStr),
        supabase.from('ad_clicks').select('ad_id, created_at').gte('created_at', sinceStr),
        supabase.from('ads').select('id, title, slot_id'),
        supabase.from('ad_slots').select('id, name, position'),
      ]);

      const impressions = impressionsRes.data || [];
      const clicks = clicksRes.data || [];
      const ads = adsRes.data || [];
      const slots = slotsRes.data || [];

      // Totals
      const totalImpressions = impressions.length;
      const totalClicks = clicks.length;
      setTotals({
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      });

      // Per ad stats
      const adMap = new Map<string, { title: string; impressions: number; clicks: number }>();
      ads.forEach(ad => adMap.set(ad.id, { title: ad.title, impressions: 0, clicks: 0 }));
      impressions.forEach(i => {
        const a = adMap.get(i.ad_id);
        if (a) a.impressions++;
      });
      clicks.forEach(c => {
        const a = adMap.get(c.ad_id);
        if (a) a.clicks++;
      });
      setAdStats(Array.from(adMap.values()).map(a => ({
        ...a,
        ctr: a.impressions > 0 ? ((a.clicks / a.impressions) * 100).toFixed(1) : '0',
      })));

      // Per slot stats
      const slotMap = new Map<string, { name: string; impressions: number; clicks: number }>();
      slots.forEach(s => slotMap.set(s.id, { name: `${s.name} (${s.position})`, impressions: 0, clicks: 0 }));
      const adSlotMap = new Map<string, string>();
      ads.forEach(ad => adSlotMap.set(ad.id, ad.slot_id));
      impressions.forEach(i => {
        const slotId = adSlotMap.get(i.ad_id);
        if (slotId) {
          const s = slotMap.get(slotId);
          if (s) s.impressions++;
        }
      });
      clicks.forEach(c => {
        const slotId = adSlotMap.get(c.ad_id);
        if (slotId) {
          const s = slotMap.get(slotId);
          if (s) s.clicks++;
        }
      });
      setSlotStats(Array.from(slotMap.values()).map(s => ({
        ...s,
        ctr: s.impressions > 0 ? ((s.clicks / s.impressions) * 100).toFixed(1) : '0',
      })));

      // Daily stats
      const dayMap = new Map<string, { date: string; impressions: number; clicks: number }>();
      for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        dayMap.set(key, { date: key, impressions: 0, clicks: 0 });
      }
      impressions.forEach(i => {
        const key = i.created_at.slice(0, 10);
        const day = dayMap.get(key);
        if (day) day.impressions++;
      });
      clicks.forEach(c => {
        const key = c.created_at.slice(0, 10);
        const day = dayMap.get(key);
        if (day) day.clicks++;
      });
      setDailyStats(Array.from(dayMap.values()));
    };

    fetchAnalytics();
  }, [period]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Analytics Iklan</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 hari</SelectItem>
            <SelectItem value="30">30 hari</SelectItem>
            <SelectItem value="90">90 hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Impressions</CardTitle>
            <Eye className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold font-heading">{totals.impressions.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clicks</CardTitle>
            <MousePointerClick className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold font-heading">{totals.clicks.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">CTR</CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold font-heading">{totals.ctr.toFixed(2)}%</div></CardContent>
        </Card>
      </div>

      {/* Daily chart */}
      <Card className="mb-8">
        <CardHeader><CardTitle>Tren Harian</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                <Legend />
                <Line type="monotone" dataKey="impressions" stroke="hsl(var(--primary))" strokeWidth={2} name="Impressions" />
                <Line type="monotone" dataKey="clicks" stroke="hsl(var(--accent))" strokeWidth={2} name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Per ad chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Per Iklan</CardTitle></CardHeader>
          <CardContent>
            {adStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada data iklan</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={adStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="title" type="category" width={100} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                    <Bar dataKey="impressions" fill="hsl(var(--primary))" name="Impressions" />
                    <Bar dataKey="clicks" fill="hsl(var(--accent))" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Per Slot</CardTitle></CardHeader>
          <CardContent>
            {slotStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Belum ada data slot</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={slotStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                    <Bar dataKey="impressions" fill="hsl(var(--primary))" name="Impressions" />
                    <Bar dataKey="clicks" fill="hsl(var(--accent))" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
