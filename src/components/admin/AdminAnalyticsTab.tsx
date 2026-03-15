import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Clock } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  created_at: string;
  btc_amount: number | null;
  service_price?: number;
  service_name?: string;
}

interface AdminAnalyticsTabProps {
  orders: Order[];
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

const CHART_COLORS = [
  'hsl(200, 98%, 39%)',   // primary
  'hsl(142, 76%, 36%)',   // success
  'hsl(280, 100%, 50%)',  // accent
  'hsl(38, 92%, 50%)',    // warning
  'hsl(0, 84%, 60%)',     // destructive
  'hsl(200, 100%, 60%)',  // primary-glow
];

const STATUS_COLORS: Record<string, string> = {
  completed: 'hsl(142, 76%, 36%)',
  paid: 'hsl(142, 76%, 46%)',
  confirmed: 'hsl(200, 98%, 39%)',
  pending: 'hsl(38, 92%, 50%)',
  confirming: 'hsl(280, 100%, 50%)',
  cancelled: 'hsl(0, 84%, 60%)',
  failed: 'hsl(0, 62%, 50%)',
  expired: 'hsl(220, 10%, 50%)',
};

const AdminAnalyticsTab = ({ orders }: AdminAnalyticsTabProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');

  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return orders.filter(o => new Date(o.created_at) >= cutoff);
  }, [orders, timeRange]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const paidStatuses = ['paid', 'confirmed', 'completed'];
    const paidOrders = filteredOrders.filter(o => paidStatuses.includes(o.status));
    const revenue = paidOrders.reduce((sum, o) => sum + (o.service_price || 0), 0);
    const pendingOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'confirming');
    const conversionRate = total > 0 ? ((paidOrders.length / total) * 100).toFixed(1) : '0';

    return { total, paidCount: paidOrders.length, revenue, pendingCount: pendingOrders.length, conversionRate };
  }, [filteredOrders]);

  const dailyData = useMemo(() => {
    const map = new Map<string, { date: string; orders: number; revenue: number }>();
    const paidStatuses = ['paid', 'confirmed', 'completed'];

    filteredOrders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const entry = map.get(date) || { date, orders: 0, revenue: 0 };
      entry.orders++;
      if (paidStatuses.includes(o.status)) {
        entry.revenue += o.service_price || 0;
      }
      map.set(date, entry);
    });

    return Array.from(map.values());
  }, [filteredOrders]);

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    filteredOrders.forEach(o => {
      counts.set(o.status, (counts.get(o.status) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; orders: number; revenue: number }>();
    const paidStatuses = ['paid', 'confirmed', 'completed'];

    filteredOrders.forEach(o => {
      const name = o.service_name || 'Unknown';
      const entry = map.get(name) || { name, orders: 0, revenue: 0 };
      entry.orders++;
      if (paidStatuses.includes(o.status)) {
        entry.revenue += o.service_price || 0;
      }
      map.set(name, entry);
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [filteredOrders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-[var(--shadow-elevated)]">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs text-muted-foreground">
            {entry.name}: {entry.name === 'revenue' ? `$${entry.value.toFixed(2)}` : entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Time range selector */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as TimeRange[]).map(range => (
          <Button
            key={range}
            variant={timeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === 'all' ? 'All Time' : `Last ${range.replace('d', ' days')}`}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <ShoppingCart className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Paid Orders</p>
                <p className="text-2xl font-bold">{stats.paidCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Conversion</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders & Revenue over time */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders & Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 60%)' }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 60%)' }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 60%)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="hsl(200, 98%, 39%)" strokeWidth={2} dot={false} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">No data for this period</p>
            )}
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={280}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, i) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {statusData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[entry.name] || CHART_COLORS[i % CHART_COLORS.length] }}
                        />
                        <span className="capitalize text-muted-foreground">{entry.name}</span>
                      </div>
                      <span className="font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-12">No data for this period</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Products by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 20%, 20%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(220, 10%, 60%)' }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fill: 'hsl(220, 10%, 60%)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(200, 98%, 39%)" radius={[0, 4, 4, 0]} name="Revenue ($)" />
                <Bar dataKey="orders" fill="hsl(280, 100%, 50%)" radius={[0, 4, 4, 0]} name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-12">No data for this period</p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground">
            Showing {filteredOrders.length} of {orders.length} total orders •
            Revenue includes paid, confirmed, and completed orders
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsTab;
