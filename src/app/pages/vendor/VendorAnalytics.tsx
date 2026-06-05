import { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { AlertTriangle, BarChart3, Package, ShoppingBag, TrendingUp } from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { useVendorOverview } from '../../hooks/useVendorOverview';
import type { VendorDailyMetric } from '../../services/analyticsService';
import { safeFormatCurrency } from '../../utils/currency';
import {
  VendorAnalyticsSkeleton,
  VendorAreaChart,
  VendorBarChart,
  VendorCard,
  VendorChartLegend,
  VendorEmptyInline,
  VendorEmptyState,
  VendorInlineError,
  VendorPageHeader,
  VendorStatTile,
  staggerContainer,
  staggerItem,
} from '../../components/vendor';

type DateRange = '7d' | '30d' | '90d';

function prettifyStatus(status: string) {
  return status.replace(/_/g, ' ');
}

function getDropoffColor(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'qc_passed') return 'var(--vendor-accent-success)';
  if (normalized === 'qc_failed') return 'var(--color-error)';
  if (normalized === 'received' || normalized === 'qc_in_progress') return 'var(--color-info)';
  if (normalized === 'dropped_off') return 'var(--vendor-accent-action)';
  return 'var(--vendor-accent-warning)';
}

function filterMetricsByRange(data: VendorDailyMetric[], range: DateRange): VendorDailyMetric[] {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  if (data.length <= days) return data;
  return data.slice(-days);
}

