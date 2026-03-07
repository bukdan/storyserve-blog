'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { Eye, MousePointer, TrendingUp, MessageSquare } from 'lucide-react';

interface Analytics {
  totals: {
    views: number;
    clicks: number;
    impressions: number;
    comments: number;
    ctr: number;
  };
  adStats: { title: string; impressions: number; clicks: number; ctr: string }[];
  dailyStats: { date: string; impressions: number; clicks: number }[];
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics>({
    totals: {
      views: 0,
      clicks: 0,
      impressions: 0,
      comments: 0,
      ctr: 0,
    },
    adStats: [],
    dailyStats: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data) setAnalytics(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-muted-foreground">Memuat...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="font-heading text-2xl font-bold mb-6">Analytics</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views
            </CardTitle>
            <Eye className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {analytics.totals.views.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ad Clicks
            </CardTitle>
            <MousePointer className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {analytics.totals.clicks.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ad Impressions
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {analytics.totals.impressions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comments
            </CardTitle>
            <MessageSquare className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">
              {analytics.totals.comments.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTR Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="font-heading">Click-Through Rate (CTR)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold font-heading text-accent">
            {analytics.totals.ctr.toFixed(2)}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Rasio klik terhadap impressi iklan
          </p>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily stats chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Statistik Harian (7 hari terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.dailyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => v.slice(5)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    name="Impressions"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="Clicks"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Belum ada data
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad stats chart */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Performa Iklan</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.adStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.adStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="title"
                    type="category"
                    width={100}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => (v.length > 12 ? `${v.slice(0, 12)}...` : v)}
                  />
                  <Tooltip />
                  <Bar dataKey="impressions" name="Impressions" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="clicks" name="Clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                Belum ada data iklan
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
