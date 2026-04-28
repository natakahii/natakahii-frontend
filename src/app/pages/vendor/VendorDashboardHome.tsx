import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, DollarSign, Package, ShoppingBag, Store, Truck } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { EmptyState } from '../../components/ui/empty-state';
import { Skeleton } from '../../components/ui/skeleton';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useAuth } from '../../providers/AuthProvider';
import { fetchVendorOverview, VendorOverviewResponse } from '../../services/analyticsService';
import { formatCompactCurrency, formatCurrency } from '../../utils/currency';

function formatDateLabel(value?: string) {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function getOrderStatusClasses(status: string) {
  const normalizedStatus = status.toLowerCase();

  if (['delivered', 'paid'].includes(normalizedStatus)) {
    return 'border-[var(--color-success)] text-[var(--color-success)] bg-[var(--color-success-bg)]';
  }

  if (['processing', 'shipped', 'in_transit'].includes(normalizedStatus)) {
    return 'border-[var(--color-info)] text-[var(--color-info)] bg-[var(--color-info-bg)]';
  }

  if (['cancelled', 'failed'].includes(normalizedStatus)) {
    return 'border-[var(--color-error)] text-[var(--color-error)] bg-[var(--color-error-bg)]';
  }

  return 'border-[var(--color-warning)] text-[var(--color-warning)] bg-[var(--color-warning-bg)]';
}

export function VendorDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [overview, setOverview] = useState<VendorOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError(null);

    fetchVendorOverview()
      .then((response) => {
        if (!isMounted) return;
        setOverview(response);
      })
      .catch((nextError: any) => {
        if (!isMounted) return;
        setOverview(null);
        setError(nextError?.message || 'Unable to load your vendor dashboard right now.');
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
  const hasProducts = (analytics?.total_products ?? 0) > 0;
  const allRevenueIsZero = useMemo(
    () => (overview?.daily_metrics ?? []).every((entry) => entry.revenue === 0),
    [overview?.daily_metrics],
  );
  const vendorStatus = user?.vendor?.status ? String(user.vendor.status).replace(/_/g, ' ') : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-heading)]">
              {user?.vendor?.shop_name || 'Vendor Dashboard'}
            </h1>
            {vendorStatus && (
              <Badge className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg)] capitalize">
                {vendorStatus}
              </Badge>
            )}
          </div>
          <p className="text-[var(--color-text-muted)] mt-1">
            Track the real activity in your store, from listed products to order and fulfillment progress.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-[var(--color-primary)] border-[var(--color-primary)]"
            onClick={() => navigate('/vendor/dashboard/settings')}
          >
            Store Settings
          </Button>
          <Button
            type="button"
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-dark)] text-white"
            onClick={() => navigate('/vendor/dashboard/products/add')}
          >
            Add Product
          </Button>
        </div>
      </div>

      {error && !isLoading && (
        <Card className="border-[var(--color-error)] bg-[var(--color-error-bg)] shadow-sm">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-bold text-[var(--color-text-heading)]">Dashboard data unavailable</h2>
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
            title: 'Total Revenue',
            value: analytics ? formatCurrency(analytics.total_revenue) : null,
            subtitle: 'Revenue captured from this vendor’s order items.',
            icon: DollarSign,
            iconBg: 'bg-[var(--color-primary-bg)]',
            iconColor: 'text-[var(--color-primary)]',
          },
          {
            title: 'Total Orders',
            value: analytics ? analytics.total_orders.toLocaleString() : null,
            subtitle: 'Distinct orders that include your products.',
            icon: ShoppingBag,
            iconBg: 'bg-[var(--color-accent-bg)]',
            iconColor: 'text-[var(--color-accent)]',
          },
          {
            title: 'Products Listed',
            value: analytics ? analytics.total_products.toLocaleString() : null,
            subtitle: analytics
              ? `${analytics.active_products} active • ${analytics.draft_products} draft`
              : 'Active and draft catalog totals.',
            icon: Package,
            iconBg: 'bg-[var(--color-info-bg)]',
            iconColor: 'text-[var(--color-info)]',
          },
          {
            title: 'Pending Dropoffs',
            value: analytics ? analytics.pending_dropoffs.toLocaleString() : null,
            subtitle: analytics
              ? `${analytics.low_stock_count} low stock products need attention`
              : 'Fulfillment tasks still awaiting action.',
            icon: Truck,
            iconBg: 'bg-[var(--color-warning-bg)]',
            iconColor: 'text-[var(--color-warning)]',
          },
        ].map((card) => (
          <Card key={card.title} className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--color-text-muted)]">{card.title}</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-28" />
                  ) : (
                    <p className="text-2xl font-bold text-[var(--color-text-heading)]">{card.value}</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-4 w-full mt-4" />
              ) : (
                <p className="mt-4 text-sm text-[var(--color-text-muted)]">{card.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && !error && !hasProducts && (
        <Card className="border-[var(--color-border)] shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              variant="products"
              title="Your store is ready for its first product"
              description="The dashboard is now connected to live vendor data. Add your first product to start seeing revenue, orders, and inventory insights here."
              actionLabel="Add First Product"
              actionOnClick={() => navigate('/vendor/dashboard/products/add')}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[var(--color-text-heading)]">Revenue Overview</CardTitle>
              <CardDescription>Daily vendor revenue for the last 30 days.</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="sm" className="text-[var(--color-primary)]" onClick={() => navigate('/vendor/dashboard/analytics')}>
              Open Analytics
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : allRevenueIsZero ? (
                <div className="w-full h-full rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] flex items-center justify-center px-6 text-center text-sm text-[var(--color-text-muted)]">
                  Revenue will appear here once orders for your products start coming in.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.daily_metrics ?? []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashboardRevenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-text-muted)' }} tickFormatter={(value) => formatCompactCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#dashboardRevenueFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[var(--color-border)] shadow-[var(--shadow-level-1)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-[var(--color-text-heading)]">Recent Orders</CardTitle>
            <CardDescription>Latest orders that include your products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                  <Skeleton className="h-4 w-40 mb-2" />
                  <Skeleton className="h-3 w-28 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : (overview?.recent_orders.length ?? 0) === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                Orders will show up here once customers start buying your products.
              </div>
            ) : (
              overview?.recent_orders.map((order) => (
                <div key={order.id} className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-text-heading)]">{order.customer_name}</p>
                      <p className="text-xs text-[var(--color-text-muted)] mt-1">
                        {order.order_number} • {formatDateLabel(order.created_at)}
                      </p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase ${getOrderStatusClasses(order.status)}`}>
                      {String(order.status).replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div className="text-xs text-[var(--color-text-body)]">
                      {order.products.slice(0, 2).join(', ') || 'Products pending'}
                      {order.products.length > 2 ? ` +${order.products.length - 2} more` : ''}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm text-[var(--color-text-heading)]">{formatCurrency(order.vendor_total)}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{order.item_count} items</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--color-text-heading)] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[var(--color-warning)]" />
            Low Stock Alerts
          </h2>
          <Button type="button" variant="link" className="text-[var(--color-primary)]" onClick={() => navigate('/vendor/dashboard/products')}>
            View Inventory
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="border-[var(--color-border)] shadow-sm">
                <CardContent className="p-4 flex gap-4 items-center">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (overview?.low_stock_products.length ?? 0) === 0 ? (
            <Card className="col-span-full border-[var(--color-border)] shadow-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--color-success-bg)] flex items-center justify-center mx-auto mb-4">
                  <Package className="w-6 h-6 text-[var(--color-success)]" />
                </div>
                <h3 className="font-bold text-[var(--color-text-heading)]">Inventory looks healthy</h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">
                  None of your active products are currently at low stock.
                </p>
              </CardContent>
            </Card>
          ) : (
            overview?.low_stock_products.map((product) => (
              <Card key={product.id} className="border border-[var(--color-warning)] shadow-sm hover:shadow-[var(--shadow-level-2)] transition-shadow">
                <CardContent className="p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--color-bg-card)] shrink-0">
                    {product.image ? (
                      <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[var(--color-primary-bg)] flex items-center justify-center">
                        <Store className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="destructive" className="bg-[var(--color-error)] text-white text-[10px]">
                        {product.stock} left
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {String(product.status).replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