export function VendorAnalytics() {
  const { overview, isLoading, error, refresh } = useVendorOverview();
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const analytics = overview?.analytics;
  const filteredMetrics = useMemo(
    () => filterMetricsByRange(overview?.daily_metrics ?? [], dateRange),
    [overview?.daily_metrics, dateRange],
  );

  const averageOrderValue = useMemo(() => {
    if (!analytics || analytics.total_orders === 0) return 0;
    return analytics.total_revenue / analytics.total_orders;
  }, [analytics]);

  const dropoffChartData = useMemo(
    () =>
      (overview?.dropoff_status_breakdown ?? []).map((entry) => ({
        ...entry,
        color: getDropoffColor(entry.status),
        label: prettifyStatus(entry.status),
      })),
    [overview?.dropoff_status_breakdown],
  );

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (isLoading && !overview) {
    return <VendorAnalyticsSkeleton />;
  }

  const hasNoData = !isLoading && (analytics?.total_orders ?? 0) === 0;

  return (
    <div className="space-y-6">
      <VendorPageHeader
        title="Analytics"
        description="Deep performance insights for your store."
        badge={
          <div className="flex gap-1 p-1 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            {(['7d', '30d', '90d'] as DateRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  dateRange === range
                    ? 'bg-[var(--vendor-accent-action)] text-white shadow-sm'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)]'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        }
      />

      {error && <VendorInlineError message={error} onRetry={refresh} />}

      {hasNoData && (
        <VendorEmptyState
          variant="no-analytics"
          title="Analytics warming up"
          description="Once you make your first sale, charts and rankings will populate here automatically."
          actionLabel="Add Products"
          actionHref="/vendor/dashboard/products"
        />
      )}

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <motion.div variants={staggerItem}>
          <VendorStatTile title="Revenue" value={analytics?.total_revenue ?? null} subtitle="All-time vendor revenue" icon={TrendingUp} accent="success" isLoading={isLoading} isCurrency />
        </motion.div>
        <motion.div variants={staggerItem}>
          <VendorStatTile title="Orders" value={analytics?.total_orders ?? null} subtitle="Distinct orders with your products" icon={ShoppingBag} accent="action" isLoading={isLoading} />
        </motion.div>
        <motion.div variants={staggerItem}>
          <VendorStatTile title="Avg Order Value" value={Math.round(averageOrderValue)} subtitle="Revenue ÷ order count" icon={BarChart3} accent="neutral" isLoading={isLoading} isCurrency />
        </motion.div>
        <motion.div variants={staggerItem}>
          <VendorStatTile
            title="Active Catalog"
            value={analytics?.active_products ?? null}
            subtitle={analytics ? `${analytics.low_stock_count} low stock · ${analytics.pending_dropoffs} dropoffs` : undefined}
            icon={Package}
            accent="warning"
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VendorCard glow className="p-6">
          <h3 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading mb-1">Revenue Trend</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Daily revenue over selected period</p>
          {isLoading ? (
            <Skeleton className="h-[300px] rounded-[16px]" />
          ) : hiddenSeries.has('revenue') ? (
            <VendorEmptyInline title="Revenue hidden" description="Click the legend to show revenue again." />
          ) : (
            <VendorAreaChart data={filteredMetrics} gradientId="analyticsRevenue" strokeColor="var(--vendor-accent-success)" />
          )}
          <VendorChartLegend
            items={[{ key: 'revenue', label: 'Revenue', color: 'var(--vendor-accent-success)' }]}
            hiddenKeys={hiddenSeries}
            onToggle={toggleSeries}
          />
        </VendorCard>

        <VendorCard glow className="p-6">
          <h3 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading mb-1">Order Volume</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-4">Daily order count</p>
          {isLoading ? (
            <Skeleton className="h-[300px] rounded-[16px]" />
          ) : hiddenSeries.has('orders') ? (
            <VendorEmptyInline title="Orders hidden" description="Click the legend to show orders again." />
          ) : (
            <VendorBarChart data={filteredMetrics} fillColor="var(--vendor-accent-action)" />
          )}
          <VendorChartLegend
            items={[{ key: 'orders', label: 'Orders', color: 'var(--vendor-accent-action)' }]}
            hiddenKeys={hiddenSeries}
            onToggle={toggleSeries}
          />
        </VendorCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <VendorCard className="xl:col-span-2 p-6">
          <h3 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading mb-4">Top Performing Products</h3>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (overview?.top_products.length ?? 0) === 0 ? (
            <VendorEmptyInline title="No product rankings yet" description="Rankings appear after your first orders." />
          ) : (
            <div className="space-y-3">
              {overview?.top_products.map((product, index) => (
                <motion.div
                  key={product.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center gap-4 p-3 rounded-[16px] border border-[var(--color-border)]/60 hover:shadow-md transition-shadow"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--vendor-accent-action-bg)] flex items-center justify-center text-sm font-bold text-[var(--vendor-accent-action)]">
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[var(--color-bg-card)] shrink-0">
                    {product.image ? (
                      <ImageWithFallback src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-[var(--vendor-accent-action)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[var(--color-text-heading)] truncate">{product.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{product.units_sold} units sold</p>
                  </div>
                  <p className="font-bold text-sm text-[var(--color-text-heading)]">{safeFormatCurrency(product.revenue)}</p>
                </motion.div>
              ))}
            </div>
          )}
        </VendorCard>

        <VendorCard className="p-6">
          <h3 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading mb-4">Dropoff Status</h3>
          <div className="h-[220px] relative">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-xl" />
            ) : dropoffChartData.length === 0 ? (
              <VendorEmptyInline title="No dropoffs yet" description="Fulfillment data will appear here." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dropoffChartData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="count">
                      {dropoffChartData.map((entry) => (
                        <Cell key={entry.status} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, _name: string, entry: { payload?: { label?: string } }) => [
                        value,
                        entry?.payload?.label ?? 'Dropoffs',
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[var(--color-text-heading)] vendor-heading">
                    {dropoffChartData.reduce((t, e) => t + e.count, 0)}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">Dropoffs</span>
                </div>
              </>
            )}
          </div>
          {!isLoading && dropoffChartData.length > 0 && (
            <div className="mt-4 space-y-2">
              {dropoffChartData.map((entry) => (
                <div key={entry.status} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[var(--color-text-body)] capitalize">{entry.label}</span>
                  <span className="font-bold ml-auto">{entry.count}</span>
                </div>
              ))}
            </div>
          )}
        </VendorCard>
      </div>

      {(overview?.low_stock_products.length ?? 0) > 0 && (
        <VendorCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading">Low Stock Watchlist</h3>
            {analytics && analytics.low_stock_count > 0 && (
              <Badge className="bg-[var(--vendor-accent-warning-bg)] text-[var(--vendor-accent-warning)] border-0">
                {analytics.low_stock_count} flagged
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {overview?.low_stock_products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 border border-[var(--vendor-accent-warning)]/30 rounded-[16px] p-4">
                <AlertTriangle className="w-5 h-5 text-[var(--vendor-accent-warning)] shrink-0" />
                <div>
                  <p className="font-semibold text-sm line-clamp-2">{product.name}</p>
                  <p className="text-xs text-[var(--vendor-accent-warning)] font-bold mt-1">{product.stock} left</p>
                </div>
              </div>
            ))}
          </div>
        </VendorCard>
      )}
    </div>
  );
}
