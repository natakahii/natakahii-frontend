import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { DollarSign, Package, ShoppingBag, Truck } from 'lucide-react';
import { Badge, VendorVerificationBadge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { useAuth } from '../../providers/AuthProvider';
import { useVendorOverview } from '../../hooks/useVendorOverview';
import { safeFormatCurrency } from '../../utils/currency';
import { isPremiumVerifiedVendor } from '../../utils/vendorVerification';
import {
  VendorAreaChart,
  VendorCard,
  VendorDashboardSkeleton,
  VendorEmptyState,
  VendorInlineError,
  VendorPageHeader,
  VendorPulseFeed,
  VendorStatTile,
  staggerContainer,
  staggerItem,
} from '../../components/vendor';

export function VendorDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { overview, isLoading, error, refresh } = useVendorOverview();

  const analytics = overview?.analytics;
  const hasProducts = (analytics?.total_products ?? 0) > 0;
  const hasSales = (analytics?.total_orders ?? 0) > 0;

  const allRevenueIsZero = useMemo(
    () => (overview?.daily_metrics ?? []).every((entry) => entry.revenue === 0),
    [overview?.daily_metrics],
  );

  const vendorStatus = user?.vendor?.status ? String(user.vendor.status).replace(/_/g, ' ') : null;

  if (isLoading && !overview) {
    return <VendorDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <VendorPageHeader
        title={user?.vendor?.shop_name || 'Command Center'}
        description="Real-time insights into your store performance."
        badge={
          <>
            {isPremiumVerifiedVendor(user?.vendor) && (
              <VendorVerificationBadge tone="hero" label="Verified" />
            )}
            {vendorStatus && (
              <Badge className="bg-[var(--vendor-accent-action-bg)] text-[var(--vendor-accent-action)] capitalize border-0">
                {vendorStatus}
              </Badge>
            )}
          </>
        }
      />

      {error && (
        <VendorInlineError message={error} onRetry={refresh} />
      )}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <motion.div variants={staggerItem}>
          <VendorStatTile
            title="Total Revenue"
            value={analytics?.total_revenue ?? null}
            subtitle="Revenue from your order items"
            icon={DollarSign}
            accent="success"
            isLoading={isLoading}
            isCurrency
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <VendorStatTile
            title="Total Orders"
            value={analytics?.total_orders ?? null}
            subtitle="Orders containing your products"
            icon={ShoppingBag}
            accent="action"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <VendorStatTile
            title="Products Listed"
            value={analytics?.total_products ?? null}
            subtitle={
              analytics
                ? `${analytics.active_products} active · ${analytics.draft_products} draft`
                : undefined
            }
            icon={Package}
            accent="neutral"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <VendorStatTile
            title="Pending Dropoffs"
            value={analytics?.pending_dropoffs ?? null}
            subtitle={
              analytics
                ? `${analytics.low_stock_count} low stock items`
                : undefined
            }
            icon={Truck}
            accent="warning"
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

      {!isLoading && !hasProducts && (
        <VendorEmptyState
          variant="no-products"
          title="Your store is ready for its first product"
          description="Add your first product to start seeing revenue, orders, and inventory insights here."
          actionLabel="List Your First Product"
          actionOnClick={() => navigate('/vendor/dashboard/products/add')}
        />
      )}

      {!isLoading && hasProducts && !hasSales && (
        <VendorEmptyState
          variant="no-sales"
          title="No sales yet — let's get you selling!"
          description="Your products are live. Share your storefront and watch the Pulse feed come alive."
          actionLabel="View Products"
          actionOnClick={() => navigate('/vendor/dashboard/products')}
        />
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <VendorCard glow className="xl:col-span-2 p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading">Revenue Pulse</h2>
            <p className="text-sm text-[var(--color-text-muted)] vendor-body">Daily revenue · last 30 days</p>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <Skeleton className="w-full h-full rounded-[16px]" />
            ) : allRevenueIsZero ? (
              <div className="w-full h-full rounded-[16px] border border-dashed border-[var(--color-border)] flex items-center justify-center px-6 text-center text-sm text-[var(--color-text-muted)] vendor-body">
                Revenue will appear here once orders start coming in.
              </div>
            ) : (
              <VendorAreaChart
                data={overview?.daily_metrics ?? []}
                gradientId="dashboardRevenueFill"
                strokeColor="var(--vendor-accent-success)"
                height={280}
              />
            )}
          </div>
        </VendorCard>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {isLoading ? (
            <Skeleton className="h-[360px] rounded-[24px]" />
          ) : (
            <VendorPulseFeed
              orders={overview?.recent_orders ?? []}
              lowStockProducts={overview?.low_stock_products ?? []}
            />
          )}
        </motion.div>
      </div>

      {!isLoading && (overview?.low_stock_products.length ?? 0) > 0 && (
        <VendorCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-heading)] vendor-heading">Low Stock Alerts</h2>
              <p className="text-sm text-[var(--color-text-muted)]">{overview?.low_stock_products.length} products need attention</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/vendor/dashboard/products')}
              className="text-sm font-semibold text-[var(--vendor-accent-action)] hover:underline"
            >
              View Inventory
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {overview?.low_stock_products.map((product) => (
              <div
                key={product.id}
                className="rounded-[16px] border border-[var(--vendor-accent-warning)]/30 bg-[var(--vendor-accent-warning-bg)]/30 p-4"
              >
                <p className="font-semibold text-sm text-[var(--color-text-heading)] line-clamp-2">{product.name}</p>
                <p className="text-xs text-[var(--vendor-accent-warning)] font-bold mt-2">{product.stock} units left</p>
              </div>
            ))}
          </div>
        </VendorCard>
      )}

      {!isLoading && analytics && analytics.total_revenue > 0 && (
        <VendorCard className="p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">Today's snapshot</p>
            <p className="text-xl font-bold text-[var(--color-text-heading)] vendor-heading mt-1">
              {safeFormatCurrency(analytics.total_revenue)} lifetime revenue
            </p>
          </div>
        </VendorCard>
      )}
    </div>
  );
}
