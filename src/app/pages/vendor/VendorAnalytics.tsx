import { useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, BarChart3, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { fetchVendorOverview, VendorOverviewResponse } from '../../services/analyticsService';
import { formatCompactCurrency, formatCurrency } from '../../utils/currency';

function prettifyStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function getDropoffColor(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (normalizedStatus === 'qc_passed') return 'var(--color-success)';
  if (normalizedStatus === 'qc_failed') return 'var(--color-error)';
  if (normalizedStatus === 'received' || normalizedStatus === 'qc_in_progress') return 'var(--color-info)';
  if (normalizedStatus === 'dropped_off') return 'var(--color-accent)';
  return 'var(--color-warning)';
}

export function VendorAnalytics() {
  const [overview, setOverview] = useState<VendorOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchVendorOverview()
      .then((response) => {
        if (!isMounted) return;
        setOverview(response);
      })
      .catch((nextError: any) => {
        if (!isMounted) return;
        setOverview(null);
        setError(nextError?.message || 'Unable to load vendor analytics right now.');
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

  const analytics = overview?.analytics;
  const averageOrderValue = useMemo(() => {
    if (!analytics || analytics.total_orders === 0) {
      return 0;
    }

    return analytics.total_revenue / analytics.total_orders;
  }, [analytics]);

  const dropoffChartData = useMemo(
    () => (overview?.dropoff_status_breakdown ?? []).map((entry) => ({
      ...entry,
      color: getDropoffColor(entry.status),
      label: prettifyStatus(entry.status),
    })),
    [overview?.dropoff_status_breakdown],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">Analytics</h1>
          <p className="text-[var(--color-text-muted)]">Real store performance based on your current products, orders, and fulfillment activity.</p>
        </div>
        <Badge className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)]">
          Last 30 days
        </Badge>
      </div>

      {error && !isLoading && (
        <Card className="border-[var(--color-error)] bg-[var(--color-error-bg)] shadow-sm">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-[var(--color-text-heading)]">Analytics unavailable</h2>
              <p className="text-sm text-[var(--color-text-body)]">{error}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            title: 'Revenue',
            value: analytics ? formatCurrency(analytics.total_revenue) : null,
            icon: TrendingUp,
            subtitle: 'All vendor revenue recorded so far.',
          },
          {
            title: 'Orders',
            value: analytics ? analytics.total_orders.toLocaleString() : null,
            icon: ShoppingBag,
            subtitle: 'Distinct orders containing your products.',
          },
          {
            title: 'Average Order Value',
            value: analytics ? formatCurrency(Math.round(averageOrderValue)) : null,
            icon: BarChart3,
            subtitle: 'Revenue divided by order count.',
          },
          {
            title: 'Active Catalog',
            value: analytics ? analytics.active_products.toLocaleString() : null,
            icon: Package,
            subtitle: analytics ? `${analytics.low_stock_count} low stock • ${analytics.pending_dropoffs} pending dropoffs` : 'Inventory and logistics snapshot.',
          },
        ].map((card) => (
          <Card key={card.title} className="border-[var(--color-border)] shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{card.title}</p>
                  {isLoading ? <Skeleton className="h-8 w-24 mt-2" /> : <p className="text-2xl font-bold text-[var(--color-text-heading)] mt-2">{card.value}</p>}
                </div>
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
              </div>
              {isLoading ? <Skeleton className="h-4 w-full mt-4" /> : <p className="mt-4 text-sm text-[var(--color-text-muted)]">{card.subtitle}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-[var(--color-border)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
            <CardDescription>Daily vendor revenue for the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.daily_metrics ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="vendorAnalyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={(value) => formatCompactCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#vendorAnalyticsRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Order Volume</CardTitle>
            <CardDescription>Daily order count for the last 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overview?.daily_metrics ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} />
                    <Tooltip
                      formatter={(value: number) => [value, 'Orders']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Bar dataKey="orders" name="Orders" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={34} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-[var(--color-border)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top Performing Products</CardTitle>
            <CardDescription>Products ranked by vendor revenue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))
            ) : (overview?.top_products.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                Product performance rankings will appear after your first orders come in.
              </div>
            ) : (
              overview?.top_products.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--color-primary-bg)] flex items-center justify-center text-sm font-bold text-[var(--color-primary)] shrink-0">
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-bg-card)] shrink-0">
                    {product.image ? (
                      <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-bg)]">
                        <Package className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-1">{product.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">{product.units_sold} units sold</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-sm text-[var(--color-text-heading)]">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Vendor revenue</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Dropoff Status</CardTitle>
            <CardDescription>Current fulfillment progress across your vendor dropoffs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full relative">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : dropoffChartData.length === 0 ? (
                <div className="w-full h-full rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-center px-6 text-center text-sm text-[var(--color-text-muted)]">
                  No dropoff activity yet.
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dropoffChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {dropoffChartData.map((entry) => (
                          <Cell key={entry.status} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number, _name, entry: any) => [value, entry?.payload?.label || 'Dropoffs']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-[var(--color-text-heading)]">
                      {dropoffChartData.reduce((total, entry) => total + entry.count, 0)}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">Dropoffs</span>
                  </div>
                </>
              )}
            </div>

            {!isLoading && dropoffChartData.length > 0 && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                {dropoffChartData.map((entry) => (
                  <div key={entry.status} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-[var(--color-text-body)] capitalize">{entry.label}</span>
                    <span className="font-bold text-[var(--color-text-heading)] ml-auto">{entry.count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[var(--color-border)] shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Low Stock Watchlist</CardTitle>
            <CardDescription>Products currently close to selling out.</CardDescription>
          </div>
          {!isLoading && analytics && analytics.low_stock_count > 0 && (
            <Badge className="bg-[var(--color-warning-bg)] text-[var(--color-warning)] hover:bg-[var(--color-warning-bg)]">
              {analytics.low_stock_count} flagged
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 border border-[var(--color-border)] rounded-xl p-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (overview?.low_stock_products.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-[var(--color-success)]" />
              </div>
              <h3 className="font-bold text-[var(--color-text-heading)]">No urgent inventory issues</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                Your current stock levels look healthy.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {overview?.low_stock_products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 border border-[var(--color-warning)] rounded-xl p-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-bg-card)] shrink-0">
                    {product.image ? (
                      <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--color-primary-bg)]">
                        <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-2">{product.name}</p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <Badge variant="destructive" className="bg-[var(--color-error)] text-white">
                        {product.stock} left
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {prettifyStatus(product.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
