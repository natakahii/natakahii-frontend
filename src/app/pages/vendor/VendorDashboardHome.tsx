import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Skeleton } from '../../components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { ArrowUpRight, ArrowDownRight, Package, AlertTriangle, TrendingUp, DollarSign, ShoppingBag, Truck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchVendorOverview } from '../../services/analyticsService';
import { fetchVendorDropoffs } from '../../services/dropoffService';

const revenueData = [
  { date: '1 Apr', revenue: 4000 },
  { date: '5 Apr', revenue: 3000 },
  { date: '10 Apr', revenue: 5500 },
  { date: '15 Apr', revenue: 4500 },
  { date: '20 Apr', revenue: 7000 },
  { date: '25 Apr', revenue: 6500 },
  { date: '30 Apr', revenue: 8500 },
];

const defaultAnalytics = {
  total_products: 0,
  active_products: 0,
  total_orders: 0,
  total_revenue: 0,
};

const recentOrders = [
  { id: 'ORD-7291', customer: 'John Kamau', status: 'Pending', total: 'KES 4,500', date: '2 mins ago' },
  { id: 'ORD-7290', customer: 'Sarah Ochieng', status: 'Processing', total: 'KES 12,000', date: '1 hour ago' },
  { id: 'ORD-7289', customer: 'David Njoroge', status: 'Shipped', total: 'KES 3,200', date: '3 hours ago' },
  { id: 'ORD-7288', customer: 'Mercy Wanjiku', status: 'Delivered', total: 'KES 8,500', date: '1 day ago' },
];

const lowStockProducts = [
  { id: 1, name: 'African Print Maxi Dress', stock: 2, image: 'https://images.unsplash.com/photo-1550614000-4b95d4ed79ea?w=200&h=200&fit=crop' },
  { id: 2, name: 'Handmade Beaded Necklace', stock: 5, image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=200&h=200&fit=crop' },
  { id: 3, name: 'Maasai Shuka Blanket', stock: 1, image: 'https://images.unsplash.com/photo-1602164945488-322a0e0a09e4?w=200&h=200&fit=crop' },
];

export function VendorDashboardHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState(defaultAnalytics);
  const [pendingDropoffs, setPendingDropoffs] = useState(0);

  useEffect(() => {
    let isMounted = true;

    Promise.all([fetchVendorOverview(), fetchVendorDropoffs(1)])
      .then(([overviewResponse, dropoffResponse]) => {
        if (!isMounted) return;
        setAnalytics(
          overviewResponse.analytics ??
          (overviewResponse as any)?.data?.analytics ??
          defaultAnalytics
        );
        setPendingDropoffs(dropoffResponse.dropoffs?.data?.length ?? 0);
      })
      .catch(() => {
        // Keep placeholder analytics in case of error
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Dashboard</h1>
          <p className="text-[var(--color-text-muted)]">Welcome back, Mambo Jambo Store. Here's what's happening today.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-[var(--color-primary)] border-[var(--color-primary)]">
            Download Report
          </Button>
          <Button className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white">
            Add Product
          </Button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Total Revenue</p>
                {isLoading ? <Skeleton className="h-8 w-32" /> : <p className="text-2xl font-bold text-[var(--color-text-heading)]">KES {(analytics?.total_revenue ?? 0).toLocaleString()}</p>}
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
            </div>
            {isLoading ? <Skeleton className="h-4 w-24 mt-4" /> : (
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--color-success)] flex items-center font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +12.5%
                </span>
                <span className="text-[var(--color-text-muted)] ml-2">from last month</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Orders Today</p>
                {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold text-[var(--color-text-heading)]">{analytics?.total_orders ?? 0}</p>}
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent-bg)] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[var(--color-accent)]" />
              </div>
            </div>
            {isLoading ? <Skeleton className="h-4 w-28 mt-4" /> : (
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--color-success)] flex items-center font-medium">
                  <ArrowUpRight className="w-4 h-4 mr-1" />
                  +4.2%
                </span>
                <span className="text-[var(--color-text-muted)] ml-2">from yesterday</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Products Listed</p>
                {isLoading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-bold text-[var(--color-text-heading)]">{analytics?.total_products ?? 0}</p>}
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-info-bg)] flex items-center justify-center">
                <Package className="w-5 h-5 text-[var(--color-info)]" />
              </div>
            </div>
            {isLoading ? <Skeleton className="h-4 w-32 mt-4" /> : (
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--color-text-muted)] flex items-center font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  12 added this week
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--color-text-muted)]">Pending Dropoffs</p>
                {isLoading ? <Skeleton className="h-8 w-10" /> : <p className="text-2xl font-bold text-[var(--color-text-heading)]">{pendingDropoffs}</p>}
              </div>
              <div className="w-10 h-10 rounded-full bg-[var(--color-warning-bg)] flex items-center justify-center">
                <Truck className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
            </div>
            {isLoading ? <Skeleton className="h-4 w-28 mt-4" /> : (
              <div className="mt-4 flex items-center text-sm">
                <span className="text-[var(--color-error)] flex items-center font-medium">
                  <ArrowDownRight className="w-4 h-4 mr-1" />
                  2 urgent
                </span>
                <span className="text-[var(--color-text-muted)] ml-2">due today</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Row 3: Analytics Chart (Revenue last 30 days) - Spans 2 columns */}
        <Card className="lg:col-span-2 border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[var(--color-text-heading)]">Revenue Overview</CardTitle>
              <CardDescription>Last 30 Days</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[var(--color-primary)]">View Report</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} 
                      tickFormatter={(value) => `K${value/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                      itemStyle={{ color: 'var(--color-text-heading)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-accent)" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Row 2: Recent Orders (Mini) - 1 column */}
        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg text-[var(--color-text-heading)]">Recent Orders</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-[var(--color-primary)]">All</Button>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] last:border-0 last:pb-0">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-16 ml-auto" />
                      <Skeleton className="h-4 w-12 ml-auto" />
                    </div>
                  </div>
                ))
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-text-heading)]">{order.customer}</p>
                      <div className="flex items-center text-xs text-[var(--color-text-muted)] gap-2 mt-1">
                        <span>{order.id}</span>
                        <span>•</span>
                        <span>{order.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[var(--color-text-heading)]">{order.total}</p>
                      <Badge variant="outline" className={`mt-1 text-[10px] uppercase
                        ${order.status === 'Pending' ? 'border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning-bg)]' : 
                          order.status === 'Processing' ? 'border-[var(--color-info)] text-[var(--color-info)] bg-[var(--color-info-bg)]' :
                          order.status === 'Delivered' ? 'border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success-bg)]' :
                          'border-[var(--color-text-muted)] text-[var(--color-text-muted)]'
                        }
                      `}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Low Stock Alerts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
            Low Stock Alerts
          </h2>
          <Button variant="link" className="text-[var(--color-primary)]">View Inventory</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border border-[var(--color-warning)]/30 shadow-sm transition-shadow">
                <CardContent className="p-4 flex gap-4 items-center">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="w-16 h-8 rounded-md" />
                </CardContent>
              </Card>
            ))
          ) : (
            lowStockProducts.map((product) => (
              <Card key={product.id} className="border border-[var(--color-warning)] shadow-sm hover:shadow-[var(--shadow-level-2)] transition-shadow">
                <CardContent className="p-4 flex gap-4 items-center">
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover bg-[var(--color-bg-card)]" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="destructive" className="bg-[var(--color-error)] text-white text-[10px]">
                        {product.stock} left in stock
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="border-[var(--color-primary)] text-[var(--color-primary)] shrink-0 h-8 text-xs">
                    Restock
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
